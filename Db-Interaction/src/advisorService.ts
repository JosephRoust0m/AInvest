import { db } from './database';

export interface AdvisorSignInCredentials {
  username: string;
  password: string;
}

export interface Advisor {
  id: number;
  username: string;
  password: string;
  last_logout?: Date;
}

export class AdvisorService {

  async signIn(credentials: AdvisorSignInCredentials) {
    try {
      // Get advisor from database
      const query = 'SELECT * FROM advisors WHERE username = $1';
      const advisor = await db.queryOne(query, [credentials.username]);
      
      if (!advisor) {
        throw new Error('User not found');
      }

      // Compare password
      if (credentials.password !== advisor.password) {
        throw new Error('Invalid password');
      }

      // Generate a simple token (in production, use JWT)
      const token = `auth_${advisor.id}_${Date.now()}`;
      
      // Store the authentication token if localStorage is available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token);
      }

      return {
        success: true,
        user: {
          id: advisor.id,
          email: advisor.email,
          username: advisor.username
        },
        token: token,
        _token: token
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async sendLogoutTimestamp(username:string) {
    try {
      // Get advisor by username
      const advisor = await db.queryOne('SELECT id FROM advisors WHERE username = $1', [username]);
      if (!advisor) {
        throw new Error('User not found');
      }

      // Update logout timestamp in database
      const query = `
        UPDATE advisors 
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
    const advisor = await db.queryOne('SELECT last_logout FROM advisors WHERE username = $1', [username]);
    return { lastLogout: advisor?.last_logout ?? null };
  }

  async fetchAdvisors(): Promise<Advisor[]> {
    const query = 'SELECT * FROM advisors';
    const result = await db.queryRows(query);
    return result;

    }
  async fetchAdvisorsConversation(username: string): Promise<Advisor[]> {
    const query = 'SELECT * FROM conversations Where advisor_username=$1';
    const conversations = await db.queryMany(query, [username]);
    return conversations;
  }
}

// Export singleton instance
export const advisorService = new AdvisorService();