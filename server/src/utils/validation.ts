import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  username: Joi.string().alphanum().min(3).max(20).required().messages({
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 20 characters',
    'any.required': 'Username is required'
  }),
  displayName: Joi.string().max(50).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional()
});

// Document validation schemas
export const createDocumentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Title cannot be empty',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  }),
  content: Joi.string().optional(),
  language: Joi.string().valid(
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
    'json', 'xml', 'yaml', 'markdown', 'sql', 'shell', 'plaintext'
  ).default('javascript'),
  isPublic: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string().max(20)).max(10).default([])
});

export const updateDocumentSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  content: Joi.string().optional(),
  language: Joi.string().valid(
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
    'json', 'xml', 'yaml', 'markdown', 'sql', 'shell', 'plaintext'
  ).optional(),
  isPublic: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string().max(20)).max(10).optional()
});

export const shareDocumentSchema = Joi.object({
  permission: Joi.string().valid('editor', 'viewer').required(),
  expiresIn: Joi.number().min(1).max(8760).optional() // max 1 year in hours
});

// Socket event validation schemas
export const joinDocumentSchema = Joi.object({
  documentId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required()
});

export const textOperationSchema = Joi.object({
  operation: Joi.object({
    operationType: Joi.string().valid('insert', 'delete', 'retain').required(),
    operationData: Joi.object({
      position: Joi.number().min(0).required(),
      length: Joi.number().min(0).optional(),
      text: Joi.string().optional(),
      attributes: Joi.object().optional()
    }).required(),
    documentVersion: Joi.number().min(0).required()
  }).required(),
  documentId: Joi.string().uuid().required(),
  version: Joi.number().min(0).required()
});

export const cursorPositionSchema = Joi.object({
  position: Joi.object({
    line: Joi.number().min(0).required(),
    column: Joi.number().min(0).required()
  }).required(),
  selection: Joi.object({
    start: Joi.object({
      line: Joi.number().min(0).required(),
      column: Joi.number().min(0).required()
    }).required(),
    end: Joi.object({
      line: Joi.number().min(0).required(),
      column: Joi.number().min(0).required()
    }).required()
  }).optional(),
  documentId: Joi.string().uuid().required()
});

export const typingEventSchema = Joi.object({
  documentId: Joi.string().uuid().required()
});

export const videoCallRequestSchema = Joi.object({
  targetUserId: Joi.string().uuid().required(),
  documentId: Joi.string().uuid().required()
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};