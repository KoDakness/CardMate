import { Target, ClipboardList, Users2, Settings, LogIn, LogOut, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  return (
    <header className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)] z-50">
      <nav className="max-w-screen-lg mx-auto grid grid-cols-6 h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center space-y-1 py-2 ${
            location.pathname === '/' 
              ? 'text-cardmate-green' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <Target className="h-6 w-6" />
          <span className="text-xs font-medium">Score</span>
        </Link>

        <Link 
          to="/scorecard" 
          className={`flex flex-col items-center justify-center space-y-1 py-2 ${
            location.pathname === '/scorecard' 
              ? 'text-cardmate-green' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <ClipboardList className="h-6 w-6" />
          <span className="text-xs font-medium">Scorecard</span>
        </Link>

        <Link 
          to="/manage" 
          className={`flex flex-col items-center justify-center space-y-1 py-2 ${
            location.pathname === '/manage' 
              ? 'text-cardmate-green' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <Users2 className="h-6 w-6" />
          <span className="text-xs font-medium">Players & Courses</span>
        </Link>

        <Link 
          to="/settings" 
          className={`flex flex-col items-center justify-center space-y-1 py-2 ${
            location.pathname === '/settings'
              ? 'text-cardmate-green' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs font-medium">Settings</span>
        </Link>

        {user ? (
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center space-y-1 py-2 text-gray-600 dark:text-gray-300"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        ) : (
          <Link 
            to="/auth" 
            className={`flex flex-col items-center justify-center space-y-1 py-2 ${
              location.pathname === '/auth' 
                ? 'text-cardmate-green' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <LogIn className="h-6 w-6" />
            <span className="text-xs font-medium">Sign In</span>
          </Link>
        )}
        <a
          href="https://paypal.me/KoDarknee94"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center space-y-1 py-2 text-gray-600 dark:text-gray-300 hover:text-cardmate-green transition-colors"
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs font-medium">Support</span>
        </a>
      </nav>
    </header>
  )
}