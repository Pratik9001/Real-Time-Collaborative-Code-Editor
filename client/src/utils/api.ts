import axios, { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse, AuthResponse, User, Document, DocumentListResponse } from '@/types';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
        });

        const { accessToken } = refreshResponse.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data!;
  },

  login: async (credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data.data!.user;
  },

  updateProfile: async (updates: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    preferences?: Record<string, any>;
  }): Promise<User> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/profile', updates);
    return response.data.data!.user;
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.put('/auth/password', passwords);
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await axios.post<ApiResponse<{ accessToken: string }>>(
      '/api/auth/refresh',
      {},
      { withCredentials: true }
    );
    return response.data.data!;
  },
};

// Documents API
export const documentsAPI = {
  createDocument: async (documentData: {
    title: string;
    content?: string;
    language?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<Document> => {
    const response = await api.post<ApiResponse<{ document: Document }>>('/documents', documentData);
    return response.data.data!.document;
  },

  getDocuments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: 'created_at' | 'updated_at' | 'title';
    sortOrder?: 'asc' | 'desc';
  }): Promise<DocumentListResponse> => {
    const response = await api.get<ApiResponse<DocumentListResponse>>('/documents', { params });
    return response.data.data!;
  },

  getDocument: async (id: string): Promise<Document> => {
    const response = await api.get<ApiResponse<{ document: Document }>>(`/documents/${id}`);
    return response.data.data!.document;
  },

  updateDocument: async (id: string, updates: {
    title?: string;
    content?: string;
    language?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<Document> => {
    const response = await api.put<ApiResponse<{ document: Document }>>(`/documents/${id}`, updates);
    return response.data.data!.document;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  shareDocument: async (id: string, shareData: {
    permission: 'editor' | 'viewer';
    expiresIn?: number;
  }): Promise<{ shareToken: string; expiresAt?: Date }> => {
    const response = await api.post<ApiResponse<any>>(`/documents/${id}/share`, shareData);
    return response.data.data;
  },

  accessSharedDocument: async (shareToken: string): Promise<Document> => {
    const response = await api.get<ApiResponse<{ document: Document }>>(`/documents/shared/${shareToken}`);
    return response.data.data!.document;
  },

  getDocumentUsers: async (id: string): Promise<any[]> => {
    const response = await api.get<ApiResponse<{ users: any[] }>>(`/documents/${id}/users`);
    return response.data.data!.users;
  },
};

export default api;