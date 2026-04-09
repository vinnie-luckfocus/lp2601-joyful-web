import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Leaderboard } from '../../../components/leaders/Leaderboard';

// Mock the hooks and components
vi.mock('../../../hooks/useLeaders', () => ({
  useLeaders: vi.fn(),
}));

import { useLeaders } from '../../../hooks/useLeaders';

const mockUseLeaders = useLeaders as ReturnType<typeof vi.fn>;

describe('Leaderboard', () => {
  const mockLeaders = [
    {
      user_id: 1,
      player_name: 'Player One',
      jersey_number: 10,
      team_name: 'Team A',
      value: 0.333,
      category: 'batting_average',
    },
    {
      user_id: 2,
      player_name: 'Player Two',
      jersey_number: 20,
      team_name: 'Team B',
      value: 0.300,
      category: 'batting_average',
    },
    {
      user_id: 3,
      player_name: 'Player Three',
      jersey_number: 30,
      team_name: 'Team C',
      value: 0.280,
      category: 'batting_average',
    },
    {
      user_id: 4,
      player_name: 'Player Four',
      jersey_number: 40,
      team_name: 'Team D',
      value: 0.270,
      category: 'batting_average',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLeaders.mockReturnValue({
      leaders: mockLeaders,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders leaderboard component', () => {
    render(<Leaderboard />);
    expect(screen.getByText('数据排行榜')).toBeInTheDocument();
  });

  it('displays title', () => {
    render(<Leaderboard />);
    expect(screen.getByText('数据排行榜')).toBeInTheDocument();
  });

  it('renders all category tabs', () => {
    render(<Leaderboard />);
    expect(screen.getByTestId('tab-batting_average')).toBeInTheDocument();
    expect(screen.getByTestId('tab-hits')).toBeInTheDocument();
    expect(screen.getByTestId('tab-home_runs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-rbis')).toBeInTheDocument();
  });

  it('shows correct tab labels', () => {
    render(<Leaderboard />);
    expect(screen.getByText('打击率')).toBeInTheDocument();
    expect(screen.getByText('安打')).toBeInTheDocument();
    expect(screen.getByText('本垒打')).toBeInTheDocument();
    expect(screen.getByText('打点')).toBeInTheDocument();
  });

  it('renders player rows', () => {
    render(<Leaderboard />);
    expect(screen.getByTestId('leader-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('leader-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('leader-row-3')).toBeInTheDocument();
    expect(screen.getByTestId('leader-row-4')).toBeInTheDocument();
  });

  it('displays player names', () => {
    render(<Leaderboard />);
    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('displays team names', () => {
    render(<Leaderboard />);
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('shows free agent text when team is null', () => {
    mockUseLeaders.mockReturnValue({
      leaders: [
        {
          user_id: 5,
          player_name: 'Free Agent',
          jersey_number: 50,
          team_name: null,
          value: 0.250,
          category: 'batting_average',
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Leaderboard />);
    expect(screen.getByText('自由球员')).toBeInTheDocument();
  });

  it('renders rank badges for top 3 with gold styling', () => {
    render(<Leaderboard />);
    const rank1 = screen.getByTestId('rank-badge-1');
    const rank2 = screen.getByTestId('rank-badge-2');
    const rank3 = screen.getByTestId('rank-badge-3');

    expect(rank1).toBeInTheDocument();
    expect(rank2).toBeInTheDocument();
    expect(rank3).toBeInTheDocument();
  });

  it('renders player links with correct href', () => {
    render(<Leaderboard />);
    const playerLink = screen.getByTestId('player-link-1');
    expect(playerLink).toHaveAttribute('href', '/players/1');
  });

  it('applies info blue color to links', () => {
    render(<Leaderboard />);
    const viewAllLink = screen.getByTestId('view-all-link');
    expect(viewAllLink).toHaveClass('text-[#3182CE]');
  });

  it('shows loading skeleton when data is loading', () => {
    mockUseLeaders.mockReturnValue({
      leaders: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<Leaderboard />);
    expect(screen.getByTestId('leaderboard-skeleton')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    mockUseLeaders.mockReturnValue({
      leaders: [],
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    });

    render(<Leaderboard />);
    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('无法加载排行榜数据')).toBeInTheDocument();
  });

  it('shows empty state when no leaders', () => {
    mockUseLeaders.mockReturnValue({
      leaders: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Leaderboard />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', () => {
    const mockRefetch = vi.fn();
    mockUseLeaders.mockReturnValue({
      leaders: [],
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: mockRefetch,
    });

    render(<Leaderboard />);
    const retryButton = screen.getByText('重试');
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('switches category when tab is clicked', async () => {
    render(<Leaderboard />);

    const hitsTab = screen.getByTestId('tab-hits');
    fireEvent.click(hitsTab);

    await waitFor(() => {
      expect(mockUseLeaders).toHaveBeenCalledWith('hits', 10);
    });
  });

  it('uses batting_average as default category', () => {
    render(<Leaderboard />);
    expect(mockUseLeaders).toHaveBeenCalledWith('batting_average', 10);
  });

  it('renders view all link', () => {
    render(<Leaderboard />);
    expect(screen.getByTestId('view-all-link')).toBeInTheDocument();
    expect(screen.getByText('查看全部')).toBeInTheDocument();
  });

  it('renders data freshness indicator', () => {
    render(<Leaderboard />);
    expect(screen.getByTestId('data-freshness-indicator')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Leaderboard className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders correct number of rows based on data', () => {
    render(<Leaderboard />);
    expect(screen.getByTestId('leader-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('leader-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('leader-row-3')).toBeInTheDocument();
    expect(screen.getByTestId('leader-row-4')).toBeInTheDocument();
    expect(screen.queryByTestId('leader-row-5')).not.toBeInTheDocument();
  });
});
