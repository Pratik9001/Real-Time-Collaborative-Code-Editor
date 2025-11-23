import db from '../config/database';
import { Operation, TextOperation } from '../types';
import { DocumentService } from './documentService';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

interface ProcessedOperation {
  operation: Operation;
  newContent: string;
  newVersion: number;
}

interface OTState {
  content: string;
  version: number;
}

export class OperationService {
  static async processOperation(
    documentId: string,
    operation: Operation,
    clientVersion: number,
    userId: string
  ): Promise<ProcessedOperation> {
    // Get current document state
    const document = await DocumentService.getDocumentById(documentId, userId);
    if (!document) {
      throw createError('Document not found', 404);
    }

    const currentState: OTState = {
      content: document.content,
      version: await this.getDocumentVersion(documentId)
    };

    // Get operations that client hasn't seen yet
    const pendingOperations = await this.getOperationsAfter(
      documentId,
      clientVersion
    );

    // Transform the operation against pending operations
    const transformedOp = this.transformOperation(operation, pendingOperations);

    // Apply the transformed operation to the content
    const newContent = this.applyOperation(currentState.content, transformedOp);

    // Save the operation to database
    const savedOperation = await this.saveOperation(documentId, transformedOp, userId);

    // Create a document version snapshot periodically
    if (currentState.version % 10 === 0) {
      await this.createDocumentVersion(documentId, newContent, currentState.version + 1);
    }

    return {
      operation: savedOperation,
      newContent,
      newVersion: currentState.version + 1
    };
  }

  static async getDocumentVersion(documentId: string): Promise<number> {
    const result = await db('operations')
      .where({ document_id: documentId })
      .max('document_version as max_version')
      .first();

    return result?.max_version || 0;
  }

  static async getOperationsAfter(documentId: string, version: number): Promise<Operation[]> {
    const operations = await db('operations')
      .where({
        document_id: documentId
      })
      .where('document_version', '>', version)
      .orderBy('document_version', 'asc');

    return operations.map(this.mapDbOperationToOperation);
  }

  static async saveOperation(
    documentId: string,
    operation: Operation,
    userId: string
  ): Promise<Operation> {
    const [savedOp] = await db('operations')
      .insert({
        id: uuidv4(),
        document_id: documentId,
        user_id: userId,
        operation_type: operation.operationType,
        operation_data: JSON.stringify(operation.operationData),
        document_version: operation.documentVersion,
        created_at: new Date()
      })
      .returning('*');

    return this.mapDbOperationToOperation(savedOp);
  }

  static transformOperation(operation: Operation, pendingOps: Operation[]): Operation {
    let transformedOp = { ...operation };

    for (const pendingOp of pendingOps) {
      transformedOp = this.transformAgainstOperation(transformedOp, pendingOp);
    }

    return transformedOp;
  }

  static transformAgainstOperation(op1: Operation, op2: Operation): Operation {
    // Basic operational transformation rules
    // This is a simplified implementation - in production, use a library like ShareJS

    const op1Data = op1.operationData;
    const op2Data = op2.operationData;

    switch (op1.operationType) {
      case 'insert':
        switch (op2.operationType) {
          case 'insert':
            // Both insert at same or earlier position
            if (op2Data.position! <= op1Data.position!) {
              return {
                ...op1,
                operationData: {
                  ...op1Data,
                  position: op1Data.position! + (op2Data.text?.length || 0)
                }
              };
            }
            break;

          case 'delete':
            // Delete before insert position
            if (op2Data.position! < op1Data.position!) {
              return {
                ...op1,
                operationData: {
                  ...op1Data,
                  position: Math.max(op1Data.position! - op2Data.length!, 0)
                }
              };
            }
            // Delete overlaps insert position
            else if (op2Data.position! <= op1Data.position! &&
                     op2Data.position! + op2Data.length! > op1Data.position!) {
              return {
                ...op1,
                operationData: {
                  ...op1Data,
                  position: op2Data.position!
                }
              };
            }
            break;

          case 'retain':
            // Retain doesn't affect insert position
            break;
        }
        break;

      case 'delete':
        switch (op2.operationType) {
          case 'insert':
            // Insert before delete position
            if (op2Data.position! <= op1Data.position!) {
              return {
                ...op1,
                operationData: {
                  ...op1Data,
                  position: op1Data.position! + (op2Data.text?.length || 0)
                }
              };
            }
            break;

          case 'delete':
            // Handle overlapping deletions
            const op1Start = op1Data.position!;
            const op1End = op1Start + op1Data.length!;
            const op2Start = op2Data.position!;
            const op2End = op2Start + op2Data.length!;

            if (op2End <= op1Start) {
              // op2 is completely before op1
              return {
                ...op1,
                operationData: {
                  ...op1Data,
                  position: op1Start - op2Data.length!
                }
              };
            } else if (op2Start >= op1End) {
              // op2 is completely after op1, no transformation needed
              break;
            } else {
              // Operations overlap - this gets complex
              // Simplified: just adjust position and length
              const overlapStart = Math.max(op1Start, op2Start);
              const overlapEnd = Math.min(op1End, op2End);
              const overlapLength = overlapEnd - overlapStart;

              return {
                ...op1,
                operationData: {
                  ...op1Data,
                  position: Math.min(op1Start, op2Start),
                  length: Math.max(0, op1Data.length! - overlapLength)
                }
              };
            }
            break;

          case 'retain':
            // Retain doesn't affect delete position
            break;
        }
        break;

      case 'retain':
        // Retain operations typically don't need transformation against other operations
        break;
    }

    return op1;
  }

  static applyOperation(content: string, operation: Operation): string {
    const { operationType, operationData } = operation;

    switch (operationType) {
      case 'insert':
        const insertPos = operationData.position || 0;
        const text = operationData.text || '';
        return content.slice(0, insertPos) + text + content.slice(insertPos);

      case 'delete':
        const deletePos = operationData.position || 0;
        const length = operationData.length || 0;
        return content.slice(0, deletePos) + content.slice(deletePos + length);

      case 'retain':
        // Retain operations don't change content
        return content;

      default:
        throw new Error(`Unknown operation type: ${operationType}`);
    }
  }

  static async createDocumentVersion(
    documentId: string,
    content: string,
    version: number,
    changeSummary?: string
  ): Promise<void> {
    await db('document_versions')
      .insert({
        id: uuidv4(),
        document_id: documentId,
        version_number: version,
        content,
        change_summary: changeSummary || `Auto-save version ${version}`,
        is_manual: false,
        created_at: new Date(),
        updated_at: new Date()
      })
      .onConflict(['document_id', 'version_number'])
      .ignore();
  }

  static async createManualVersion(
    documentId: string,
    content: string,
    version: number,
    changeSummary: string
  ): Promise<void> {
    await db('document_versions')
      .insert({
        id: uuidv4(),
        document_id: documentId,
        version_number: version,
        content,
        change_summary,
        is_manual: true,
        created_at: new Date(),
        updated_at: new Date()
      });
  }

  static async getDocumentVersions(documentId: string): Promise<any[]> {
    return await db('document_versions')
      .where({ document_id: documentId })
      .orderBy('version_number', 'desc')
      .limit(50); // Limit to 50 most recent versions
  }

  static async restoreVersion(documentId: string, versionNumber: number): Promise<string> {
    const version = await db('document_versions')
      .where({
        document_id: documentId,
        version_number: versionNumber
      })
      .first();

    if (!version) {
      throw createError('Version not found', 404);
    }

    return version.content;
  }

  private static mapDbOperationToOperation(dbOp: any): Operation {
    return {
      id: dbOp.id,
      documentId: dbOp.document_id,
      userId: dbOp.user_id,
      operationType: dbOp.operation_type,
      operationData: typeof dbOp.operation_data === 'string'
        ? JSON.parse(dbOp.operation_data)
        : dbOp.operation_data,
      documentVersion: dbOp.document_version,
      createdAt: dbOp.created_at
    };
  }
}