import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '@/store/documentStore';
import { useAuthStore } from '@/store/authStore';
import CollaborativeEditor from '@/components/CollaborativeEditor';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  ArrowLeft,
  Share2,
  Download,
  Settings,
  Users,
  Video,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';

const DocumentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadDocument, joinDocument, leaveDocument, currentDocument, isLoading } = useDocumentStore();
  const { user } = useAuthStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument(id).then((document) => {
        if (document) {
          joinDocument(id);
        }
      });
    }

    return () => {
      if (id) {
        leaveDocument();
      }
    };
  }, [id, loadDocument, joinDocument, leaveDocument]);

  const handleShareDocument = async () => {
    if (!currentDocument || !id) return;

    try {
      const { documentsAPI } = await import('@/utils/api');
      const result = await documentsAPI.shareDocument(id, { permission: 'editor' });
      navigator.clipboard.writeText(`${window.location.origin}/shared/${result.shareToken}`);
      alert('Share link copied to clipboard!');
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Failed to share document:', error);
    }
  };

  const handleDownloadDocument = () => {
    if (!currentDocument) return;

    const blob = new Blob([currentDocument.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDocument.title}.${getFileExtension(currentDocument.language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      markdown: 'md',
      sql: 'sql',
      shell: 'sh',
      plaintext: 'txt',
    };

    return extensions[language] || 'txt';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Document not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The document you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Document toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Document info */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentDocument.title}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  {currentDocument.language}
                </span>
                <span>•</span>
                <span>Auto-saved</span>
                {currentDocument.isPublic && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Public
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Toolbar actions */}
          <div className="flex items-center space-x-2">
            {/* Collaboration actions */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Share document"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              onClick={handleDownloadDocument}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Download document"
            >
              <Download className="h-5 w-5" />
            </button>

            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Start video call"
            >
              <Video className="h-5 w-5" />
            </button>

            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Chat"
            >
              <MessageSquare className="h-5 w-5" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Document settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main editor */}
      <CollaborativeEditor />

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Share Document
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Share Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}/shared/${currentDocument.shareToken || '...'}`}
                    readOnly
                    className="form-input rounded-r-none"
                  />
                  <button
                    onClick={handleShareDocument}
                    className="btn btn-primary rounded-l-none"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Permission Level
                </label>
                <select className="form-input">
                  <option value="editor">Can edit</option>
                  <option value="viewer">Can view only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link expires (optional)
                </label>
                <select className="form-input">
                  <option value="">Never</option>
                  <option value="1">1 hour</option>
                  <option value="24">1 day</option>
                  <option value="168">1 week</option>
                  <option value="720">30 days</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleShareDocument}
                className="btn btn-primary"
              >
                Share Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPage;