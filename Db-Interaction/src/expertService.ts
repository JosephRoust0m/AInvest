import { db } from './database';

export interface Expert {
  id: number;
  username: string;
  passkey: string;
}

export class ExpertService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:7000') {
    this.baseURL = baseURL;
  }

  async getAllExperts() {
    try {
      const query = 'SELECT id, username, passkey FROM experts ORDER BY id ASC';
      const experts = await db.queryRows(query);
      console.log('Fetched experts:', experts);
      return {
        success: true,
        experts: experts
      };
    } catch (error) {
      console.error('Error fetching experts:', error);
      return {
        success: false,
        error: 'Failed to load experts'
      };
    }
  }
}


export const expertService = new ExpertService();