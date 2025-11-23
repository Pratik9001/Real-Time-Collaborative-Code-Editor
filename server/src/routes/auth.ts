import express from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../utils/validation';
import {
  registerSchema,
  loginSchema
} from '../utils/validation';
import * as authController from '../controllers/authController';

const router = express.Router();

// Register route
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

// Login route
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

// Refresh token route
router.post('/refresh', authController.refreshToken);

// Logout route
router.post('/logout', authenticateToken, authController.logout);

// Get user profile
router.get('/profile', authenticateToken, authController.getProfile);

// Update user profile
router.put('/profile', authenticateToken, authController.updateProfile);

// Change password
router.put('/password', authenticateToken, authController.changePassword);

export default router;