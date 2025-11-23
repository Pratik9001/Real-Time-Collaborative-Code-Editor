import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Search,
  Settings,
  HelpCircle,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const Sidebar = () => {
  const location = useLocation();
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      current: location.pathname.startsWith('/documents'),
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      current: location.pathname === '/search',
    },
  ];

  const secondaryNavigation = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
    {
      name: 'Help',
      href: '/help',
      icon: HelpCircle,
      current: location.pathname === '/help',
    },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CollabEditor
          </span>
        </Link>
      </div>

      {/* New Document Button */}
      <div className="p-4">
        <Link
          to="/documents/new"
          className="btn btn-primary w-full justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                item.current
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Collections section */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md"
          >
            {isCollectionsOpen ? (
              <ChevronDown className="mr-2 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-2 h-4 w-4" />
            )}
            Collections
          </button>

          {isCollectionsOpen && (
            <div className="mt-1 space-y-1">
              <Link
                to="/collections/personal"
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md pl-8"
              >
                Personal
              </Link>
              <Link
                to="/collections/shared"
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md pl-8"
              >
                Shared with me
              </Link>
              <Link
                to="/collections/templates"
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md pl-8"
              >
                Templates
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-1">
        {secondaryNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                item.current
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;