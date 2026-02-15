
jest.mock('../database', () => ({
  queryOne: jest.fn(),
  queryRows: jest.fn(),
  queryMany: jest.fn(),
}));

import db from '../database';
import { conversationService } from '../conversationService';

const mockedDb = db as unknown as {
  queryOne: jest.Mock;
  queryRows: jest.Mock;
  queryMany: jest.Mock;
};

describe('ConversationService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('saveConversations inserts new conversation', async () => {
    mockedDb.queryOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1 });
    const conversations = [{ user_username: 'user', advisor_username: 'advisor', conversation: [] }];
    await conversationService.saveConversations(conversations);
    expect(mockedDb.queryOne).toHaveBeenCalled();
  });

  test('addMessageToConversation creates new conversation if not found', async () => {
    mockedDb.queryOne.mockResolvedValueOnce(null);
    const message = { sender: 'user', receiver: 'advisor', timestamp: new Date().getTime(), text: 'Hello' };
    await conversationService.addMessageToConversation(message);
    expect(mockedDb.queryOne).toHaveBeenCalled();
  });

  test('addMessageToConversation updates existing conversation', async () => {
    mockedDb.queryOne.mockResolvedValueOnce({ id: 1, conversation: [] });
    const message = { sender: 'user', receiver: 'advisor', timestamp: new Date().getTime(), text: 'Hi' };
    await conversationService.addMessageToConversation(message);
    expect(mockedDb.queryOne).toHaveBeenCalled();
  });
});
