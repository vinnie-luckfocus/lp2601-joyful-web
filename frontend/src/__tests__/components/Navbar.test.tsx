import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../../components/layout/Navbar';

describe('Navbar', () => {
  it('renders with logo', () => {
    render(<Navbar />);
    expect(screen.getByText('JF')).toBeInTheDocument();
    expect(screen.getByText('举父棒球联赛')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('球队')).toBeInTheDocument();
    expect(screen.getByText('球员')).toBeInTheDocument();
    expect(screen.getByText('赛程')).toBeInTheDocument();
  });

  it('renders login button when not logged in', () => {
    render(<Navbar />);
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('calls onLoginClick when login button is clicked', () => {
    const handleLogin = vi.fn();
    render(<Navbar onLoginClick={handleLogin} />);
    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('renders user info when logged in', () => {
    render(<Navbar isLoggedIn userName="Test User" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '登录' })).not.toBeInTheDocument();
  });

  it('renders default user name when userName is not provided', () => {
    render(<Navbar isLoggedIn />);
    expect(screen.getByText('用户')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Navbar className="custom-navbar" />);
    expect(screen.getByRole('navigation')).toHaveClass('custom-navbar');
  });

  it('renders mobile menu button', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('打开菜单')).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Navbar />);
    const menuButton = screen.getByLabelText('打开菜单');
    fireEvent.click(menuButton);
    expect(screen.getByLabelText('关闭菜单')).toBeInTheDocument();
  });

  it('closes mobile menu when link is clicked', () => {
    render(<Navbar />);
    // Open menu
    fireEvent.click(screen.getByLabelText('打开菜单'));
    // Click a link - use the mobile menu link which is the second "首页"
    const links = screen.getAllByText('首页');
    fireEvent.click(links[links.length - 1]); // Click the last one (mobile menu)
    // Menu should be closed (button label changes back)
    expect(screen.getByLabelText('打开菜单')).toBeInTheDocument();
  });
});
