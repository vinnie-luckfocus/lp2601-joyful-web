import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState, ErrorBoundaryState } from '../../components/common/ErrorState';

describe('ErrorState', () => {
  it('renders with default props', () => {
    render(<ErrorState />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('出错了')).toBeInTheDocument();
    expect(screen.getByText('加载数据时发生错误，请稍后重试')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorState title="Custom Title" message="Custom error message" />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    fireEvent.click(screen.getByRole('button', { name: '重试' }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders with custom retry label', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} retryLabel="Try Again" />);
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ErrorState className="custom-error" />);
    expect(screen.getByTestId('error-state')).toHaveClass('custom-error');
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders alert icon', () => {
    render(<ErrorState />);
    expect(screen.getByTestId('error-state').querySelector('svg')).toBeInTheDocument();
  });
});

describe('ErrorBoundaryState', () => {
  it('renders with default props', () => {
    render(<ErrorBoundaryState />);
    expect(screen.getByTestId('error-boundary-state')).toBeInTheDocument();
    expect(screen.getByText('页面出错了')).toBeInTheDocument();
    expect(screen.getByText('应用程序发生错误，请刷新页面重试')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorBoundaryState title="Boundary Error" message="Something went wrong" />
    );
    expect(screen.getByText('Boundary Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    const error = new Error('Test error message');
    render(<ErrorBoundaryState error={error} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('calls onRetry when refresh button is clicked', () => {
    const handleRetry = vi.fn();
    render(<ErrorBoundaryState onRetry={handleRetry} />);
    fireEvent.click(screen.getByRole('button', { name: '刷新页面' }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('reloads page when no onRetry provided', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(<ErrorBoundaryState />);
    fireEvent.click(screen.getByRole('button', { name: '刷新页面' }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<ErrorBoundaryState className="custom-boundary" />);
    expect(screen.getByTestId('error-boundary-state')).toHaveClass('custom-boundary');
  });

  it('renders with custom retry label', () => {
    render(<ErrorBoundaryState retryLabel="Reload Page" />);
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
  });
});
