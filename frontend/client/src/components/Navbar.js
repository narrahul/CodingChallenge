import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LogOut, User, Store, Users, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Stores', path: '/stores', icon: Store },
        { name: 'Profile', path: '/profile', icon: User }
      ];
    } else if (user.role === 'store_owner') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'Profile', path: '/profile', icon: User }
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'Stores', path: '/stores', icon: Store },
        { name: 'Profile', path: '/profile', icon: User }
      ];
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Store Ratings
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 