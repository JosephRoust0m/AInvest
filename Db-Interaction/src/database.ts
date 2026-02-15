import dotenv from 'dotenv';
import { Pool, Client, PoolConfig } from 'pg';

// Load environment variables from .env file
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionString?: string;
}

class DatabaseConnection {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || '',
      user: process.env.DATABASE_USER || '',
      password: process.env.DATABASE_PASSWORD || '',
      connectionString: process.env.DATABASE_URL
    };
  }

  async connect(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    try {
      const poolConfig: PoolConfig =  
          {
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.user,
            password: this.config.password,
            ssl: {
              rejectUnauthorized: false,
            },
          };

      this.pool = new Pool(poolConfig);
      // Test the connection
      const client = await this.pool.connect();
      client.release();

      console.log('Database connected successfully');
      return this.pool;
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database disconnected');
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      await this.connect();
    }

    try {
      const result = await this.pool!.query(text, params);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async queryRows(text: string, params?: any[]): Promise<any[]> {
    const result = await this.query(text, params);
    return result.rows;
  }

  async queryOne(text: string, params?: any[]): Promise<any | null> {
    const rows = await this.queryRows(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async queryMany(text: string, params?: any[]): Promise<any[]> {
    const rows = await this.queryRows(text, params);
    return rows;
  }
}

// Global database instance
export const db = new DatabaseConnection();
export default db;