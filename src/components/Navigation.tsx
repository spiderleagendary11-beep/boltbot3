import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, MapPin, AlertTriangle, FileText, BarChart3, Navigation2, LogOut, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { storage, STORAGE_KEYS } from '../utils/localStorage';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sleepMode, setSleepMode] = React.useState(() => 
    storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false
  );

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/trip', icon: MapPin, label: 'Trip' },
    { path: '/sos', icon: AlertTriangle, label: 'SOS' },
    { path: '/report', icon: FileText, label: 'Report' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/tracking', icon: Navigation2, label: 'Tracking' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSleepMode = () => {
    const newSleepMode = !sleepMode;
    setSleepMode(newSleepMode);
    storage.set(STORAGE_KEYS.SLEEP_MODE, newSleepMode);
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Tourist Safety</span>
            {sleepMode && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                Sleep Mode
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSleepMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                sleepMode
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={sleepMode ? 'Disable Sleep Mode' : 'Enable Sleep Mode'}
            >
              <Moon className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}