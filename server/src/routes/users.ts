import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// User-related routes can be added here
// This is a placeholder for future user management features

export default router;