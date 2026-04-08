/**
 * Sidebar Component Tests
 * Tests sidebar layout and MLB theme styling
 * Coverage: PRD01 - Admin layout requirements
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../../frontend/src/components/Layout/Sidebar';

// Mock the Navigation component
vi.mock('../../../frontend/src/components/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

// Mock the menu config
vi.mock('../../../frontend/src/config/menu', () => ({
  adminMenu: [],
}));

describe('Sidebar Component', () => {
  it('should render with expanded state by default', () => {
    render(<Sidebar />);

    const sidebar = screen.getByText('Admin').parentElement?.parentElement;
    expect(sidebar).toHaveClass('w-60');
  });

  it('should render with collapsed state', () => {
    render(<Sidebar collapsed={true} />);

    const sidebar = screen.getByText('A').parentElement?.parentElement;
    expect(sidebar).toHaveClass('w-16');
  });

  it('should have MLB Navy background color', () => {
    render(<Sidebar />);

    const sidebar = screen.getByText('Admin').parentElement?.parentElement;
    expect(sidebar).toHaveClass('bg-mlb-navy');
  });

  it('should toggle collapse when button clicked', () => {
    const onCollapse = vi.fn();
    render(<Sidebar collapsed={false} onCollapse={onCollapse} />);

    const collapseButton = screen.getByRole('button');
    fireEvent.click(collapseButton);

    expect(onCollapse).toHaveBeenCalledWith(true);
  });

  it('should render Navigation component', () => {
    render(<Sidebar />);

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should have fixed positioning and full height', () => {
    render(<Sidebar />);

    const sidebar = screen.getByText('Admin').parentElement?.parentElement;
    expect(sidebar).toHaveClass('fixed', 'h-screen');
  });

  it('should have z-50 for proper layering', () => {
    render(<Sidebar />);

    const sidebar = screen.getByText('Admin').parentElement?.parentElement;
    expect(sidebar).toHaveClass('z-50');
  });
});
