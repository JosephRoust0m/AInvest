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
  last_closed_user?: number | null;
  last_closed_advisor?: number | null;
}

class ConversationService {
  async saveConversations(conversations: Conversation[]): Promise<void> {
    for (const convo of conversations) {
      if (!convo.id) {
        convo.id = Math.floor(Math.random() * 1000000);
        await db.queryOne(
          `INSERT INTO conversations (id, user_username, advisor_username, conversation, last_closed_user, last_closed_advisor)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET user_username = $2, advisor_username = $3, conversation = $4,
             last_closed_user = $5, last_closed_advisor = $6
           RETURNING id`,
          [convo.id, convo.user_username, convo.advisor_username, convo.conversation,
           convo.last_closed_user ?? null, convo.last_closed_advisor ?? null]
        );
      } else {
        await db.queryOne(
          `UPDATE conversations SET user_username = $2, advisor_username = $3, conversation = $4,
             last_closed_user = $5, last_closed_advisor = $6
           WHERE id = $1 RETURNING id`,
          [convo.id, convo.user_username, convo.advisor_username, convo.conversation,
           convo.last_closed_user ?? null, convo.last_closed_advisor ?? null]
        );
      }
    }
  }

  async updateLastClosed(updates: Array<{ id: number; last_closed_user?: number | null; last_closed_advisor?: number | null }>): Promise<void> {
    for (const update of updates) {
      await db.queryOne(
        `UPDATE conversations SET last_closed_user = $2, last_closed_advisor = $3 WHERE id = $1`,
        [update.id, update.last_closed_user ?? null, update.last_closed_advisor ?? null]
      );
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