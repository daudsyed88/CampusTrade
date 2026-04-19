import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-syne font-bold text-blue-400">CampusTrade</Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-300">Home</Link>
          {isAuthenticated ? (
            <>
              {user?.isAdmin && (
                <Link to="/security" className="text-emerald-400 hover:text-emerald-300 font-medium">Security</Link>
              )}
              <Link to="/my-listings" className="hover:text-blue-300">My Listings</Link>
              <Link to="/create" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md font-medium text-white transition-colors">
                Sell Item
              </Link>
              <Link to="/setup-2fa" className="flex items-center gap-1 hover:text-blue-300">
                Setup 2FA
                {!user?.twoFactorEnabled && (
                  <span className="flex h-2 w-2 rounded-full bg-amber-500" title="2FA not enabled"></span>
                )}
              </Link>
              <button 
                onClick={logout} 
                className="text-slate-300 hover:text-white"
              >
                Logout ({user?.displayName})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-300">Login</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md font-medium text-white transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
