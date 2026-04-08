import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DataFreshnessIndicator, formatTimeAgo } from '../../components/common/DataFreshnessIndicator';

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "刚刚更新" for future dates', () => {
    const future = new Date(Date.now() + 1000);
    expect(formatTimeAgo(future)).toBe('刚刚更新');
  });

  it('returns seconds for recent timestamps', () => {
    const now = new Date();
    expect(formatTimeAgo(now)).toBe('0秒前更新');

    const fiveSecondsAgo = new Date(now.getTime() - 5000);
    expect(formatTimeAgo(fiveSecondsAgo)).toBe('5秒前更新');
  });

  it('returns minutes for timestamps within an hour', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('5分钟前更新');

    const fiftyNineMinutesAgo = new Date(Date.now() - 59 * 60 * 1000);
    expect(formatTimeAgo(fiftyNineMinutesAgo)).toBe('59分钟前更新');
  });

  it('returns hours for timestamps within a day', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(formatTimeAgo(oneHourAgo)).toBe('1小时前更新');

    const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);
    expect(formatTimeAgo(twentyThreeHoursAgo)).toBe('23小时前更新');
  });

  it('returns days for timestamps within a month', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(oneDayAgo)).toBe('1天前更新');

    const twentyNineDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(twentyNineDaysAgo)).toBe('29天前更新');
  });

  it('returns months for timestamps within a year', () => {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(oneMonthAgo)).toBe('1个月前更新');

    const elevenMonthsAgo = new Date(Date.now() - 11 * 30 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(elevenMonthsAgo)).toBe('11个月前更新');
  });

  it('returns years for old timestamps', () => {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(oneYearAgo)).toBe('1年前更新');
  });

  it('handles string timestamps', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('5分钟前更新');
  });

  it('handles numeric timestamps', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('5分钟前更新');
  });
});

describe('DataFreshnessIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with timestamp', () => {
    const now = new Date();
    render(<DataFreshnessIndicator lastUpdated={now} />);
    expect(screen.getByTestId('data-freshness-indicator')).toBeInTheDocument();
    expect(screen.getByText('0秒前更新')).toBeInTheDocument();
  });

  it('renders with icon by default', () => {
    render(<DataFreshnessIndicator lastUpdated={new Date()} />);
    expect(screen.getByTestId('data-freshness-indicator').querySelector('svg')).toBeInTheDocument();
  });

  it('can hide icon', () => {
    render(<DataFreshnessIndicator lastUpdated={new Date()} showIcon={false} />);
    expect(screen.getByTestId('data-freshness-indicator').querySelector('svg')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DataFreshnessIndicator lastUpdated={new Date()} className="custom-class" />);
    expect(screen.getByTestId('data-freshness-indicator')).toHaveClass('custom-class');
  });

  it('updates time every minute', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    render(<DataFreshnessIndicator lastUpdated={fiveMinutesAgo} />);

    expect(screen.getByText('5分钟前更新')).toBeInTheDocument();

    // Advance time by 1 minute
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText('6分钟前更新')).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = render(<DataFreshnessIndicator lastUpdated={new Date()} />);
    unmount();
    // Should not throw error when advancing timers after unmount
    act(() => {
      vi.advanceTimersByTime(60000);
    });
  });
});
