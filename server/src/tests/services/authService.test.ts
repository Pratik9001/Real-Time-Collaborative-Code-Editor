import { AuthService } from '../../services/authService';
import { createError } from '../../middleware/errorHandler';

describe('AuthService', () => {
  const mockUser = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
    displayName: 'Test User'
  };

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const result = await AuthService.register(mockUser);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.username).toBe(mockUser.username);
      expect(result.user.displayName).toBe(mockUser.displayName);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.passwordHash).toBeUndefined();
    });

    it('should throw error if email already exists', async () => {
      await AuthService.register(mockUser);

      await expect(
        AuthService.register({
          ...mockUser,
          username: 'differentuser'
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should throw error if username already exists', async () => {
      await AuthService.register(mockUser);

      await expect(
        AuthService.register({
          ...mockUser,
          email: 'different@example.com'
        })
      ).rejects.toThrow('Username already taken');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register(mockUser);
    });

    it('should login user successfully with correct credentials', async () => {
      const result = await AuthService.login({
        email: mockUser.email,
        password: mockUser.password
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with incorrect email', async () => {
      await expect(
        AuthService.login({
          email: 'wrong@example.com',
          password: mockUser.password
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with incorrect password', async () => {
      await expect(
        AuthService.login({
          email: mockUser.email,
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const result = await AuthService.register(mockUser);
      refreshToken = result.refreshToken;
    });

    it('should generate new tokens successfully', async () => {
      const tokens = await AuthService.refreshToken(refreshToken);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('should throw error with invalid refresh token', async () => {
      await expect(
        AuthService.refreshToken('invalid-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });
});