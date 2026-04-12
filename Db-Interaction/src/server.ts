import express from 'express';
import cors from 'cors';
import { createClerkClient } from '@clerk/backend';
import { db } from './database';
import { userService } from './userService';
import { advisorService } from './advisorService';
import { conversationService } from './conversationService';

const app = express();
const PORT = process.env.PORT;

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

// ── Gateway secret middleware ──────────────────────────────────────────────────
// All routes except /health and /api/webhooks/clerk must come from the gateway
const requireGateway = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secret = req.headers['x-gateway-secret'];
  if (!secret || secret !== process.env.GATEWAY_SECRET) {
    return res.status(403).json({ message: 'Access denied: requests must originate from the API gateway' });
  }
  next();
};

app.use(cors());

// Webhook route needs raw body for svix signature verification — registered before express.json()
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ message: 'Missing svix headers' });
  }

  let payload: any;
  try {
    const { Webhook } = await import('svix');
    const wh = new Webhook(WEBHOOK_SECRET);
    payload = wh.verify(req.body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const { type, data } = payload as { type: string; data: any };

  if (type === 'user.created') {
    try {
      const email = data.email_addresses?.[0]?.email_address;
      const username = data.username || data.first_name || email;
      await userService.createUserFromWebhook({ clerkId: data.id, username, email });
      await clerkClient.users.updateUserMetadata(data.id, {
        publicMetadata: { role: 'user' },
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error creating user from webhook:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  } else {
    res.json({ received: true });
  }
});

app.use(express.json());
db.connect();

// ── All routes below require gateway secret ───────────────────────────────────

app.get('/api/advisor', requireGateway, async (req, res) => {
  try {
    const advisors = await advisorService.fetchAdvisors();
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch advisors' });
  }
});

app.get('/api/user/last-logout', requireGateway, async (req, res) => {
  try {
    const result = await userService.fetchLastLogout(String(req.query.username));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch last logout' });
  }
});

app.get('/api/user/conversations', requireGateway, async (req, res) => {
  try {
    const users = await userService.fetchUsersConversation(String(req.query.username));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch users' });
  }
});

app.get('/api/advisor/last-logout', requireGateway, async (req, res) => {
  try {
    const result = await advisorService.fetchLastLogout(String(req.query.username));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch last logout' });
  }
});

app.get('/api/advisor/conversations', requireGateway, async (req, res) => {
  try {
    const advisors = await advisorService.fetchAdvisorsConversation(String(req.query.username));
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch advisors' });
  }
});

app.post('/api/user/logout-timestamp', requireGateway, async (req, res) => {
  try {
    const result = await userService.sendLogoutTimestamp(req.body.username);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to record logout timestamp' });
  }
});

app.post('/api/advisor/logout-timestamp', requireGateway, async (req, res) => {
  try {
    const result = await advisorService.sendLogoutTimestamp(req.body.username);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to record logout timestamp' });
  }
});

app.post('/api/conversations/save', requireGateway, async (req, res) => {
  try {
    const { conversations } = req.body;
    await conversationService.saveConversations(conversations);
    res.json({ success: true, message: 'Conversations saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to save conversations' });
  }
});

app.post('/api/save-message', requireGateway, async (req, res) => {
  try {
    const message = req.body;
    await conversationService.addMessageToConversation(message);
    res.json({ success: true, message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to save message' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await db.disconnect();
  process.exit(0);
});

export default app;
