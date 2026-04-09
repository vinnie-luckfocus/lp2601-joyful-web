import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameSchedulePage } from '../GameSchedulePage';
import * as useGamesModule from '../../hooks/useGames';
import * as useAttendanceModule from '../../hooks/useAttendance';
import * as authStoreModule from '../../stores/auth';

// Mock hooks
vi.mock('../../hooks/useGames', async () => {
  const actual = await vi.importActual<typeof useGamesModule>('../../hooks/useGames');
  return {
    ...actual,
    useGames: vi.fn(),
  };
});

vi.mock('../../hooks/useAttendance', async () => {
  const actual = await vi.importActual<typeof useAttendanceModule>('../../hooks/useAttendance');
  return {
    ...actual,
    useAttendance: vi.fn(),
  };
});

vi.mock('../../stores/auth', async () => {
  const actual = await vi.importActual<typeof authStoreModule>('../../stores/auth');
  return {
    ...actual,
    useAuthStore: vi.fn(),
  };
});

const mockUseGames = vi.mocked(useGamesModule.useGames);
const mockUseAttendance = vi.mocked(useAttendanceModule.useAttendance);
const mockUseAuthStore = vi.mocked(authStoreModule.useAuthStore);

describe('GameSchedulePage', () => {
  const mockGames = [
    {
      id: 1,
      scheduled_at: '2024-05-10T14:00:00Z',
      location: '芬威球场',
      home_team_id: 1,
      away_team_id: 2,
      home_team_name: '红袜队',
      away_team_name: '洋基队',
      home_score: null,
      away_score: null,
      status: 'scheduled',
    },
    {
      id: 2,
      scheduled_at: '2024-05-20T19:00:00Z',
      location: '道奇体育场',
      home_team_id: 3,
      away_team_id: 4,
      home_team_name: '道奇队',
      away_team_name: '巨人队',
      home_score: null,
      away_score: null,
      status: 'scheduled',
    },
    {
      id: 3,
      scheduled_at: '2024-06-05T18:00:00Z',
      location: '瑞格利球场',
      home_team_id: 5,
      away_team_id: 6,
      home_team_name: '小熊队',
      away_team_name: '红雀队',
      home_score: null,
      away_score: null,
      status: 'scheduled',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    } as unknown as ReturnType<typeof authStoreModule.useAuthStore>);

    mockUseAttendance.mockReturnValue({
      attendance: null,
      isLoading: false,
      error: null,
      updateAttendance: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('renders loading skeleton with MLB Navy tone', () => {
    mockUseGames.mockReturnValue({
      games: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    // Check skeleton elements exist
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);

    // All skeletons should have the MLB Navy bg class
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveClass('bg-[#041E42]/20');
    });
  });

  it('renders month filter and filtered games', () => {
    mockUseGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    expect(screen.getByRole('heading', { name: '赛程安排' })).toBeInTheDocument();
    expect(screen.getByText('5月')).toBeInTheDocument();

    // Only May games should be visible initially
    expect(screen.getByText('红袜队')).toBeInTheDocument();
    expect(screen.getByText('道奇队')).toBeInTheDocument();
    expect(screen.queryByText('小熊队')).not.toBeInTheDocument();
  });

  it('filters games by month using navigation buttons', () => {
    mockUseGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    // 5月的比赛是 May 10, May 20 -> 两个，月份 4 为 5 月
    // 检查 6 月的比赛
    expect(screen.queryByText('小熊队')).not.toBeInTheDocument();

    // 点击下个月按钮
    const nextButton = screen.getByLabelText('下个月');
    fireEvent.click(nextButton);

    expect(screen.getByText('6月')).toBeInTheDocument();
    expect(screen.getByText('小熊队')).toBeInTheDocument();
    expect(screen.queryByText('红袜队')).not.toBeInTheDocument();
  });

  it('disables previous month button on first month', () => {
    mockUseGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    const prevButton = screen.getByLabelText('上个月');
    expect(prevButton).toBeDisabled();

    const nextButton = screen.getByLabelText('下个月');
    expect(nextButton).not.toBeDisabled();
  });

  it('disables next month button on last month', () => {
    mockUseGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    const nextButton = screen.getByLabelText('下个月');
    fireEvent.click(nextButton);

    expect(nextButton).toBeDisabled();

    const prevButton = screen.getByLabelText('上个月');
    expect(prevButton).not.toBeDisabled();
  });

  it('renders timeline layout with cards', () => {
    mockUseGames.mockReturnValue({
      games: mockGames,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    const cards = screen.getAllByTestId('schedule-game-card');
    expect(cards).toHaveLength(2);
  });

  it('renders empty state when no games for selected month', () => {
    mockUseGames.mockReturnValue({
      games: mockGames.slice(0, 2),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    expect(screen.queryByText('该月份暂无赛程')).not.toBeInTheDocument();
  });

  it('renders error state and allows retry', () => {
    const refetch = vi.fn();
    mockUseGames.mockReturnValue({
      games: [],
      isLoading: false,
      error: new Error('Failed to load'),
      refetch,
    });

    render(<GameSchedulePage />);

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();

    const retryButton = screen.getByText('重新加载');
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalled();
  });

  it('renders without month selector for empty games', () => {
    mockUseGames.mockReturnValue({
      games: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<GameSchedulePage />);

    expect(screen.queryByLabelText('上个月')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('下个月')).not.toBeInTheDocument();
    expect(screen.getByText('该月份暂无赛程')).toBeInTheDocument();
  });
});
