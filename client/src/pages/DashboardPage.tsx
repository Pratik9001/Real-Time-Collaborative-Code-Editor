import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentStore } from '@/store/documentStore';
import { Document, LANGUAGE_OPTIONS } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Search,
  Plus,
  FileText,
  Clock,
  Users,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react';

const DashboardPage = () => {
  const {
    loadDocuments,
    createDocument,
    deleteDocument,
    shareDocument,
    documents,
    isLoading,
  } = useDocumentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocumentData, setNewDocumentData] = useState({
    title: '',
    language: 'javascript',
    isPublic: false,
  });

  useEffect(() => {
    loadDocuments({
      search: searchQuery,
      language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
    });
  }, [searchQuery, selectedLanguage, loadDocuments]);

  const handleCreateDocument = async () => {
    try {
      if (!newDocumentData.title.trim()) return;

      const document = await createDocument(newDocumentData);
      setIsCreateModalOpen(false);
      setNewDocumentData({ title: '', language: 'javascript', isPublic: false });
      window.location.href = `/document/${document.id}`;
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const handleShareDocument = async (id: string) => {
    try {
      const result = await shareDocument(id, { permission: 'editor' });
      navigator.clipboard.writeText(`${window.location.origin}/shared/${result.shareToken}`);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share document:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLanguageInfo = (language: string) => {
    return LANGUAGE_OPTIONS.find(option => option.value === language) || LANGUAGE_OPTIONS[0];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Documents
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage your code documents
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* Language filter */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="form-input"
        >
          <option value="all">All Languages</option>
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        {/* Create button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </button>
      </div>

      {/* Documents grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first document
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => {
            const languageInfo = getLanguageInfo(document.language);
            return (
              <div
                key={document.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Link
                      to={`/document/${document.id}`}
                      className="flex-1"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2">
                        {document.title}
                      </h3>
                    </Link>
                    <div className="relative ml-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {/* Dropdown menu */}
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <Link
                          to={`/document/${document.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleShareDocument(document.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center">
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: languageInfo.value === 'javascript' ? '#f7df1e' :
                                         languageInfo.value === 'typescript' ? '#3178c6' :
                                         languageInfo.value === 'python' ? '#3776ab' :
                                         languageInfo.value === 'java' ? '#007396' :
                                         '#6b7280'
                        }}
                      />
                      {languageInfo.label}
                    </span>
                    {document.isPublic && (
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Public
                      </span>
                    )}
                  </div>

                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {document.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{document.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(document.updatedAt)}
                    </span>
                    <span>
                      {document.content.length} chars
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Document Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Document
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newDocumentData.title}
                  onChange={(e) => setNewDocumentData({ ...newDocumentData, title: e.target.value })}
                  className="form-input"
                  placeholder="Enter document title"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  id="language"
                  value={newDocumentData.language}
                  onChange={(e) => setNewDocumentData({ ...newDocumentData, language: e.target.value })}
                  className="form-input"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newDocumentData.isPublic}
                  onChange={(e) => setNewDocumentData({ ...newDocumentData, isPublic: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Make this document public
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={!newDocumentData.title.trim()}
                className="btn btn-primary"
              >
                Create Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;