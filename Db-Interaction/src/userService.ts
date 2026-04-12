import bcrypt from 'bcrypt';
import { db } from './database';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  last_logout?: Date;
}


export class UserService {

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain text password with a hashed password
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Error comparing password:', error);
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Authenticate user against database
   */
  async authenticateUser(email: string, plainPassword: string): Promise<boolean> {
    try {
      // Get user from database
      const query = 'SELECT password FROM users WHERE email = $1';
      const user = await db.queryOne(query, [email]);
      
      if (!user) {
        return false;
      }

      // Compare password
      return await this.comparePassword(plainPassword, user.password);
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async signIn(credentials: SignInCredentials) {
    try {
      // Get user from database
      const query = 'SELECT * FROM users WHERE email = $1';
      const user = await db.queryOne(query, [credentials.email]);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Compare password
      const isValidPassword = await this.comparePassword(credentials.password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      // Generate a simple token (in production, use JWT)
      const token = `auth_${user.id}_${Date.now()}`;
      
      // Store the authentication token if localStorage is available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token);
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token: token,
        _token: token
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(userData: SignUpData) {
    try {
      // Check if email already exists
      const emailExists = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE email = $1', [userData.email]);
      if (parseInt(emailExists.count) > 0) {
        throw new Error('Email already exists');
      }

      // Check if username already exists
      const usernameExists = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE username = $1', [userData.username]);
      if (parseInt(usernameExists.count) > 0) {
        throw new Error('Username already exists');
      }

      // Hash the password
      const hashedPassword = await this.hashPassword(userData.password);
      
      // Create user in database
      const query = `
        INSERT INTO users (email, username, password)
        VALUES ($1, $2, $3)
        RETURNING id, email, username
      `;
      
      const params = [userData.email, userData.username, hashedPassword];
      
      const user = await db.queryOne(query, params);

      // Generate a simple token (in production, use JWT)
      const token = `auth_${user.id}_${Date.now()}`;
      
      // Store the authentication token if localStorage is available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token);
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token: token,
        _token: token
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }


  async sendLogoutTimestamp(username:string) {
    try {
      // Get user by username
      const user = await db.queryOne('SELECT id FROM users WHERE username = $1', [username]);
      if (!user) {
        throw new Error('User not found');
      }

      // Update logout timestamp in database
      const query = `
        UPDATE users 
        SET last_logout = $1 
        WHERE username = $2
        RETURNING id, username
      `;
      
      const result = await db.queryOne(query, [new Date(), username]);
      
      if (!result) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Logout timestamp recorded'
      };
    } catch (error) {
      console.error('Error sending logout timestamp:', error);
      return {
        success: false,
        error: 'Failed to record logout timestamp'
      };
    }
  }

  async fetchLastLogout(username: string): Promise<{ lastLogout: Date | null }> {
    const user = await db.queryOne('SELECT last_logout FROM users WHERE username = $1', [username]);
    return { lastLogout: user?.last_logout ?? null };
  }

  async fetchUsersConversation(username: string): Promise<User[]> {
    const query = 'SELECT * FROM conversations Where user_username=$1';
    const conversations = await db.queryMany(query, [username]);
    return conversations;
  }

  async createUserFromWebhook({ clerkId, username, email }: { clerkId: string; username: string; email: string }) {
    try {
      // Idempotent: skip if user already exists by email
      const existing = await db.queryOne('SELECT id FROM users WHERE email = $1', [email]);
      if (existing) {
        return existing;
      }

      const query = `
        INSERT INTO users (email, username, password)
        VALUES ($1, $2, $3)
        RETURNING id, email, username
      `;
      // Password is not used for Clerk-managed users; store a sentinel value
      const result = await db.queryOne(query, [email, username, `__clerk__${clerkId}`]);
      return result;
    } catch (error) {
      console.error('Error creating user from webhook:', error);
      throw error;
    }
  }

  validatePassword(password: string, confirmPassword?: string) {
    if (confirmPassword && password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  }

  validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    return true;
  }


}

// Export singleton instance
export const userService = new UserService();