import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HomePage } from '../../pages/HomePage';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </HelmetProvider>
);

const mockCheckAuth = vi.fn();
const mockUseAuthStore = vi.fn(() => ({
  isAuthenticated: false,
  user: null,
  checkAuth: mockCheckAuth,
}));

vi.mock('../../stores/auth', () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
}));

describe('HomePage', () => {
  beforeEach(() => {
    mockCheckAuth.mockClear();
  });

  it('renders with navbar', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getAllByText('JF').length).toBeGreaterThan(0);
    expect(screen.getAllByText('举父棒球联赛').length).toBeGreaterThan(0);
  });

  it('renders hero section', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByTestId('hero-title')).toHaveTextContent('举父棒球联赛');
    expect(screen.getByTestId('hero-slogan')).toHaveTextContent(/专业的棒球联赛数据平台/);
  });

  it('renders feature cards', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('球队数据', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('球员统计', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('赛程安排', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('数据趋势', { selector: 'h3' })).toBeInTheDocument();
  });

  it('renders component showcase section', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('组件展示')).toBeInTheDocument();
    expect(screen.getByText('基础布局与主题配置组件预览')).toBeInTheDocument();
  });

  it('renders skeleton demo', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('Skeleton 加载骨架')).toBeInTheDocument();
  });

  it('renders data freshness indicator demo', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('数据时效指示器')).toBeInTheDocument();
  });

  it('renders button demo', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('Button 按钮组件')).toBeInTheDocument();
  });

  it('renders error state demo', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('ErrorState 错误状态')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('数据仅供学习交流使用')).toBeInTheDocument();
  });

  it('opens login modal when login button is clicked', async () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    fireEvent.click(screen.getByTestId('hero-login-button'));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: '登录' })).toBeInTheDocument();
    });
  });

  it('shows user info in navbar when logged in', () => {
    mockUseAuthStore.mockReturnValueOnce({
      isAuthenticated: true,
      user: { name: 'Test User' },
      checkAuth: mockCheckAuth,
    });
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('opens login modal from navbar login button', async () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    const navLoginButtons = screen.getAllByRole('button', { name: '登录' });
    // Desktop navbar login button
    fireEvent.click(navLoginButtons[0]);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: '登录' })).toBeInTheDocument();
    });
  });

  it('shows error state when simulate error is clicked', () => {
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );
    fireEvent.click(screen.getByRole('button', { name: '模拟错误' }));
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('retries after error', async () => {
    vi.useFakeTimers();
    render(
      <AllProviders>
        <HomePage />
      </AllProviders>
    );

    // Trigger error
    fireEvent.click(screen.getByRole('button', { name: '模拟错误' }));
    expect(screen.getByText('加载失败')).toBeInTheDocument();

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: '重试' }));

    // Fast-forward loading state
    await vi.advanceTimersByTimeAsync(1500);

    // Should show the simulate button again
    expect(screen.getByRole('button', { name: '模拟错误' })).toBeInTheDocument();

    vi.useRealTimers();
  });
});
