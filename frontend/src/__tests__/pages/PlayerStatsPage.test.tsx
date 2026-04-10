import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlayerStatsPage from '../../pages/PlayerStatsPage';

// Mock useStats hook
vi.mock('../../hooks/useStats', () => ({
  useStats: vi.fn(),
}));

// Mock useAuthStore
vi.mock('../../stores/auth', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the chart components entirely to avoid SVG issues in jsdom
vi.mock('../../components/stats/TrendChart', () => ({
  TrendChart: () => <div data-testid="trend-chart">近5场打击率趋势</div>,
}));

vi.mock('../../components/stats/RadarAbilityChart', () => ({
  RadarAbilityChart: () => <div data-testid="radar-chart">五维能力图</div>,
}));

// Mock Leaderboard
vi.mock('../../components/leaders', () => ({
  Leaderboard: () => <div data-testid="leaderboard">数据排行榜</div>,
}));

import { useStats } from '../../hooks/useStats';
import { useAuthStore } from '../../stores/auth';

const mockedUseStats = vi.mocked(useStats);
const mockedUseAuthStore = vi.mocked(useAuthStore);

const mockStats = {
  user: {
    name: '张三',
    team: '举父队',
    jersey_number: 23,
    position: '外野手',
  },
  cumulative: {
    games: 10,
    at_bats: 35,
    hits: 12,
    batting_avg: 0.343,
    singles: 8,
    doubles: 3,
    triples: 0,
    hr: 1,
    rbi: 7,
    runs: 5,
    walks: 4,
    strikeouts: 6,
  },
  recent_5_games: [
    { game_id: 1, batting_avg: 0.333 },
    { game_id: 2, batting_avg: 0.400 },
    { game_id: 3, batting_avg: 0.250 },
    { game_id: 4, batting_avg: 0.500 },
    { game_id: 5, batting_avg: 0.200 },
  ],
  milestones: {
    hits_to_100: 88,
  },
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PlayerStatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuthStore.mockReturnValue({
      user: { id: 1, name: '张三' },
      isAuthenticated: true,
      logout: vi.fn(),
    } as ReturnType<typeof useAuthStore>);
  });

  it('renders loading state with skeleton cards', () => {
    mockedUseStats.mockReturnValue({
      stats: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  });

  it('renders error state and allows retry', () => {
    const refetch = vi.fn();
    mockedUseStats.mockReturnValue({
      stats: null,
      isLoading: false,
      error: new Error('Network error'),
      refetch,
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: '重新加载' });
    retryButton.click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders fallback error message when error has no message', () => {
    mockedUseStats.mockReturnValue({
      stats: null,
      isLoading: false,
      error: new Error(''),
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByText('无法获取统计数据')).toBeInTheDocument();
  });

  it('renders stats correctly when data is available', () => {
    mockedUseStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    // Profile header - use the heading role to disambiguate from navbar
    expect(screen.getByRole('heading', { name: '张三' })).toBeInTheDocument();
    // The team info appears inside a <p> in the profile header
    expect(screen.getByText('举父队 · #23 · 外野手')).toBeInTheDocument();

    // Cumulative stats
    expect(screen.getByText('10')).toBeInTheDocument(); // games
    expect(screen.getByText('35')).toBeInTheDocument(); // at_bats
    expect(screen.getByText('12')).toBeInTheDocument(); // hits
    expect(screen.getByText('0.343')).toBeInTheDocument(); // batting_avg
    expect(screen.getByText('8')).toBeInTheDocument(); // singles
    expect(screen.getByText('3')).toBeInTheDocument(); // doubles
    expect(screen.getByText('1')).toBeInTheDocument(); // hr
    expect(screen.getByText('7')).toBeInTheDocument(); // rbi
  });

  it('renders free agent fallback when team/jersey/position are missing', () => {
    mockedUseStats.mockReturnValue({
      stats: {
        ...mockStats,
        user: {
          name: '李四',
          team: null,
          jersey_number: null,
          position: null,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByText(/自由球员/)).toBeInTheDocument();
    expect(screen.getByText(/#/)).toBeInTheDocument();
    expect(screen.getByText(/-/)).toBeInTheDocument();
  });

  it('renders milestones including hits_to_100 and default 50 milestone', () => {
    mockedUseStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByText('100安打里程碑')).toBeInTheDocument();
    expect(screen.getByText('50安打里程碑')).toBeInTheDocument();
  });

  it('does not render 100-hit milestone when hits_to_100 is null', () => {
    mockedUseStats.mockReturnValue({
      stats: {
        ...mockStats,
        milestones: { hits_to_100: null },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.queryByText('100安打里程碑')).not.toBeInTheDocument();
    expect(screen.getByText('50安打里程碑')).toBeInTheDocument();
  });

  it('renders leaderboard component', () => {
    mockedUseStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
  });

  it('renders trend chart and radar chart', () => {
    mockedUseStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('passes auth state to navbar (logged in)', () => {
    const logout = vi.fn();
    mockedUseAuthStore.mockReturnValue({
      user: { id: 1, name: '张三' },
      isAuthenticated: true,
      logout,
    } as ReturnType<typeof useAuthStore>);

    mockedUseStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    // Navbar shows user name in the top-right user section
    const nav = screen.getByRole('navigation', { name: '主导航' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '退出' })).toBeInTheDocument();
  });

  it('passes auth state to navbar (not logged in)', () => {
    mockedUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    } as ReturnType<typeof useAuthStore>);

    mockedUseStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('renders error state when stats is null without error', () => {
    mockedUseStats.mockReturnValue({
      stats: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<PlayerStatsPage />);

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('无法获取统计数据')).toBeInTheDocument();
  });
});
