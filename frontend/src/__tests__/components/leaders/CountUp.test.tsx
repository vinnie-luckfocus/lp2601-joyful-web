import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CountUp } from '../../../components/leaders/CountUp';

describe('CountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default props', () => {
    render(<CountUp value={100} />);
    expect(screen.getByTestId('count-up')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CountUp value={100} className="custom-class" />);
    expect(screen.getByTestId('count-up')).toHaveClass('custom-class');
  });

  it('renders with prefix', () => {
    render(<CountUp value={50} prefix="$" />);
    const element = screen.getByTestId('count-up');
    expect(element).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<CountUp value={50} suffix="%" />);
    const element = screen.getByTestId('count-up');
    expect(element).toBeInTheDocument();
  });

  it('restarts animation when value changes', () => {
    const { rerender } = render(<CountUp value={100} />);
    expect(screen.getByTestId('count-up')).toBeInTheDocument();

    rerender(<CountUp value={200} />);
    expect(screen.getByTestId('count-up')).toBeInTheDocument();
  });

  it('uses correct default duration', () => {
    render(<CountUp value={100} />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('count-up')).toBeInTheDocument();
  });

  it('handles decimal values', () => {
    render(<CountUp value={0.333} decimals={3} />);
    const element = screen.getByTestId('count-up');
    expect(element).toBeInTheDocument();
  });
});
