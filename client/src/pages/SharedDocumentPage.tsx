import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { documentsAPI } from '@/utils/api';
import { Document } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import CollaborativeEditor from '@/components/CollaborativeEditor';
import { Login } from 'lucide-react';

const SharedDocumentPage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedDocument = async () => {
      if (!shareToken) {
        setError('Invalid share link');
        setIsLoading(false);
        return;
      }

      try {
        const doc = await documentsAPI.accessSharedDocument(shareToken);
        setDocument(doc);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to load shared document');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedDocument();
  }, [shareToken]);

  const handleLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-4">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Document Unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary w-full"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary w-full"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-4">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Login className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign in to Collaborate
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to sign in to access this shared document and collaborate with others.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {document.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {document.language} • {document.content.length} characters
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="btn btn-primary w-full"
          >
            Sign in to Continue
          </button>
        </div>
      </div>
    );
  }

  // Authenticated user can view the document
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simple header for shared documents */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {document.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Shared document • {document.language}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                Shared Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[calc(100vh-73px)]">
        <CollaborativeEditor />
      </div>
    </div>
  );
};

export default SharedDocumentPage;