import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonTable } from '../../components/common/Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200');
  });

  it('renders with custom dimensions', () => {
    render(<Skeleton width={200} height={50} borderRadius={8} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    // Check that style attribute contains the values
    expect(skeleton.getAttribute('style')).toContain('width: 200px');
    expect(skeleton.getAttribute('style')).toContain('height: 50px');
    expect(skeleton.getAttribute('style')).toContain('border-radius: 8px');
  });

  it('renders with string dimensions', () => {
    render(<Skeleton width="100%" height="2rem" borderRadius="50%" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    // Check that style attribute contains the values
    expect(skeleton.getAttribute('style')).toContain('width: 100%');
    expect(skeleton.getAttribute('style')).toContain('height: 2rem');
    expect(skeleton.getAttribute('style')).toContain('border-radius: 50%');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton');
  });
});

describe('SkeletonCard', () => {
  it('renders with default rows', () => {
    render(<SkeletonCard />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'rounded-card', 'shadow-card');
  });

  it('renders with custom row count', () => {
    render(<SkeletonCard rows={5} />);
    const skeletons = screen.getAllByTestId('skeleton');
    // 1 title + 5 rows = 6 skeletons
    expect(skeletons.length).toBe(6);
  });

  it('applies custom className', () => {
    render(<SkeletonCard className="custom-card" />);
    expect(screen.getByTestId('skeleton-card')).toHaveClass('custom-card');
  });
});

describe('SkeletonTable', () => {
  it('renders with default columns and rows', () => {
    render(<SkeletonTable />);
    const table = screen.getByTestId('skeleton-table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('bg-white', 'rounded-card', 'shadow-card');
  });

  it('renders with custom columns and rows', () => {
    render(<SkeletonTable columns={3} rows={2} />);
    const skeletons = screen.getAllByTestId('skeleton');
    // 3 header + 3 * 2 rows = 9 skeletons
    expect(skeletons.length).toBe(9);
  });

  it('applies custom className', () => {
    render(<SkeletonTable className="custom-table" />);
    expect(screen.getByTestId('skeleton-table')).toHaveClass('custom-table');
  });
});
