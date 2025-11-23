import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username, displayName } = req.body;

  const result = await AuthService.register({
    email,
    password,
    username,
    displayName
  });

  res.status(201).json({
    success: true,
    data: result
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.login({
    email,
    password
  });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: 'Refresh token not found'
    });
  }

  const tokens = await AuthService.refreshToken(refreshToken);

  // Set new refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken
    }
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const user = await AuthService.getUserById(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { displayName, bio, avatarUrl, preferences } = req.body;

  const user = await AuthService.updateUser(req.user.userId, {
    displayName,
    bio,
    avatarUrl,
    preferences
  });

  res.json({
    success: true,
    data: { user }
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { currentPassword, newPassword } = req.body;

  await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});