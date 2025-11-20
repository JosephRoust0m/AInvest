import express from 'express';
import cors from 'cors';
import { db } from './database';
import { userService } from './userService';
import { expertService } from './expertService';
import { messagingService } from './messagingService';

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
db.connect().then(() => {
  // Start background message processor after database is connected
  messagingService.startMessageProcessor();
}).catch(console.error);

// User Authentication Routes
app.post('/api/sign-in', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await userService.signIn({ email, password });
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : 'Sign in failed' });
  }
});

app.post('/api/sign-up', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Validate email and password
    userService.validateEmail(email);
    userService.validatePassword(password);


    const result = await userService.signUp({ username, email, password });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Sign up failed' });
  }
});

app.post('/api/user/logout-timestamp', async (req, res) => {
  try {
    const result = await userService.sendLogoutTimestamp(req.body.username);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to record logout timestamp' });
  }
});


app.get('/api/user/last-logout', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Username parameter is required' });
    }

    const result = await userService.getUserLastLogout(username);
    if (result.success) {
      res.json({ lastLogout: result.lastLogout });
    } else {
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch last logout time' });
  }
});

// Messaging Routes
app.post('/api/experts/:expertUsername/message', async (req, res) => {
  try {
    const { expertUsername } = req.params;
    const { message, username } = req.body;
    
    if (!message || !username) {
      return res.status(400).json({ message: 'Message and username are required' });
    }

    const result = await messagingService.sendMessageToExpert(expertUsername, message, username);
    if (result.success) {
      res.json({ response: result.response, messageId: result.messageId, timestamp: result.timestamp });
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to send message to expert' });
  }
});

app.get('/api/experts/:expertUsername/messages', async (req, res) => {
  try {
    const { expertUsername } = req.params;
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'username parameter is required' });
    }

    const result = await messagingService.getExpertMessages(expertUsername, username);
    console.log(result);
    if (result.success) {
      res.json(result.messages);
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to load messages' });
  }
});



// Conversation Routes
app.get('/api/conversations/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ message: 'username parameter is required' });
    }

    const result = await messagingService.getAllUserConversations(username);
    console.log(result)
    if (result.success) {
      res.json({ conversations: result.conversations });
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch conversations' });
  }
});

app.get('/api/conversations/expert/:expertUsername', async (req, res) => {
  try {
    const { expertUsername } = req.params;
    
    if (!expertUsername) {
      return res.status(400).json({ message: 'expertUsername parameter is required' });
    }

    const result = await messagingService.getAllExpertConversations(expertUsername);
    if (result.success) {
      res.json({ conversations: result.conversations });
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch expert conversations' });
  }
});

app.post('/api/conversations/save', async (req, res) => {
  try {
    const { username, expertUsername, messages } = req.body;
    
    if (!username || !expertUsername || !messages) {
      return res.status(400).json({ message: 'username, expertUsername, and messages are required' });
    }

    const result = await messagingService.saveConversation(username, expertUsername, messages);
    if (result.success) {
      res.json({ conversationId: result.conversationId });
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to save conversation' });
  }
});

// Expert Authentication Routes
app.post('/api/expert/sign-in', async (req, res) => {
  try {
    const { username, passkey } = req.body;
    
    if (!username || !passkey) {
      return res.status(400).json({ message: 'Username and passkey are required' });
    }

    const result = await userService.expertSignIn({ username, passkey });
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : 'Expert sign in failed' });
  }
});

app.post('/api/expert/logout-timestamp', async (req, res) => {
  try {
    const { expertUsername } = req.body;
    
    if (!expertUsername) {
      return res.status(400).json({ message: 'Expert username is required' });
    }

    const result = await userService.sendExpertLogoutTimestamp(expertUsername);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to record expert logout timestamp' });
  }
});

app.get('/api/expert/last-logout', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Username parameter is required' });
    }

    const result = await userService.getExpertLastLogout(username);
    if (result.success) {
      res.json({ last_logout: result.lastLogout });
    } else {
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch expert last logout time' });
  }
});

// Expert Routes
app.get('/api/experts', async (req, res) => {
  try {
    const result = await expertService.getAllExperts();
    if (result.success) {
      res.json(result.experts);
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch experts' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(7000, () => {
  console.log(`🚀 Server running on port 7000`);
  console.log(`📊 Health check: http://localhost:7000/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

export default app;