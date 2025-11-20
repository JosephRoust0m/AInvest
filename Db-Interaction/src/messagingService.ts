import { db } from './database';

export interface NewMessage {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  timestamp: Date;
}

export class MessagingService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:7000') {
    this.baseURL = baseURL;
  }

  async sendMessageToExpert(expertUsername: string, message: string, username: string) {
    try {
      // Insert message into new_messages table
      const query = `
        INSERT INTO new_messages (sender, recipient, message)
        VALUES ($1, $2, $3)
        RETURNING id, timestamp
      `;
      
      const result = await db.queryOne(query, [username, expertUsername, message]);

      return {
        success: true,
        response: 'Message sent to expert',
        messageId: result.id,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error('Error sending message to expert:', error);
      return {
        success: false,
        error: 'Failed to send message to expert'
      };
    }
  }

  async getExpertMessages(expertUsername: string, username: string) {
    try {
      // Get conversation from conversations table
      const query = `
        SELECT conversation
        FROM conversations 
        WHERE username = $1 AND expert_username = $2
      `;
      
      const conversation = await db.queryOne(query, [username, expertUsername]);

      if (!conversation || !conversation.conversation) {
        return {
          success: true,
          messages: []
        };
      }

      // Parse JSON string stored in database
      let messages = [];
      if (conversation.conversation) {
        if (typeof conversation.conversation === 'string') {
          try {
            messages = JSON.parse(conversation.conversation);
          } catch (parseError) {
            console.error('Error parsing conversation JSON:', parseError);
            messages = [];
          }
        } else if (Array.isArray(conversation.conversation)) {
          messages = conversation.conversation;
        }
      }

      return {
        success: true,
        messages: messages
      };
    } catch (error) {
      console.error('Error fetching expert messages:', error);
      return {
        success: false,
        error: 'Failed to load messages'
      };
    }
  }





  async getAllUserConversations(username: string) {
    try {
      const query = `
        SELECT id, username, expert_username, conversation
        FROM conversations 
        WHERE username = $1
        ORDER BY id DESC
      `;
      
      const conversations = await db.queryRows(query, [username]);

      // Parse JSON conversations
      const parsedConversations = conversations.map(conv => ({
        ...conv,
        conversation: typeof conv.conversation === 'string' 
          ? (() => {
              try {
                return JSON.parse(conv.conversation);
              } catch (e) {
                console.error('Error parsing conversation JSON:', e);
                return [];
              }
            })()
          : (Array.isArray(conv.conversation) ? conv.conversation : [])
      }));

      return {
        success: true,
        conversations: parsedConversations
      };
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return {
        success: false,
        error: 'Failed to fetch conversations'
      };
    }
  }

  async getAllExpertConversations(expertUsername: string) {
    try {
      console.log('Getting all expert conversations for:', expertUsername);
      const query = `
        SELECT id, username, expert_username, conversation
        FROM conversations 
        WHERE expert_username = $1
        ORDER BY id DESC
      `;
      
      const conversations = await db.queryRows(query, [expertUsername]);

      // Parse JSON conversations
      const parsedConversations = conversations.map(conv => ({
        ...conv,
        conversation: typeof conv.conversation === 'string' 
          ? (() => {
              try {
                return JSON.parse(conv.conversation);
              } catch (e) {
                console.error('Error parsing conversation JSON:', e);
                return [];
              }
            })()
          : (Array.isArray(conv.conversation) ? conv.conversation : [])
      }));

      return {
        success: true,
        conversations: parsedConversations
      };
    } catch (error) {
      console.error('Error fetching expert conversations:', error);
      return {
        success: false,
        error: 'Failed to fetch expert conversations'
      };
    }
  }

  async isNewConversation(username: string, expertUsername: string): Promise<boolean> {
    try {
      const existingQuery = `
        SELECT id FROM conversations 
        WHERE username = $1 AND expert_username = $2
      `;
      
      const existing = await db.queryOne(existingQuery, [username, expertUsername]);
      return !existing; // Returns true if no existing conversation found
    } catch (error) {
      console.error('Error checking if conversation is new:', error);
      return true; // Default to new conversation on error
    }
  }

  async saveConversation(username: string, expertUsername: string, messages: any[]) {
    try {
      // Check if conversation already exists using the key-value pair
      const isNew = await this.isNewConversation(username, expertUsername);
      console.log(`Conversation between username: ${username} and expertUsername: ${expertUsername} is ${isNew ? 'NEW' : 'EXISTING'}`);
      
      const existingQuery = `
        SELECT id, conversation FROM conversations 
        WHERE username = $1 AND expert_username = $2
      `;
      
      const existing = await db.queryOne(existingQuery, [username, expertUsername]);
      
      // If updating existing conversation, check for message duplicates
      if (existing && messages.length > 0) {
        try {
          const existingMessages = JSON.parse(existing.conversation || '[]');
          const newMessagesFiltered: any[] = [];
          
          for (const newMsg of messages) {
            let isDuplicate = false;
            
            for (const existingMsg of existingMessages) {
              // Check for duplicate based on ID or timestamp + sender combination
              const sameId = newMsg.id && existingMsg.id && newMsg.id === existingMsg.id;
              const sameTimestampAndSender = newMsg.timestamp && existingMsg.timestamp && 
                                           newMsg.sender && existingMsg.sender &&
                                           Math.abs(new Date(newMsg.timestamp).getTime() - new Date(existingMsg.timestamp).getTime()) < 1000 &&
                                           newMsg.sender === existingMsg.sender;
              
              if (sameId || sameTimestampAndSender) {
                isDuplicate = true;
                if (sameId) {
                  console.log(`Duplicate message detected by ID: ${newMsg.id}`);
                } else {
                  console.log(`Duplicate message detected by timestamp and sender: ${newMsg.timestamp}, ${newMsg.sender}`);
                }
                break;
              }
            }
            
            if (!isDuplicate) {
              newMessagesFiltered.push(newMsg);
            }
          }
          
          if (newMessagesFiltered.length === 0) {
            console.log(`No new messages to save for conversation between ${username} and ${expertUsername}`);
            return {
              success: true,
              conversationId: existing.id,
              duplicatesSkipped: messages.length
            };
          }
          
          // Merge existing messages with new non-duplicate messages
          const allMessages = [...existingMessages, ...newMessagesFiltered];
          messages = allMessages;
          
          console.log(`Filtered ${messages.length - newMessagesFiltered.length} duplicate messages, saving ${newMessagesFiltered.length} new messages`);
        } catch (parseError) {
          console.error('Error parsing existing conversation JSON, proceeding with new messages:', parseError);
        }
      }
      
      let query: string;
      let params: any[];
      
      if (existing) {
        // Update existing conversation
        query = `
          UPDATE conversations 
          SET conversation = $3
          WHERE username = $1 AND expert_username = $2
          RETURNING id
        `;
        params = [username, expertUsername, JSON.stringify(messages)];
      } else {
        // Insert new conversation
        query = `
          INSERT INTO conversations (username, expert_username, conversation)
          VALUES ($1, $2, $3)
          RETURNING id
        `;
        params = [username, expertUsername, JSON.stringify(messages)];
      }
      
      const result = await db.queryOne(query, params);

      return {
        success: true,
        conversationId: result.id
      };
    } catch (error) {
      console.error('Error saving conversation:', error);
      return {
        success: false,
        error: 'Failed to save conversation'
      };
    }
  }

  async processNewMessages() {
    try {
      // Get all new messages
      const newMessages = await db.queryRows(
        'SELECT id, sender, recipient, message, timestamp FROM new_messages ORDER BY timestamp ASC'
      );

      if (newMessages.length === 0) {
        return { success: true, processed: 0 };
      }

      for (const msg of newMessages) {
        try {
          // Discard messages with ID < 1000000000 (double messages)
          if (msg.id < 1000000000) {
            console.log(`Discarding message with ID ${msg.id} (< 1000000000) - double message`);
            await db.query('DELETE FROM new_messages WHERE id = $1', [msg.id]);
            continue;
          }

          // Determine user and expert by checking if sender is an expert
          let username: string;
          let expertUsername: string;
          
          // Check if sender is an expert by querying the experts table
          const senderIsExpert = await db.queryOne(
            'SELECT username FROM experts WHERE username = $1',
            [msg.sender]
          );
          
          // Check if recipient is an expert by querying the experts table  
          const recipientIsExpert = await db.queryOne(
            'SELECT username FROM experts WHERE username = $1',
            [msg.recipient]
          );
          
          if (senderIsExpert && !recipientIsExpert) {
            // Sender is expert, recipient is user
            expertUsername = msg.sender;
            username = msg.recipient;
            console.log(`Expert ${expertUsername} sending message to user ${username}`);
          } else if (recipientIsExpert && !senderIsExpert) {
            // Recipient is expert, sender is user
            username = msg.sender;
            expertUsername = msg.recipient;
            console.log(`User ${username} sending message to expert ${expertUsername}`);
          } else if (senderIsExpert && recipientIsExpert) {
            // Both are experts - this shouldn't happen in normal flow
            console.warn(`Both sender ${msg.sender} and recipient ${msg.recipient} are experts - using sender as expert`);
            expertUsername = msg.sender;
            username = msg.recipient;
          } else {
            // Neither is found in experts table, fallback to original logic
            console.warn(`Neither sender ${msg.sender} nor recipient ${msg.recipient} found in experts table, using fallback logic`);
            if (msg.sender.includes('@')) {
              username = msg.sender;
              expertUsername = msg.recipient;
            } else {
              username = msg.recipient;
              expertUsername = msg.sender;
            }
          }

          // Check if conversation exists between username and expertUsername
          const existingConvo = await db.queryOne(
            'SELECT id, conversation FROM conversations WHERE username = $1 AND expert_username = $2',
            [username, expertUsername]
          );

          let updatedMessages = [];
          let isNewConversation = false;

          if (existingConvo && existingConvo.conversation) {
            console.log(`Found existing conversation between username: ${username} and expertUsername: ${expertUsername}`);
            console.log('Existing conversation type:', typeof existingConvo.conversation);
            console.log('Existing conversation value:', existingConvo.conversation);
            
            // Handle different formats that might exist in database
            if (Array.isArray(existingConvo.conversation)) {
              updatedMessages = existingConvo.conversation;
            } else if (typeof existingConvo.conversation === 'string') {
              // Handle legacy stringified JSON
              try {
                const parsed = JSON.parse(existingConvo.conversation);
                if (Array.isArray(parsed)) {
                  updatedMessages = parsed;
                } else {
                  console.warn('Parsed conversation is not an array, starting fresh');
                  updatedMessages = [];
                }
              } catch (parseError) {
                console.error('Failed to parse legacy conversation string:', parseError);
                updatedMessages = [];
              }
            } else {
              console.warn('Invalid conversation format, starting fresh. Type:', typeof existingConvo.conversation);
              updatedMessages = [];
            }
          } else {
            console.log(`Creating new conversation between username: ${username} and expertUsername: ${expertUsername}`);
            isNewConversation = true;
            updatedMessages = [];
          }

        // Check if message with same ID or timestamp (within 1 second) already exists to prevent duplicates
        let messageExists = false;
        let duplicateType = '';
        
        for (const existingMsg of updatedMessages) {
          // Check for duplicate based on ID or timestamp + sender combination
          const sameId = msg.id && existingMsg.id && msg.id === existingMsg.id;
          const sameTimestampAndSender = msg.timestamp && existingMsg.timestamp && 
                                       msg.sender && existingMsg.sender &&
                                       Math.abs(new Date(msg.timestamp).getTime() - new Date(existingMsg.timestamp).getTime()) < 1000 &&
                                       msg.sender === existingMsg.sender;
          
          if (sameId || sameTimestampAndSender) {
            messageExists = true;
            duplicateType = sameId ? 'ID' : 'timestamp and sender';
            break;
          }
        }

        if (messageExists) {
          console.log(`Message with ${duplicateType} ${duplicateType === 'ID' ? msg.id : `${msg.timestamp}, ${msg.sender}`} already exists, skipping...`);
          // Delete the duplicate from new_messages table
          await db.query('DELETE FROM new_messages WHERE id = $1', [msg.id]);
          continue;
        }

        // Add new message to conversation
        updatedMessages.push({
          id: msg.id,
          sender: msg.sender,
          recipient: msg.recipient,
          message: msg.message,
          timestamp: msg.timestamp
        });

        if (isNewConversation) {
          // Create new conversation - explicitly stringify for JSON column
          console.log(`Inserting new conversation for username: ${username}, expertUsername: ${expertUsername}`);
          await db.query(
            'INSERT INTO conversations (username, expert_username, conversation) VALUES ($1, $2, $3)',
            [username, expertUsername, JSON.stringify(updatedMessages)]
          );
        } else {
          // Update existing conversation - explicitly stringify for JSON column
          console.log(`Updating existing conversation for username: ${username}, expertUsername: ${expertUsername}`);
          await db.query(
            'UPDATE conversations SET conversation = $1 WHERE id = $2',
            [JSON.stringify(updatedMessages), existingConvo.id]
          );
        }

          // Delete processed message from new_messages
          await db.query('DELETE FROM new_messages WHERE id = $1', [msg.id]);
        } catch (msgError) {
          console.error(`Error processing message ${msg.id}:`, msgError);
          // Continue with next message
        }
      }

      console.log(`Processed ${newMessages.length} new messages`);
      return { success: true, processed: newMessages.length };
    } catch (error) {
      console.error('Error processing new messages:', error);
      return { success: false, error: 'Failed to process new messages' };
    }
  }

  startMessageProcessor() {
    // Process messages immediately
    this.processNewMessages();
    
    // Then process every 5 seconds
    setInterval(() => {
      this.processNewMessages();
    }, 5000);
    
    console.log('Message processor started - running every 5 seconds');
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
