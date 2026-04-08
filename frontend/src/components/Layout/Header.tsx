import { LogOut, User } from 'lucide-react';

export interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user = { name: 'Admin User' },
  onLogout,
}) => {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left side - Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      {/* Right side - User Info & Logout */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-mlb-navy flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user.name}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-mlb-red hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
