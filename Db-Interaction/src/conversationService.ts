import { randomUUID } from 'crypto';
import db from './database';

export interface Message {
  id?: number;
  sender: string;
  receiver: string;
  timestamp: number;
  text: string;
}

export interface Conversation {
  id?: number;
  user_username: string;
  advisor_username: string;
  conversation: Message[];
}

class ConversationService {
  async saveConversations(conversations: Conversation[]): Promise<void> {
    for (const convo of conversations) {
      if (!convo.id) {
        convo.id = Math.floor(Math.random() * 1000000);
        await db.queryOne(
          `INSERT INTO conversations (id, user_username, advisor_username, conversation) VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET user_username = $2, advisor_username = $3, conversation = $4 RETURNING id`,
          [convo.id, convo.user_username, convo.advisor_username, convo.conversation]
        );
      } else {
        await db.queryOne(
          `UPDATE conversations SET user_username = $2, advisor_username = $3, conversation = $4
           WHERE id = $1 RETURNING id`,
          [convo.id, convo.user_username, convo.advisor_username, convo.conversation]
        );
      }
    }
  }

  async addMessageToConversation(message: {
    id?: number;
    sender: string;
    receiver: string;
    timestamp: number;
    text: string;
  }): Promise<void> {

    const convo = await db.queryOne(
      `SELECT * FROM conversations WHERE user_username = $1 AND advisor_username = $2`,
      [message.sender, message.receiver]
    );

    const convoSwitched = await db.queryOne( 
            `SELECT * FROM conversations WHERE user_username = $1 AND advisor_username = $2`,
      [message.receiver, message.sender]
    );
    const msg: Message = {
      id: message.id || Math.floor(Math.random() * 1000000000),
      sender: message.sender,
      receiver: message.receiver,
      timestamp: message.timestamp,
      text: message.text,
    };

    if (convo) {
      // Append message to existing conversation
      const updatedConversation = [...convo.conversation, msg];
      await db.queryOne(
        `UPDATE conversations SET conversation = $1 WHERE id = $2`,
        [JSON.stringify(updatedConversation), convo.id]
      );
    } else if (convoSwitched) {
      // Append message to existing conversation
      const updatedConversation = [...convoSwitched.conversation, msg];
      await db.queryOne(
        `UPDATE conversations SET conversation = $1 WHERE id = $2`,
        [JSON.stringify(updatedConversation), convoSwitched.id]
      );

    } else {
      // Create new conversation
      const newConvo: Conversation = {
        id: Math.floor(Math.random() * 1000000),
        user_username: message.sender,
        advisor_username: message.receiver,
        conversation: [msg],
      };
      await db.queryOne(
        `INSERT INTO conversations (id, user_username, advisor_username, conversation) VALUES ($1, $2, $3, $4)`,
        [newConvo.id, newConvo.user_username, newConvo.advisor_username, JSON.stringify(newConvo.conversation)]
      );
    }
  }
}

export const conversationService = new ConversationService();