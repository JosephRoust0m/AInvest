import { expertService } from '../expertService';
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

// 1) getAllExperts
test('getAllExperts should return all experts from the database', async () => {
  const mockExperts = [
    { id: 1, username: 'expert1', passkey: 'abc1234567' },
    { id: 2, username: 'expert2', passkey: 'def7890123' },
    { id: 3, username: 'expert3', passkey: 'ghi4567890' }
  ];

  mockedDb.queryRows.mockResolvedValueOnce(mockExperts);

  const result = await expertService.getAllExperts();

  expect(result.success).toBe(true);
  if (result.success && result.experts) {
    expect(result.experts).toHaveLength(3);
    expect(result.experts[0].username).toBe('expert1');
    expect(result.experts[1].username).toBe('expert2');
  }
  expect(mockedDb.queryRows).toHaveBeenCalledWith(
    'SELECT id, username, passkey FROM experts ORDER BY id ASC'
  );
});

test('getAllExperts should handle database errors gracefully', async () => {
  mockedDb.queryRows.mockRejectedValueOnce(new Error('Database connection failed'));

  const result = await expertService.getAllExperts();

  expect(result.success).toBe(false);
  expect(result.error).toBe('Failed to load experts');
});