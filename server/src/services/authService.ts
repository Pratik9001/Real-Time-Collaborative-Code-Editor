import bcrypt from 'bcryptjs';
import db from '../config/database';
import { User } from '../types';
import { generateTokens } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  static async register(userData: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, username, displayName } = userData;

    // Check if user already exists
    const existingUser = await db('users')
      .where('email', email)
      .orWhere('username', username)
      .first();

    if (existingUser) {
      if (existingUser.email === email) {
        throw createError('Email already registered', 409);
      }
      if (existingUser.username === username) {
        throw createError('Username already taken', 409);
      }
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [user] = await db('users')
      .insert({
        id: uuidv4(),
        email,
        password_hash: passwordHash,
        username,
        display_name: displayName || username,
        preferences: {},
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Remove password hash from response
    delete user.password_hash;

    return {
      user: this.mapDbUserToUser(user),
      accessToken,
      refreshToken
    };
  }

  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password } = credentials;

    // Find user
    const user = await db('users').where({ email, is_active: true }).first();

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Update last login
    await db('users')
      .where({ id: user.id })
      .update({
        updated_at: new Date()
      });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Remove password hash from response
    delete user.password_hash;

    return {
      user: this.mapDbUserToUser(user),
      accessToken,
      refreshToken
    };
  }

  static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { verifyRefreshToken, generateTokens } = await import('../utils/jwt');

    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await db('users')
        .where({ id: decoded.userId, is_active: true })
        .first();

      if (!user) {
        throw createError('User not found or inactive', 401);
      }

      // Generate new tokens
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        username: user.username
      });

      return tokens;
    } catch (error) {
      throw createError('Invalid or expired refresh token', 401);
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    const user = await db('users')
      .where({ id: userId, is_active: true })
      .first();

    if (!user) {
      return null;
    }

    return this.mapDbUserToUser(user);
  }

  static async updateUser(userId: string, updates: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    preferences?: Record<string, any>;
  }): Promise<User> {
    const updateData: any = {
      updated_at: new Date()
    };

    if (updates.displayName !== undefined) {
      updateData.display_name = updates.displayName;
    }
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio;
    }
    if (updates.avatarUrl !== undefined) {
      updateData.avatar_url = updates.avatarUrl;
    }
    if (updates.preferences !== undefined) {
      updateData.preferences = JSON.stringify(updates.preferences);
    }

    const [user] = await db('users')
      .where({ id: userId })
      .update(updateData)
      .returning('*');

    if (!user) {
      throw createError('User not found', 404);
    }

    return this.mapDbUserToUser(user);
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user with current password
    const user = await db('users').where({ id: userId, is_active: true }).first();

    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 401);
    }

    // Hash new password
    const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db('users')
      .where({ id: userId })
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date()
      });
  }

  private static mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      displayName: dbUser.display_name,
      bio: dbUser.bio,
      avatarUrl: dbUser.avatar_url,
      preferences: typeof dbUser.preferences === 'string'
        ? JSON.parse(dbUser.preferences)
        : dbUser.preferences,
      isActive: dbUser.is_active,
      emailVerifiedAt: dbUser.email_verified_at,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    };
  }
}