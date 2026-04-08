import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  StandingsTable,
  RankBadge,
  WinRateBar,
  TableRow,
  EmptyState,
} from '../../components/standings/StandingsTable';
import * as useStandingsModule from '../../hooks/useStandings';

// Mock the useStandings hook
vi.mock('../../hooks/useStandings', () => ({
  useStandings: vi.fn(),
}));

const mockUseStandings = vi.mocked(useStandingsModule.useStandings);

describe('RankBadge', () => {
  it('renders rank number', () => {
    render(<RankBadge rank={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies gold styling for top 3 ranks', () => {
    const { rerender } = render(<RankBadge rank={1} />);
    expect(screen.getByTestId('rank-badge-1')).toHaveClass('bg-[#C4A35A]', 'text-white');

    rerender(<RankBadge rank={2} />);
    expect(screen.getByTestId('rank-badge-2')).toHaveClass('bg-[#C4A35A]', 'text-white');

    rerender(<RankBadge rank={3} />);
    expect(screen.getByTestId('rank-badge-3')).toHaveClass('bg-[#C4A35A]', 'text-white');
  });

  it('applies gray styling for ranks below top 3', () => {
    render(<RankBadge rank={4} />);
    expect(screen.getByTestId('rank-badge-4')).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('applies gold styling for rank 3 boundary', () => {
    render(<RankBadge rank={3} />);
    expect(screen.getByTestId('rank-badge-3')).toHaveClass('bg-[#C4A35A]');
  });
});

describe('WinRateBar', () => {
  it('renders win rate percentage', () => {
    render(<WinRateBar winRate={75.5} />);
    expect(screen.getByText('75.5%')).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    render(<WinRateBar winRate={60} />);
    const bar = screen.getByTestId('win-rate-bar');
    expect(bar).toHaveStyle({ width: '60%' });
  });

  it('handles zero win rate', () => {
    render(<WinRateBar winRate={0} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByTestId('win-rate-bar')).toHaveStyle({ width: '0%' });
  });

  it('handles 100% win rate', () => {
    render(<WinRateBar winRate={100} />);
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    expect(screen.getByTestId('win-rate-bar')).toHaveStyle({ width: '100%' });
  });
});

describe('TableRow', () => {
  const mockStanding = {
    id: 1,
    name: 'Test Team',
    division: 'Division A',
    wins: 10,
    losses: 5,
    win_percentage: 66.67,
    rank: 2,
  };

  it('renders team information correctly', () => {
    render(<TableRow standing={mockStanding} />);

    expect(screen.getByText('Test Team')).toBeInTheDocument();
    expect(screen.getByText('Division A')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('66.7%')).toBeInTheDocument();
  });

  it('renders rank badge', () => {
    render(<TableRow standing={mockStanding} />);
    expect(screen.getByTestId('rank-badge-2')).toBeInTheDocument();
  });

  it('renders without division when null', () => {
    const standingWithoutDivision = { ...mockStanding, division: null };
    render(<TableRow standing={standingWithoutDivision} />);

    expect(screen.getByText('Test Team')).toBeInTheDocument();
    expect(screen.queryByText('Division A')).not.toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders empty state message', () => {
    render(<EmptyState />);

    expect(screen.getByText('暂无积分榜数据')).toBeInTheDocument();
    expect(screen.getByText('目前还没有球队战绩数据，请稍后再来查看')).toBeInTheDocument();
  });

  it('renders refresh button when onRefresh provided', () => {
    const onRefresh = vi.fn();
    render(<EmptyState onRefresh={onRefresh} />);

    expect(screen.getByText('刷新数据')).toBeInTheDocument();
  });

  it('does not render refresh button when onRefresh not provided', () => {
    render(<EmptyState />);

    expect(screen.queryByText('刷新数据')).not.toBeInTheDocument();
  });

  it('calls onRefresh when button clicked', () => {
    const onRefresh = vi.fn();
    render(<EmptyState onRefresh={onRefresh} />);

    fireEvent.click(screen.getByText('刷新数据'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});

describe('StandingsTable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const mockStandings = [
    { id: 1, name: 'Team A', division: 'Division 1', wins: 15, losses: 5, win_percentage: 75.0 },
    { id: 2, name: 'Team B', division: 'Division 1', wins: 12, losses: 8, win_percentage: 60.0 },
    { id: 3, name: 'Team C', division: 'Division 2', wins: 10, losses: 10, win_percentage: 50.0 },
    { id: 4, name: 'Team D', division: null, wins: 5, losses: 15, win_percentage: 25.0 },
  ];

  it('renders loading state', () => {
    mockUseStandings.mockReturnValue({
      standings: [],
      isLoading: true,
      error: null,
      lastUpdated: null,
      refetch: vi.fn(),
    });

    render(<StandingsTable />);
    expect(screen.getAllByTestId('skeleton-table').length).toBeGreaterThan(0);
  });

  it('renders error state', () => {
    const refetch = vi.fn();
    mockUseStandings.mockReturnValue({
      standings: [],
      isLoading: false,
      error: new Error('Network error'),
      lastUpdated: null,
      refetch,
    });

    render(<StandingsTable />);

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('重新加载')).toBeInTheDocument();
  });

  it('renders empty state when no standings', () => {
    mockUseStandings.mockReturnValue({
      standings: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      refetch: vi.fn(),
    });

    render(<StandingsTable />);

    expect(screen.getByText('暂无积分榜数据')).toBeInTheDocument();
  });

  it('renders table with standings data', () => {
    mockUseStandings.mockReturnValue({
      standings: mockStandings,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      refetch: vi.fn(),
    });

    render(<StandingsTable />);

    // Check headers
    expect(screen.getByText('排名')).toBeInTheDocument();
    expect(screen.getByText('球队')).toBeInTheDocument();
    expect(screen.getByText('胜')).toBeInTheDocument();
    expect(screen.getByText('负')).toBeInTheDocument();
    expect(screen.getByText('胜率')).toBeInTheDocument();

    // Check team names
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
    expect(screen.getByText('Team D')).toBeInTheDocument();
  });

  it('applies gold styling to top 3 teams', () => {
    mockUseStandings.mockReturnValue({
      standings: mockStandings,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      refetch: vi.fn(),
    });

    render(<StandingsTable />);

    // Top 3 should have gold styling
    expect(screen.getByTestId('rank-badge-1')).toHaveClass('bg-[#C4A35A]');
    expect(screen.getByTestId('rank-badge-2')).toHaveClass('bg-[#C4A35A]');
    expect(screen.getByTestId('rank-badge-3')).toHaveClass('bg-[#C4A35A]');

    // 4th should have gray styling
    expect(screen.getByTestId('rank-badge-4')).toHaveClass('bg-gray-100');
  });

  it('displays data freshness indicator', () => {
    const now = new Date();
    mockUseStandings.mockReturnValue({
      standings: mockStandings,
      isLoading: false,
      error: null,
      lastUpdated: now,
      refetch: vi.fn(),
    });

    render(<StandingsTable />);

    expect(screen.getByTestId('data-freshness-indicator')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    mockUseStandings.mockReturnValue({
      standings: mockStandings,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      refetch: vi.fn(),
    });

    render(<StandingsTable ariaLabel="Team Standings" />);

    const table = screen.getByLabelText('Team Standings');
    expect(table).toBeInTheDocument();
    expect(table.tagName).toBe('TABLE');

    // Check scope attributes on headers
    const headers = screen.getAllByRole('columnheader');
    headers.forEach(header => {
      expect(header).toHaveAttribute('scope', 'col');
    });
  });

  it('applies custom className', () => {
    mockUseStandings.mockReturnValue({
      standings: mockStandings,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      refetch: vi.fn(),
    });

    render(<StandingsTable className="custom-class" />);

    const container = screen.getByLabelText('球队积分榜').closest('.custom-class');
    expect(container).toHaveClass('custom-class');
  });

  it('calls refetch when retry button clicked in error state', () => {
    const refetch = vi.fn();
    mockUseStandings.mockReturnValue({
      standings: [],
      isLoading: false,
      error: new Error('Failed to load'),
      lastUpdated: null,
      refetch,
    });

    render(<StandingsTable />);

    fireEvent.click(screen.getByText('重新加载'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders responsive table container', () => {
    mockUseStandings.mockReturnValue({
      standings: mockStandings,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      refetch: vi.fn(),
    });

    render(<StandingsTable />);

    // Table should be wrapped in overflow-x-auto container
    const table = screen.getByLabelText('球队积分榜');
    const container = table.parentElement;
    expect(container).toHaveClass('overflow-x-auto');
  });

  it('renders minimum width for mobile responsiveness', () => {
    mockUseStandings.mockReturnValue({
      standings: mockStandings,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      refetch: vi.fn(),
    });

    render(<StandingsTable />);

    const table = screen.getByLabelText('球队积分榜');
    expect(table).toHaveClass('min-w-[600px]');
  });
});
