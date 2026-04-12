import express from 'express';
import cors from 'cors';
import { createClerkClient } from '@clerk/backend';
import { clerkMiddleware } from '@clerk/express'
import { getAuth } from '@clerk/express';
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT || 4000;

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

const DB_SERVICE_URL = process.env.DB_SERVICE_URL;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Auth middleware: verifies Clerk JWT, fetches user, attaches to request
const authenticate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization token provided' });
  }

  try {

  const { userId } = getAuth(req)


    if (!userId) {
      return res.status(401).json({ message: 'Invalid token: missing user ID' });
    }

    const user = await clerk.users.getUser(userId);

    (req as any).clerkUser = user;
    (req as any).clerkUserId = userId;

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Forward a request to a downstream service
const forwardRequest = async (
  targetUrl: string,
  req: express.Request,
  res: express.Response
) => {
  try {
    const options: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Secret': process.env.GATEWAY_SECRET || '',
      },
    };

    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return res.status(response.status).json({ message: text || 'Downstream service error' });
    }
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Forward error to ${targetUrl}:`, error);
    res.status(502).json({ message: 'Downstream service unavailable' });
  }
};

// ── AI Service Routes ─────────────────────────────────────────────────────────

app.post('/api/chat', authenticate, (req, res) => {
  forwardRequest(`${AI_SERVICE_URL}/api/chat`, req, res);
});

app.post('/api/predict', authenticate, (req, res) => {
  forwardRequest(`${AI_SERVICE_URL}/api/predict`, req, res);
});

// ── DB Service Routes ─────────────────────────────────────────────────────────

app.get('/api/advisor', authenticate, (req, res) => {
  forwardRequest(`${DB_SERVICE_URL}/api/advisor`, req, res);
});

app.get('/api/advisor/conversations', authenticate, (req, res) => {
  const username = req.query.username;
  forwardRequest(`${DB_SERVICE_URL}/api/advisor/conversations?username=${username}`, req, res);
});

app.post('/api/advisor/logout-timestamp', authenticate, (req, res) => {
  forwardRequest(`${DB_SERVICE_URL}/api/advisor/logout-timestamp`, req, res);
});

app.get('/api/user/conversations', authenticate, (req, res) => {
  const username = req.query.username;
  forwardRequest(`${DB_SERVICE_URL}/api/user/conversations?username=${username}`, req, res);
});

app.post('/api/user/logout-timestamp', authenticate, (req, res) => {
  forwardRequest(`${DB_SERVICE_URL}/api/user/logout-timestamp`, req, res);
});

app.post('/api/conversations/save', authenticate, (req, res) => {
  forwardRequest(`${DB_SERVICE_URL}/api/conversations/save`, req, res);
});

// ── Chat Service Routes ───────────────────────────────────────────────────────

app.post('/api/message', authenticate, (req, res) => {
  forwardRequest(`${CHAT_SERVICE_URL}/api/message`, req, res);
});

// ── Health Check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

export default app;
