import { advisorService } from '../advisorService';
import { db } from '../database';

jest.mock('../database', () => ({
  db: {
    queryOne: jest.fn(),
    queryRows: jest.fn(),
    queryMany: jest.fn()
  }
}));

const mockedDb = db as unknown as { queryOne: jest.Mock; queryRows: jest.Mock; queryMany: jest.Mock };

describe('AdvisorService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (global as any).localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    };
  });

  test('signIn returns token for valid credentials', async () => {
    mockedDb.queryOne.mockResolvedValue({ id: 1, username: 'advisor', password: 'pass', email: 'a@b.com' });
    const result = await advisorService.signIn({ username: 'advisor', password: 'pass' });
    expect(result.success).toBe(true);
    expect(result.token).toContain('auth_');
  });

  test('signIn throws error for invalid password', async () => {
    mockedDb.queryOne.mockResolvedValue({ id: 1, username: 'advisor', password: 'pass', email: 'a@b.com' });
    await expect(advisorService.signIn({ username: 'advisor', password: 'wrong' })).rejects.toThrow('Invalid password');
  });

  test('sendLogoutTimestamp returns success for valid user', async () => {
    mockedDb.queryOne.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1, username: 'advisor' });
    const result = await advisorService.sendLogoutTimestamp('advisor');
    expect(result.success).toBe(true);
  });

  test('fetchAdvisors returns advisors array', async () => {
    mockedDb.queryRows.mockResolvedValue([{ id: 1, username: 'advisor' }]);
    const advisors = await advisorService.fetchAdvisors();
    expect(Array.isArray(advisors)).toBe(true);
  });

  test('fetchAdvisorsConversation returns conversations array', async () => {
    mockedDb.queryMany.mockResolvedValue([{ id: 1, advisor: 'advisor' }]);
    const conversations = await advisorService.fetchAdvisorsConversation('advisor');
    expect(Array.isArray(conversations)).toBe(true);
  });
});
