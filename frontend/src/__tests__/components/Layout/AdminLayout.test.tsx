import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLayout } from '../../../components/Layout';

vi.mock('../../../components/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

describe('AdminLayout', () => {
  it('should render Sidebar, Header, and ContentArea', () => {
    render(
      <AdminLayout>
        <div data-testid="content">Test Content</div>
      </AdminLayout>
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should apply ml-60 margin when sidebar is expanded', () => {
    render(
      <AdminLayout>
        <div data-testid="content">Test Content</div>
      </AdminLayout>
    );

    const mainContent = screen.getByTestId('main-container');
    expect(mainContent).toHaveClass('ml-60');
  });

  it('should apply ml-16 margin when sidebar is collapsed', () => {
    render(
      <AdminLayout>
        <div data-testid="content">Test Content</div>
      </AdminLayout>
    );

    const collapseButton = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(collapseButton);

    const mainContent = screen.getByTestId('main-container');
    expect(mainContent).toHaveClass('ml-16');
  });
});
