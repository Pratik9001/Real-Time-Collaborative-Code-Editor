import { DocumentService } from '../../services/documentService';
import { AuthService } from '../../services/authService';

describe('DocumentService', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await AuthService.register({
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser'
    });
    userId = user.user.id;
  });

  describe('createDocument', () => {
    it('should create a new document successfully', async () => {
      const documentData = {
        title: 'Test Document',
        content: 'console.log("Hello World");',
        language: 'javascript',
        isPublic: false,
        tags: ['test', 'example']
      };

      const document = await DocumentService.createDocument(userId, documentData);

      expect(document.id).toBeDefined();
      expect(document.title).toBe(documentData.title);
      expect(document.content).toBe(documentData.content);
      expect(document.language).toBe(documentData.language);
      expect(document.isPublic).toBe(documentData.isPublic);
      expect(document.tags).toEqual(documentData.tags);
      expect(document.ownerId).toBe(userId);
    });

    it('should create document with default values', async () => {
      const document = await DocumentService.createDocument(userId, {
        title: 'Simple Document'
      });

      expect(document.content).toBe('');
      expect(document.language).toBe('javascript');
      expect(document.isPublic).toBe(false);
      expect(document.tags).toEqual([]);
    });
  });

  describe('getDocumentById', () => {
    let documentId: string;

    beforeEach(async () => {
      const document = await DocumentService.createDocument(userId, {
        title: 'Test Document'
      });
      documentId = document.id;
    });

    it('should return document when user has access', async () => {
      const document = await DocumentService.getDocumentById(documentId, userId);

      expect(document).toBeDefined();
      expect(document!.id).toBe(documentId);
    });

    it('should return null for non-existent document', async () => {
      const document = await DocumentService.getDocumentById('non-existent-id', userId);

      expect(document).toBeNull();
    });
  });

  describe('updateDocument', () => {
    let documentId: string;

    beforeEach(async () => {
      const document = await DocumentService.createDocument(userId, {
        title: 'Original Title',
        content: 'Original content'
      });
      documentId = document.id;
    });

    it('should update document successfully', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const updatedDocument = await DocumentService.updateDocument(
        documentId,
        userId,
        updates
      );

      expect(updatedDocument.title).toBe(updates.title);
      expect(updatedDocument.content).toBe(updates.content);
    });

    it('should throw error for non-existent document', async () => {
      await expect(
        DocumentService.updateDocument('non-existent-id', userId, {
          title: 'New Title'
        })
      ).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    let documentId: string;

    beforeEach(async () => {
      const document = await DocumentService.createDocument(userId, {
        title: 'Test Document'
      });
      documentId = document.id;
    });

    it('should delete document successfully', async () => {
      await DocumentService.deleteDocument(documentId, userId);

      const document = await DocumentService.getDocumentById(documentId, userId);
      expect(document).toBeNull();
    });

    it('should throw error for non-existent document', async () => {
      await expect(
        DocumentService.deleteDocument('non-existent-id', userId)
      ).rejects.toThrow('Document not found');
    });
  });
});