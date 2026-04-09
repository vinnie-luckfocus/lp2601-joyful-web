import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';

export interface NavbarProps {
  onLoginClick?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoginClick,
  onLogout,
  isLoggedIn = false,
  userName,
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveLink = (href: string): boolean => {
    if (href === '/schedule') {
      return location.pathname === '/schedule' || location.pathname.startsWith('/games');
    }
    return location.pathname === href;
  };

  const navLinks = [
    { label: '首页', href: '/' },
    { label: '球队', href: '/teams' },
    { label: '球员', href: '/players' },
    { label: '赛程', href: '/schedule' },
  ];

  return (
    <nav className={`bg-white shadow-sm sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center gap-2" aria-label="举父棒球联赛 - 返回首页">
              <div className="w-8 h-8 bg-mlb-navy rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">JF</span>
              </div>
              <span className="text-xl font-bold text-mlb-navy hidden sm:block">
                举父棒球联赛
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="主导航">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors focus:outline-none focus:ring-2 focus:ring-mlb-navy focus:ring-offset-2 rounded-md px-2 py-1 ${
                  isActiveLink(link.href)
                    ? 'text-mlb-navy font-semibold'
                    : 'text-gray-600 hover:text-mlb-navy font-medium'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Login/User Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-mlb-navy flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {userName || '用户'}
                  </span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className="text-gray-600 hover:text-mlb-red"
                >
                  退出
                </Button>
              </>
            ) : (
              <Button
                onClick={onLoginClick}
                variant="primary"
                className="bg-mlb-red hover:bg-mlb-red-dark"
              >
                登录
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-mlb-navy p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-mlb-navy focus:ring-offset-2"
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-200"
            id="mobile-menu"
            role="navigation"
            aria-label="移动端导航"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md ${
                    isActiveLink(link.href)
                      ? 'text-mlb-navy font-semibold bg-gray-50'
                      : 'text-gray-600 hover:text-mlb-navy hover:bg-gray-50 font-medium'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200 mt-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-mlb-navy flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {userName || '用户'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full text-left px-3 py-2 text-gray-600 hover:text-mlb-red hover:bg-gray-50 rounded-md font-medium"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick?.();
                    }}
                    variant="primary"
                    className="w-full bg-mlb-red hover:bg-mlb-red-dark"
                  >
                    登录
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
