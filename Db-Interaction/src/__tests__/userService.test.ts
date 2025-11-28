import { userService } from '../userService';
import { db } from '../database';
import bcrypt from 'bcrypt';

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
  // Provide a simple localStorage mock
  (global as any).localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
  };
});

// 1) hashPassword
test('hashPassword should return a hashed string different from input', async () => {
  const plain = 'myPassword123';
  const hashed = await userService.hashPassword(plain);
  expect(hashed).not.toBe(plain);
  expect(typeof hashed).toBe('string');
});

// 2) comparePassword
test('comparePassword should validate a correct password', async () => {
  const plain = 'compareMe!';
  const hashed = await bcrypt.hash(plain, 12);
  const ok = await userService.comparePassword(plain, hashed);
  expect(ok).toBe(true);
});

// 3) authenticateUser
test('authenticateUser should return true when password matches DB', async () => {
  const plain = 'secretPass';
  const hashed = await bcrypt.hash(plain, 12);
  mockedDb.queryOne.mockResolvedValueOnce({ password: hashed });

  const result = await userService.authenticateUser('test@example.com', plain);
  expect(result).toBe(true);
  expect(mockedDb.queryOne).toHaveBeenCalled();
});

// 4) signIn
test('signIn should return success and token when credentials are valid', async () => {
  const plain = 'loginPass';
  const hashed = await bcrypt.hash(plain, 12);
  const fakeUser = { id: 5, email: 'a@b.com', username: 'tester', password: hashed };
  mockedDb.queryOne.mockResolvedValueOnce(fakeUser); 

  const result = await userService.signIn({ email: 'a@b.com', password: plain });
  expect(result.success).toBe(true);
  expect(result.user.username).toBe('tester');
  expect(result.user.email).toBe('a@b.com');
  expect(result.user.id).toBe(5);
  expect(result.token).toBeDefined();
  expect(result._token).toBeDefined();
});

// 5) signUp
test('signUp should create a user when email/username do not exist', async () => {
  // sequence: emailExists, usernameExists, insert
  mockedDb.queryOne
    .mockResolvedValueOnce({ count: '0' })
    .mockResolvedValueOnce({ count: '0' }) 
    .mockResolvedValueOnce({ id: 10, email: 'new@a.com', username: 'newuser' }); // insert

  const res = await userService.signUp({ username: 'newuser', email: 'new@a.com', password: 'pass1234' });
  expect(res.success).toBe(true);
  expect(res.user.email).toBe('new@a.com');
  expect(res.user.username).toBe('newuser');
  expect(res.token).toBeDefined();
  expect(res._token).toBeDefined();
});

// 6) sendLogoutTimestamp
test('sendLogoutTimestamp should update last_logout when user exists', async () => {
  mockedDb.queryOne
    .mockResolvedValueOnce({ id: 42 })
    .mockResolvedValueOnce({ id: 42, username: 'logoutUser' }); 

  const res = await userService.sendLogoutTimestamp("hello@gmail.com");
  expect(res.success).toBe(true);
  expect(res.message).toBe('Logout timestamp recorded');
});

// 7) validatePassword
test('validatePassword should pass valid password', () => {
  expect(userService.validatePassword('abcdef')).toBe(true);
});

// 8) validateEmail
test('validateEmail should pass a valid email', () => {
  expect(userService.validateEmail('ok@example.com')).toBe(true);
});


