import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { Button } from '../common/Button';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = 'login' | 'change-password' | 'password-changed';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login, logout, changePassword, user, isLoading, error, isAuthenticated } = useAuthStore();

  const [view, setView] = useState<ModalView>('login');
  const [shake, setShake] = useState(false);

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginValidationError, setLoginValidationError] = useState('');

  // Change password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeValidationError, setChangeValidationError] = useState('');

  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastFocusedElementRef = useRef<Element | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement;
      setLoginValidationError('');
      setChangeValidationError('');
      setUsername('');
      setPassword('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Determine initial view based on auth state
      if (isAuthenticated && user?.is_first_login) {
        setView('change-password');
      } else {
        setView('login');
      }
    } else {
      setShake(false);
    }
  }, [isOpen, isAuthenticated, user]);

  // Focus first input when view changes or opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, view]);

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && lastFocusedElementRef.current instanceof HTMLElement) {
      lastFocusedElementRef.current.focus();
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Simple focus trap
  const handleTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab' || !overlayRef.current) return;

      const focusableElements = overlayRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input[type="text"], input[type="password"], [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    },
    []
  );

  // Trigger shake on error changes
  useEffect(() => {
    if ((error || loginValidationError || changeValidationError) && isOpen) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error, loginValidationError, changeValidationError, isOpen]);

  const redirectAfterLogin = useCallback(
    (loggedInUser: { team_id?: number | null }) => {
      // Redirect to a personal-related page based on team_id presence
      if (loggedInUser.team_id) {
        navigate('/teams');
      } else {
        navigate('/players');
      }
    },
    [navigate]
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginValidationError('');

    if (username.trim().length < 3) {
      setLoginValidationError('用户名至少需要 3 个字符');
      return;
    }
    if (password.length < 6) {
      setLoginValidationError('密码至少需要 6 个字符');
      return;
    }

    try {
      await login(username.trim(), password);
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.is_first_login) {
        setView('change-password');
      } else {
        onClose();
        if (currentUser) {
          redirectAfterLogin(currentUser);
        }
      }
    } catch {
      // error handled by store
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeValidationError('');

    if (newPassword.length < 6) {
      setChangeValidationError('新密码至少需要 6 个字符');
      return;
    }
    if (newPassword.length > 72) {
      setChangeValidationError('新密码不能超过 72 个字符');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeValidationError('两次输入的新密码不一致');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setView('password-changed');
    } catch {
      // error handled by store
    }
  };

  const handlePasswordChangedAcknowledge = () => {
    setView('login');
    onClose();
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const displayError = error || loginValidationError || changeValidationError;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          onClick={handleOverlayClick}
          onKeyDown={handleTabKey}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(4, 30, 66, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={view === 'login' ? '登录' : view === 'change-password' ? '修改密码' : '密码已修改'}
          data-testid="login-modal-overlay"
        >
          <motion.div
            className="w-full max-w-md mx-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={handleCardClick}
            data-testid="login-modal-card"
          >
            <motion.div
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-card shadow-card p-8"
            >
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="w-12 h-12 bg-mlb-navy rounded-full flex items-center justify-center mb-3"
                  style={{ width: 48, height: 48 }}
                  aria-hidden="true"
                >
                  <span className="text-white font-bold text-lg">JF</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {view === 'login' && '登录到举父棒球联赛'}
                  {view === 'change-password' && '首次登录，请修改密码'}
                  {view === 'password-changed' && '密码修改成功'}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">
                  {view === 'login' && '请输入您的账号和密码'}
                  {view === 'change-password' && '为了账号安全，请修改默认密码'}
                  {view === 'password-changed' && '请使用新密码重新登录'}
                </p>
              </div>

              {view === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="login-username"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      用户名
                    </label>
                    <input
                      ref={firstInputRef}
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-button outline-none transition-all duration-200 focus:ring-2 focus:ring-mlb-red focus:border-mlb-red"
                      placeholder="请输入用户名"
                      required
                      disabled={isLoading}
                      aria-invalid={!!loginValidationError}
                      aria-describedby={loginValidationError ? 'login-error' : undefined}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      密码
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-button outline-none transition-all duration-200 focus:ring-2 focus:ring-mlb-red focus:border-mlb-red"
                      placeholder="请输入密码"
                      required
                      disabled={isLoading}
                      aria-invalid={!!loginValidationError}
                      aria-describedby={loginValidationError ? 'login-error' : undefined}
                    />
                  </div>

                  {displayError && (
                    <div
                      id="login-error"
                      className="p-3 bg-red-50 border border-red-200 rounded-button"
                      role="alert"
                    >
                      <p className="text-sm text-red-600">{displayError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full bg-mlb-red hover:bg-mlb-red-dark focus:ring-mlb-red"
                    ariaLabel="登录"
                  >
                    {isLoading ? '登录中……' : '登录'}
                  </Button>
                </form>
              )}

              {view === 'change-password' && (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="old-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      原密码
                    </label>
                    <input
                      ref={firstInputRef}
                      id="old-password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-button outline-none transition-all duration-200 focus:ring-2 focus:ring-mlb-red focus:border-mlb-red"
                      placeholder="请输入原密码"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      新密码
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-button outline-none transition-all duration-200 focus:ring-2 focus:ring-mlb-red focus:border-mlb-red"
                      placeholder="请输入新密码"
                      required
                      disabled={isLoading}
                      aria-invalid={!!changeValidationError}
                      aria-describedby={changeValidationError ? 'change-error' : undefined}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      确认新密码
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-button outline-none transition-all duration-200 focus:ring-2 focus:ring-mlb-red focus:border-mlb-red"
                      placeholder="请再次输入新密码"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {displayError && (
                    <div
                      id="change-error"
                      className="p-3 bg-red-50 border border-red-200 rounded-button"
                      role="alert"
                    >
                      <p className="text-sm text-red-600">{displayError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full bg-mlb-red hover:bg-mlb-red-dark focus:ring-mlb-red"
                    ariaLabel="修改密码"
                  >
                    {isLoading ? '提交中……' : '修改密码'}
                  </Button>
                </form>
              )}

              {view === 'password-changed' && (
                <div className="space-y-5 text-center">
                  <p className="text-gray-700">您的密码已成功更新。</p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-mlb-red hover:bg-mlb-red-dark focus:ring-mlb-red"
                    onClick={handlePasswordChangedAcknowledge}
                    ariaLabel="重新登录"
                  >
                    重新登录
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { LoginModal };
export default LoginModal;
