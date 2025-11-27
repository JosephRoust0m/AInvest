import express from 'express';
import cors from 'cors';
import { db } from './database';
import { userService } from './userService';

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
db.connect();

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