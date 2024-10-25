import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  PhoneIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const VerticalNavbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const callerLinks = Array.from({ length: 7 }, (_, i) => ({
    name: `Caller ${i + 1}`,
    path: `/app/caller/${i + 1}`,
    icon: PhoneIcon,
  }));

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors ${
          isActive ? 'bg-indigo-50 text-indigo-700' : ''
        }`
      }
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{children}</span>
    </NavLink>
  );

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Call Dashboard</h1>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-2">
          <NavItem to="/app/dashboard" icon={HomeIcon}>
            Dashboard
          </NavItem>
          
          <div className="pt-4 pb-2">
            <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
              Callers
            </div>
          </div>
          
          {callerLinks.map((link) => (
            <NavItem key={link.path} to={link.path} icon={link.icon}>
              {link.name}
            </NavItem>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalNavbar;