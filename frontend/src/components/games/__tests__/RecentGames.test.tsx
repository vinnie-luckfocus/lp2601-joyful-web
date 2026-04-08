import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecentGames } from '../RecentGames';
import * as useRecentGamesModule from '../../../hooks/useRecentGames';
import type { RecentGame } from '../../../hooks/useRecentGames';

// Mock the hook
vi.mock('../../../hooks/useRecentGames', async () => {
  const actual = await vi.importActual<typeof useRecentGamesModule>('../../../hooks/useRecentGames');
  return {
    ...actual,
    useRecentGames: vi.fn(),
  };
});

const mockUseRecentGames = vi.mocked(useRecentGamesModule.useRecentGames);

describe('RecentGames', () => {
  const mockGames: RecentGame[] = [
    {
      id: 'game-1',
      homeTeam: { id: 'team-1', name: '红袜队', score: 5 },
      awayTeam: { id: 'team-2', name: '洋基队', score: 3 },
      matchDate: '2024-04-08T14:00:00Z',
      venue: '芬威球场',
      status: 'completed',
      highlights: [
        { type: 'hr', player: '张三', count: 2, description: '本垒打 x2' },
        { type: 'rbi', player: '李四', count: 3, description: '打点 x3' },
      ],
      lastUpdated: '2024-04-08T16:00:00Z',
    },
    {
      id: 'game-2',
      homeTeam: { id: 'team-3', name: '道奇队', score: 2 },
      awayTeam: { id: 'team-4', name: '巨人队', score: 7 },
      matchDate: '2024-04-07T20:00:00Z',
      venue: '道奇体育场',
      status: 'completed',
      highlights: [
        { type: 'hr', player: '王五', count: 1, description: '本垒打 x1' },
      ],
      lastUpdated: '2024-04-07T22:00:00Z',
    },
    {
      id: 'game-3',
      homeTeam: { id: 'team-5', name: '小熊队', score: 4 },
      awayTeam: { id: 'team-6', name: '红雀队', score: 3 },
      matchDate: '2024-04-06T18:00:00Z',
      venue: '瑞格利球场',
      status: 'completed',
      highlights: [],
      lastUpdated: '2024-04-06T20:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseRecentGames.mockReturnValue({
      games: [],
      isLoading: true,
      error: null,
      lastUpdated: null,
      refetch: vi.fn(),
    });

    render(<RecentGames />);

    expect(screen.getByTestId('recent-games-loading')).toBeInTheDocument();
    expect(screen.getByText('最近战报')).toBeInTheDocument();
  });

  it('renders games data correctly', () => {
    mockUseRecentGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    render(<RecentGames />);

    // Check header
    expect(screen.getByText('最近战报')).toBeInTheDocument();
    expect(screen.getByText('查看更多')).toBeInTheDocument();

    // Check game cards
    expect(screen.getAllByTestId('recent-game-card')).toHaveLength(3);

    // Check team names
    expect(screen.getByText('红袜队')).toBeInTheDocument();
    expect(screen.getByText('洋基队')).toBeInTheDocument();
    expect(screen.getByText('道奇队')).toBeInTheDocument();
    expect(screen.getByText('巨人队')).toBeInTheDocument();

    // Check scores
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Check venues
    expect(screen.getByText('芬威球场')).toBeInTheDocument();
    expect(screen.getByText('道奇体育场')).toBeInTheDocument();
    expect(screen.getByText('瑞格利球场')).toBeInTheDocument();
  });

  it('displays highlight badges correctly', () => {
    mockUseRecentGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    render(<RecentGames />);

    // Check highlight badges
    const badges = screen.getAllByTestId('highlight-badge');
    expect(badges.length).toBeGreaterThan(0);

    // Check specific highlight descriptions
    expect(screen.getByText('本垒打 x2')).toBeInTheDocument();
    expect(screen.getByText('打点 x3')).toBeInTheDocument();
    expect(screen.getByText('本垒打 x1')).toBeInTheDocument();
  });

  it('displays winner trophy for winning teams', () => {
    mockUseRecentGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    render(<RecentGames />);

    // Each game should have one winner trophy
    const trophies = screen.getAllByTestId('winner-trophy');
    expect(trophies).toHaveLength(3);
  });

  it('handles game click correctly', () => {
    const onGameClick = vi.fn();

    mockUseRecentGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    render(<RecentGames onGameClick={onGameClick} />);

    const cards = screen.getAllByTestId('recent-game-card');
    fireEvent.click(cards[0]);

    expect(onGameClick).toHaveBeenCalledWith('game-1');
  });

  it('handles view all click correctly', () => {
    const onViewAllClick = vi.fn();

    mockUseRecentGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    render(<RecentGames onViewAllClick={onViewAllClick} />);

    const viewAllButton = screen.getByTestId('view-all-button');
    fireEvent.click(viewAllButton);

    expect(onViewAllClick).toHaveBeenCalled();
  });

  it('renders error state correctly', () => {
    const refetch = vi.fn();
    const errorMessage = 'Failed to load games';

    mockUseRecentGames.mockReturnValue({
      games: [],
      isLoading: false,
      error: new Error(errorMessage),
      lastUpdated: null,
      refetch,
    });

    render(<RecentGames />);

    expect(screen.getByTestId('recent-games-error')).toBeInTheDocument();
    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Test retry button
    const retryButton = screen.getByText('重新加载');
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalled();
  });

  it('renders empty state correctly', () => {
    mockUseRecentGames.mockReturnValue({
      games: [],
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    render(<RecentGames />);

    expect(screen.getByTestId('recent-games-empty')).toBeInTheDocument();
    expect(screen.getByText('暂无最近战报')).toBeInTheDocument();
  });

  it('displays data freshness indicator', () => {
    mockUseRecentGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      refetch: vi.fn(),
    });

    render(<RecentGames />);

    expect(screen.getByTestId('data-freshness-indicator')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    mockUseRecentGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    const { container } = render(<RecentGames className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders game without highlights correctly', () => {
    const gamesWithoutHighlights: RecentGame[] = [
      {
        id: 'game-1',
        homeTeam: { id: 'team-1', name: '红袜队', score: 5 },
        awayTeam: { id: 'team-2', name: '洋基队', score: 3 },
        matchDate: '2024-04-08T14:00:00Z',
        venue: '芬威球场',
        status: 'completed',
        highlights: [],
        lastUpdated: '2024-04-08T16:00:00Z',
      },
    ];

    mockUseRecentGames.mockReturnValue({
      games: gamesWithoutHighlights,
      isLoading: false,
      error: null,
      lastUpdated: new Date('2024-04-08T16:00:00Z'),
      refetch: vi.fn(),
    });

    render(<RecentGames />);

    // Should not render highlights container
    expect(screen.queryByTestId('highlights-container')).not.toBeInTheDocument();
  });
});
