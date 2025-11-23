import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { documentRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../utils/validation';
import {
  createDocumentSchema,
  updateDocumentSchema,
  shareDocumentSchema
} from '../utils/validation';
import * as documentController from '../controllers/documentController';

const router = express.Router();

// All document routes require authentication
router.use(authenticateToken);

// Create document
router.post(
  '/',
  documentRateLimiter,
  validate(createDocumentSchema),
  documentController.createDocument
);

// Get user's documents with pagination and filtering
router.get(
  '/',
  documentRateLimiter,
  documentController.getDocuments
);

// Get specific document
router.get(
  '/:id',
  documentRateLimiter,
  documentController.getDocument
);

// Update document
router.put(
  '/:id',
  documentRateLimiter,
  validate(updateDocumentSchema),
  documentController.updateDocument
);

// Delete document
router.delete(
  '/:id',
  documentRateLimiter,
  documentController.deleteDocument
);

// Share document
router.post(
  '/:id/share',
  documentRateLimiter,
  validate(shareDocumentSchema),
  documentController.shareDocument
);

// Access document via share token
router.get(
  '/shared/:shareToken',
  documentRateLimiter,
  documentController.accessSharedDocument
);

// Get document users
router.get(
  '/:id/users',
  documentRateLimiter,
  documentController.getDocumentUsers
);

export default router;