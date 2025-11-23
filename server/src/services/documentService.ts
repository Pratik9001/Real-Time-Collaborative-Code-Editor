import db from '../config/database';
import { Document, DocumentAccess, Operation, UserCursor } from '../types';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { getUserColor, getUserInitials } from '../utils/colors';

export class DocumentService {
  static async createDocument(userId: string, documentData: {
    title: string;
    content?: string;
    language?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<Document> {
    const { title, content = '', language = 'javascript', isPublic = false, tags = [] } = documentData;

    const [document] = await db('documents')
      .insert({
        id: uuidv4(),
        owner_id: userId,
        title,
        content,
        language,
        is_public: isPublic,
        tags: JSON.stringify(tags),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // Create owner access record
    await db('document_access')
      .insert({
        id: uuidv4(),
        document_id: document.id,
        user_id: userId,
        permission: 'owner',
        created_at: new Date(),
        updated_at: new Date()
      });

    return this.mapDbDocumentToDocument(document);
  }

  static async getDocumentById(documentId: string, userId?: string): Promise<Document | null> {
    const query = db('documents').where('documents.id', documentId);

    // If userId is provided, check access permissions
    if (userId) {
      query.joinRaw(`
        LEFT JOIN document_access ON (
          document_access.document_id = documents.id
          AND document_access.user_id = ?
        )
      `, [userId])
        .whereRaw(`
          documents.owner_id = ?
          OR documents.is_public = true
          OR document_access.user_id IS NOT NULL
        `, [userId]);
    } else {
      query.where('documents.is_public', true);
    }

    const document = await query.first();

    if (!document) {
      return null;
    }

    return this.mapDbDocumentToDocument(document);
  }

  static async getUserDocuments(userId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: 'created_at' | 'updated_at' | 'title';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ documents: Document[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      tags,
      sortBy = 'updated_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    let query = db('documents')
      .select('documents.*')
      .join('document_access', 'documents.id', 'document_access.document_id')
      .where('document_access.user_id', userId);

    // Add search functionality
    if (search) {
      query = query.where(function() {
        this.where('documents.title', 'ilike', `%${search}%`)
          .orWhere('documents.content', 'ilike', `%${search}%`);
      });
    }

    // Add tag filtering
    if (tags && tags.length > 0) {
      query = query.where(function() {
        tags.forEach((tag) => {
          this.orWhereRaw('? = ANY (SELECT jsonb_array_elements_text(tags))', [tag]);
        });
      });
    }

    // Add sorting
    query.orderBy(`documents.${sortBy}`, sortOrder);

    // Get total count
    const totalQuery = query.clone().clearSelect().clearOrder().count('* as total');
    const [{ total }] = await totalQuery;

    // Get paginated results
    const documents = await query.limit(limit).offset(offset);

    return {
      documents: documents.map(this.mapDbDocumentToDocument),
      total: parseInt(total as string)
    };
  }

  static async updateDocument(documentId: string, userId: string, updates: {
    title?: string;
    content?: string;
    language?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<Document> {
    // Check permissions
    const hasPermission = await this.checkDocumentPermission(documentId, userId, 'editor');

    if (!hasPermission) {
      throw createError('Insufficient permissions to update document', 403);
    }

    const updateData: any = {
      updated_at: new Date()
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    if (updates.content !== undefined) {
      updateData.content = updates.content;
    }
    if (updates.language !== undefined) {
      updateData.language = updates.language;
    }
    if (updates.isPublic !== undefined) {
      updateData.is_public = updates.isPublic;
    }
    if (updates.tags !== undefined) {
      updateData.tags = JSON.stringify(updates.tags);
    }

    const [document] = await db('documents')
      .where({ id: documentId })
      .update(updateData)
      .returning('*');

    if (!document) {
      throw createError('Document not found', 404);
    }

    return this.mapDbDocumentToDocument(document);
  }

  static async deleteDocument(documentId: string, userId: string): Promise<void> {
    // Check if user is owner
    const document = await db('documents')
      .where({ id: documentId, owner_id: userId })
      .first();

    if (!document) {
      throw createError('Document not found or insufficient permissions', 404);
    }

    // Delete document (cascade will handle related records)
    await db('documents').where({ id: documentId }).del();
  }

  static async shareDocument(documentId: string, userId: string, shareData: {
    permission: 'editor' | 'viewer';
    expiresIn?: number;
  }): Promise<{ shareToken: string; expiresAt?: Date }> {
    // Check if user is owner
    const document = await db('documents')
      .where({ id: documentId, owner_id: userId })
      .first();

    if (!document) {
      throw createError('Document not found or insufficient permissions', 404);
    }

    // Generate or update share token
    const shareToken = uuidv4();
    const expiresAt = shareData.expiresIn
      ? new Date(Date.now() + shareData.expiresIn * 60 * 60 * 1000)
      : null;

    await db('documents')
      .where({ id: documentId })
      .update({
        share_token: shareToken,
        updated_at: new Date()
      });

    return {
      shareToken,
      expiresAt: expiresAt || undefined
    };
  }

  static async accessDocumentByShareToken(shareToken: string, userId: string): Promise<Document> {
    const document = await db('documents')
      .where({ share_token: shareToken })
      .first();

    if (!document) {
      throw createError('Invalid share token', 404);
    }

    // Create access record if it doesn't exist
    const existingAccess = await db('document_access')
      .where({
        document_id: document.id,
        user_id: userId
      })
      .first();

    if (!existingAccess) {
      await db('document_access')
        .insert({
          id: uuidv4(),
          document_id: document.id,
          user_id: userId,
          permission: 'editor', // Default permission for shared links
          created_at: new Date(),
          updated_at: new Date()
        });
    }

    return this.mapDbDocumentToDocument(document);
  }

  static async checkDocumentPermission(
    documentId: string,
    userId: string,
    requiredPermission: 'owner' | 'editor' | 'viewer'
  ): Promise<boolean> {
    const access = await db('document_access')
      .where({
        document_id: documentId,
        user_id: userId
      })
      .first();

    if (!access) {
      return false;
    }

    // Permission hierarchy: owner > editor > viewer
    const permissionLevels = {
      viewer: 1,
      editor: 2,
      owner: 3
    };

    const userLevel = permissionLevels[access.permission];
    const requiredLevel = permissionLevels[requiredPermission];

    return userLevel >= requiredLevel;
  }

  static async getDocumentUsers(documentId: string): Promise<UserCursor[]> {
    const users = await db('document_access')
      .select(
        'users.id',
        'users.username',
        'users.display_name',
        'users.avatar_url',
        'document_access.permission'
      )
      .join('users', 'document_access.user_id', 'users.id')
      .where('document_access.document_id', documentId)
      .where('users.is_active', true);

    return users.map(user => ({
      userId: user.id,
      userName: user.display_name || user.username,
      position: { line: 0, column: 0 }, // Default position
      color: getUserColor(user.id),
      isActive: false,
      lastSeen: new Date()
    }));
  }

  private static mapDbDocumentToDocument(dbDocument: any): Document {
    return {
      id: dbDocument.id,
      ownerId: dbDocument.owner_id,
      title: dbDocument.title,
      content: dbDocument.content,
      language: dbDocument.language,
      shareToken: dbDocument.share_token,
      isPublic: dbDocument.is_public,
      tags: typeof dbDocument.tags === 'string'
        ? JSON.parse(dbDocument.tags)
        : dbDocument.tags,
      lastAccessed: dbDocument.last_accessed,
      createdAt: dbDocument.created_at,
      updatedAt: dbDocument.updated_at
    };
  }
}