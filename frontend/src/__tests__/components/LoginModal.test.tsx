import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginModal } from '../../components/LoginModal';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockChangePassword = vi.fn();

let authState = {
  user: null as { name: string; team_id: number | null; is_first_login: boolean } | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
};

const mockUseAuthStore = vi.fn(() => ({
  ...authState,
  login: mockLogin,
  logout: mockLogout,
  changePassword: mockChangePassword,
}));

mockUseAuthStore.getState = vi.fn(() => ({
  ...authState,
  login: mockLogin,
  logout: mockLogout,
  changePassword: mockChangePassword,
}));

vi.mock('../../stores/auth', () => {
  const useAuthStore = (...args: unknown[]) => mockUseAuthStore(...args);
  useAuthStore.getState = () => mockUseAuthStore.getState();
  return { useAuthStore };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

const renderModal = (props = { isOpen: true, onClose: vi.fn() }) => {
  return render(
    <MemoryRouter>
      <LoginModal {...props} />
    </MemoryRouter>
  );
};

describe('LoginModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { user: null, isAuthenticated: false, isLoading: false, error: null };
  });

  it('renders login form when open', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false, onClose: vi.fn() });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows validation error for short username', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'ab' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    await waitFor(() => {
      expect(screen.getByText('用户名至少需要 3 个字符')).toBeInTheDocument();
    });
  });

  it('calls login and redirects after successful login', async () => {
    mockLogin.mockImplementation(async () => {
      authState = { user: { name: 'User', team_id: 1, is_first_login: false }, isAuthenticated: true, isLoading: false, error: null };
    });

    renderModal();
    fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teams');
    });
  });

  it('shows change-password form for first-login users after login', async () => {
    mockLogin.mockImplementation(async () => {
      authState = { user: { name: 'User', team_id: null, is_first_login: true }, isAuthenticated: true, isLoading: false, error: null };
    });

    renderModal();
    fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: '修改密码' })).toBeInTheDocument();
    });
  });

  it('shows change-password form directly when authenticated and first login', () => {
    authState = { user: { name: 'User', team_id: null, is_first_login: true }, isAuthenticated: true, isLoading: false, error: null };
    renderModal();
    expect(screen.getByLabelText('原密码')).toBeInTheDocument();
    expect(screen.getByLabelText('新密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认新密码')).toBeInTheDocument();
  });

  it('validates password change fields', async () => {
    authState = { user: { name: 'User', team_id: null, is_first_login: true }, isAuthenticated: true, isLoading: false, error: null };
    renderModal();

    fireEvent.change(screen.getByLabelText('原密码'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'new' } });
    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'new' } });
    fireEvent.click(screen.getByRole('button', { name: '修改密码' }));

    await waitFor(() => {
      expect(screen.getByText('新密码至少需要 6 个字符')).toBeInTheDocument();
    });
  });

  it('validates matching passwords', async () => {
    authState = { user: { name: 'User', team_id: null, is_first_login: true }, isAuthenticated: true, isLoading: false, error: null };
    renderModal();

    fireEvent.change(screen.getByLabelText('原密码'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'different123' } });
    fireEvent.click(screen.getByRole('button', { name: '修改密码' }));

    await waitFor(() => {
      expect(screen.getByText('两次输入的新密码不一致')).toBeInTheDocument();
    });
  });

  it('calls changePassword and shows success view', async () => {
    mockChangePassword.mockResolvedValueOnce(undefined);
    authState = { user: { name: 'User', team_id: null, is_first_login: true }, isAuthenticated: true, isLoading: false, error: null };
    renderModal();

    fireEvent.change(screen.getByLabelText('原密码'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: '修改密码' }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('oldpass', 'newpass123');
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: '密码已修改' })).toBeInTheDocument();
    });
  });

  it('logs out and closes modal after password changed acknowledgement', async () => {
    mockChangePassword.mockResolvedValueOnce(undefined);
    const onClose = vi.fn();
    authState = { user: { name: 'User', team_id: null, is_first_login: true }, isAuthenticated: true, isLoading: false, error: null };
    renderModal({ isOpen: true, onClose });

    fireEvent.change(screen.getByLabelText('原密码'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: '修改密码' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '重新登录' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '重新登录' }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays store error in a friendly message', async () => {
    authState = { user: null, isAuthenticated: false, isLoading: false, error: '账号或密码错误' };
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('账号或密码错误')).toBeInTheDocument();
    });
  });

  it('closes modal when overlay is clicked', async () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });
    const overlay = screen.getByTestId('login-modal-overlay');
    fireEvent.click(overlay);
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
