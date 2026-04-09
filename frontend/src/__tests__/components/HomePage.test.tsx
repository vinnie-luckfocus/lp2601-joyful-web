import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from '../../pages/HomePage';

describe('HomePage', () => {
  it('renders with navbar', () => {
    render(<HomePage />);
    // Use getAllByText since there are multiple 'MLB' and 'Joyful Web' elements (navbar and footer)
    expect(screen.getAllByText('MLB').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Joyful Web').length).toBeGreaterThan(0);
  });

  it('renders hero section', () => {
    render(<HomePage />);
    expect(screen.getByText('MLB 数据平台')).toBeInTheDocument();
    expect(screen.getByText(/专业的棒球数据分析平台/)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<HomePage />);
    // Feature section has these titles
    expect(screen.getByText('球队数据', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('球员统计', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('赛程安排', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('数据趋势', { selector: 'h3' })).toBeInTheDocument();
  });

  it('renders component showcase section', () => {
    render(<HomePage />);
    expect(screen.getByText('组件展示')).toBeInTheDocument();
    expect(screen.getByText('基础布局与主题配置组件预览')).toBeInTheDocument();
  });

  it('renders skeleton demo', () => {
    render(<HomePage />);
    expect(screen.getByText('Skeleton 加载骨架')).toBeInTheDocument();
  });

  it('renders data freshness indicator demo', () => {
    render(<HomePage />);
    expect(screen.getByText('数据时效指示器')).toBeInTheDocument();
  });

  it('renders button demo', () => {
    render(<HomePage />);
    expect(screen.getByText('Button 按钮组件')).toBeInTheDocument();
  });

  it('renders error state demo', () => {
    render(<HomePage />);
    expect(screen.getByText('ErrorState 错误状态')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<HomePage />);
    expect(screen.getByText('数据仅供学习交流使用')).toBeInTheDocument();
  });

  it('navigates to login when login button is clicked', () => {
    const originalLocation = window.location;
    // @ts-expect-error - mocking window.location
    delete window.location;
    window.location = { href: '' } as Location;

    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });

  it('shows error state when simulate error is clicked', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: '模拟错误' }));
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('retries after error', async () => {
    vi.useFakeTimers();
    render(<HomePage />);

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
