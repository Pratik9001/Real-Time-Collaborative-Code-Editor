import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import { asyncHandler } from '../middleware/errorHandler';

export const createDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { title, content, language, isPublic, tags } = req.body;

  const document = await DocumentService.createDocument(req.user.userId, {
    title,
    content,
    language,
    isPublic,
    tags
  });

  res.status(201).json({
    success: true,
    data: { document }
  });
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const document = await DocumentService.getDocumentById(id, userId);

  if (!document) {
    return res.status(404).json({
      success: false,
      error: 'Document not found'
    });
  }

  res.json({
    success: true,
    data: { document }
  });
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const {
    page = 1,
    limit = 20,
    search,
    tags,
    sortBy = 'updated_at',
    sortOrder = 'desc'
  } = req.query;

  const parsedTags = tags ? (tags as string).split(',').filter(Boolean) : undefined;

  const result = await DocumentService.getUserDocuments(req.user.userId, {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    search: search as string,
    tags: parsedTags,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any
  });

  res.json({
    success: true,
    data: result
  });
});

export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { id } = req.params;
  const { title, content, language, isPublic, tags } = req.body;

  const document = await DocumentService.updateDocument(id, req.user.userId, {
    title,
    content,
    language,
    isPublic,
    tags
  });

  res.json({
    success: true,
    data: { document }
  });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { id } = req.params;

  await DocumentService.deleteDocument(id, req.user.userId);

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

export const shareDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { id } = req.params;
  const { permission, expiresIn } = req.body;

  const result = await DocumentService.shareDocument(id, req.user.userId, {
    permission,
    expiresIn
  });

  res.json({
    success: true,
    data: result
  });
});

export const accessSharedDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { shareToken } = req.params;

  const document = await DocumentService.accessDocumentByShareToken(shareToken, req.user.userId);

  res.json({
    success: true,
    data: { document }
  });
});

export const getDocumentUsers = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const users = await DocumentService.getDocumentUsers(id);

  res.json({
    success: true,
    data: { users }
  });
});