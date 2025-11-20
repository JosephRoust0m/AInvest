import { messagingService } from '../messagingService';
import { db } from '../database';

jest.mock('../database', () => ({
  db: {
    queryOne: jest.fn(),
    queryRows: jest.fn(),
    query: jest.fn()
  }
}));

const mockedDb = db as unknown as { queryOne: jest.Mock; queryRows: jest.Mock; query: jest.Mock };

beforeEach(() => {
  jest.resetAllMocks();
});

// 1) sendMessageToExpert
test('sendMessageToExpert should insert message and return success', async () => {
  const mockResult = { id: 123, timestamp: '2025-11-15T10:30:00.000Z' };
  mockedDb.queryOne.mockResolvedValueOnce(mockResult);

  const result = await messagingService.sendMessageToExpert('expertUser123', 'Hello expert', 'user@example.com');

  expect(result.success).toBe(true);
  expect(result.response).toBe('Message sent to expert');
  expect(result.messageId).toBe(123);
  expect(result.timestamp).toBe('2025-11-15T10:30:00.000Z');
  expect(mockedDb.queryOne).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO new_messages'),
    ['user@example.com', 'expertUser123', 'Hello expert']
  );
});

// 2) getExpertMessages
test('getExpertMessages should return conversation from conversations table', async () => {
  const mockConversation = {
    conversation: JSON.stringify([
      { id: 1, sender: 'user@example.com', recipient: 'expertUser123', message: 'Hello', timestamp: '2025-11-15T10:00:00.000Z' },
      { id: 2, sender: 'expertUser123', recipient: 'user@example.com', message: 'Hi back', timestamp: '2025-11-15T10:05:00.000Z' }
    ])
  };

  mockedDb.queryOne.mockResolvedValueOnce(mockConversation);

  const result = await messagingService.getExpertMessages('expertUser123', 'user@example.com');

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.messages).toHaveLength(2);
    expect(result.messages![0].sender).toBe('user@example.com');
    expect(result.messages![1].sender).toBe('expertUser123');
  }
  expect(mockedDb.queryOne).toHaveBeenCalledWith(
    expect.stringContaining('FROM conversations'),
    ['user@example.com', 'expertUser123']
  );
});



// Error handling tests
test('sendMessageToExpert should handle database errors', async () => {
  mockedDb.queryOne.mockRejectedValueOnce(new Error('Database error'));

  const result = await messagingService.sendMessageToExpert('expertUser123', 'Hello', 'user1');

  expect(result.success).toBe(false);
  expect(result.error).toBe('Failed to send message to expert');
});

test('getExpertMessages should handle database errors', async () => {
  mockedDb.queryOne.mockRejectedValueOnce(new Error('Database error'));

  const result = await messagingService.getExpertMessages('expertUser123', 'user@example.com');

  expect(result.success).toBe(false);
  expect(result.error).toBe('Failed to load messages');
});

// Conversation tests
test('getAllUserConversations should return user conversations', async () => {
  const mockConversations = [
    { id: 1, username: 'user@example.com', expert_username: 'expertUser1', conversation: [{ message: 'Hello', sender: 'user@example.com' }] },
    { id: 2, username: 'user@example.com', expert_username: 'expertUser2', conversation: [{ message: 'Hi there', sender: 'user@example.com' }] }
  ];

  mockedDb.queryRows.mockResolvedValueOnce(mockConversations);

  const result = await messagingService.getAllUserConversations('user@example.com');

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.conversations).toHaveLength(2);
    expect(result.conversations![0].username).toBe('user@example.com');
    expect(result.conversations![1].expert_username).toBe('expertUser2');
  }
  expect(mockedDb.queryRows).toHaveBeenCalledWith(
    expect.stringContaining('WHERE username = $1'),
    ['user@example.com']
  );
});

test('saveConversation should create new conversation when none exists', async () => {
  const mockMessages = [{ message: 'Hello', sender: 'user@example.com', timestamp: '2025-11-15T10:00:00.000Z' }];
  
  // Mock isNewConversation check - no existing conversation
  mockedDb.queryOne.mockResolvedValueOnce(null);
  // Mock existing conversation check for saveConversation
  mockedDb.queryOne.mockResolvedValueOnce(null);
  // Mock successful insert
  mockedDb.queryOne.mockResolvedValueOnce({ id: 123 });

  const result = await messagingService.saveConversation('user@example.com', 'expertUser1', mockMessages);

  expect(result.success).toBe(true);
  expect(result.conversationId).toBe(123);
  expect(mockedDb.queryOne).toHaveBeenCalledTimes(3);
  expect(mockedDb.queryOne).toHaveBeenLastCalledWith(
    expect.stringContaining('INSERT INTO conversations'),
    ['user@example.com', 'expertUser1', JSON.stringify(mockMessages)]
  );
});

test('saveConversation should update existing conversation', async () => {
  const mockMessages = [{ message: 'Updated message', sender: 'user@example.com', timestamp: '2025-11-15T11:00:00.000Z' }];
  
  // Mock isNewConversation check - existing conversation found
  mockedDb.queryOne.mockResolvedValueOnce({ id: 456 });
  // Mock existing conversation check for saveConversation
  mockedDb.queryOne.mockResolvedValueOnce({ id: 456 });
  // Mock successful update
  mockedDb.queryOne.mockResolvedValueOnce({ id: 456 });

  const result = await messagingService.saveConversation('user@example.com', 'expertUser1', mockMessages);

  expect(result.success).toBe(true);
  expect(result.conversationId).toBe(456);
  expect(mockedDb.queryOne).toHaveBeenCalledTimes(3);
  expect(mockedDb.queryOne).toHaveBeenLastCalledWith(
    expect.stringContaining('UPDATE conversations'),
    ['user@example.com', 'expertUser1', JSON.stringify(mockMessages)]
  );
});

test('getAllUserConversations should handle database errors', async () => {
  mockedDb.queryRows.mockRejectedValueOnce(new Error('Database error'));

  const result = await messagingService.getAllUserConversations('user@example.com');

  expect(result.success).toBe(false);
  expect(result.error).toBe('Failed to fetch conversations');
});

test('saveConversation should handle database errors', async () => {
  mockedDb.queryOne.mockRejectedValueOnce(new Error('Database error'));

  const result = await messagingService.saveConversation('user@example.com', 'expertUser1', []);

  expect(result.success).toBe(false);
  expect(result.error).toBe('Failed to save conversation');
});

// Expert conversations tests
test('getAllExpertConversations should return expert conversations', async () => {
  const mockConversations = [
    { 
      id: 1, 
      username: 'user1', 
      expert_username: 'expertUser1', 
      conversation: JSON.stringify([
        { message: 'Hello expert', sender: 'user1', timestamp: '2025-11-16T10:00:00.000Z' }
      ])
    },
    { 
      id: 2, 
      username: 'user2', 
      expert_username: 'expertUser1', 
      conversation: JSON.stringify([
        { message: 'Hi there', sender: 'user2', timestamp: '2025-11-16T11:00:00.000Z' }
      ])
    }
  ];

  mockedDb.queryRows.mockResolvedValueOnce(mockConversations);

  const result = await messagingService.getAllExpertConversations('expertUser1');

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.conversations).toHaveLength(2);
    expect(result.conversations![0].expert_username).toBe('expertUser1');
    expect(result.conversations![0].username).toBe('user1');
    expect(result.conversations![1].username).toBe('user2');
    // Check that conversations are parsed correctly
    expect(Array.isArray(result.conversations![0].conversation)).toBe(true);
    expect(result.conversations![0].conversation[0].message).toBe('Hello expert');
  }
  expect(mockedDb.queryRows).toHaveBeenCalledWith(
    expect.stringContaining('WHERE expert_username = $1'),
    ['expertUser1']
  );
});

test('getAllExpertConversations should handle empty results', async () => {
  mockedDb.queryRows.mockResolvedValueOnce([]);

  const result = await messagingService.getAllExpertConversations('expertUser1');

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.conversations).toHaveLength(0);
  }
});

test('getAllExpertConversations should handle database errors', async () => {
  mockedDb.queryRows.mockRejectedValueOnce(new Error('Database connection failed'));

  const result = await messagingService.getAllExpertConversations('expertUser1');

  expect(result.success).toBe(false);
  expect(result.error).toBe('Failed to fetch expert conversations');
});