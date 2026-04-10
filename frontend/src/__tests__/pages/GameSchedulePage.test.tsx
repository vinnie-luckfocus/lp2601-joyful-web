import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameSchedulePage from '../../pages/GameSchedulePage';

const mockUseGames = vi.fn();
const mockUseAttendance = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock('../../hooks/useGames', () => ({
  useGames: (...args: unknown[]) => mockUseGames(...args),
}));

vi.mock('../../hooks/useAttendance', () => ({
  useAttendance: (...args: unknown[]) => mockUseAttendance(...args),
}));

vi.mock('../../stores/auth', () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <GameSchedulePage />
    </MemoryRouter>
  );

describe('GameSchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGames.mockReset();
    mockUseAttendance.mockReset();
    mockUseAuthStore.mockReset();

    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    mockUseAttendance.mockReturnValue({
      attendance: null,
      isLoading: false,
      error: null,
      updateAttendance: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('renders loading state with skeletons', () => {
    mockUseGames.mockReturnValue({
      games: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders error state and calls refetch on retry', () => {
    const refetchMock = vi.fn();
    mockUseGames.mockReturnValue({
      games: [],
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('加载失败')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /重新加载/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no games are available', () => {
    mockUseGames.mockReturnValue({
      games: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('该月份暂无赛程')).toBeInTheDocument();
  });

  it('renders games timeline and allows month navigation', () => {
    const games = [
      {
        id: 1,
        scheduled_at: '2024-04-15T10:00:00Z',
        location: 'Stadium A',
        home_team_name: 'Team A',
        away_team_name: 'Team B',
        home_score: null,
        away_score: null,
        status: 'scheduled',
        home_team_id: 1,
        away_team_id: 2,
      },
      {
        id: 2,
        scheduled_at: '2024-05-20T14:00:00Z',
        location: 'Stadium B',
        home_team_name: 'Team C',
        away_team_name: 'Team D',
        home_score: 3,
        away_score: 2,
        status: 'completed',
        home_team_id: 3,
        away_team_id: 4,
      },
    ];

    mockUseGames.mockReturnValue({
      games,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('4月')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.queryByText('Team C')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '下个月' }));
    expect(screen.getByText('5月')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
    expect(screen.getByText('Team D')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '上个月' }));
    expect(screen.getByText('4月')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
  });

  it('disables prev button on first month and next button on last month', () => {
    const games = [
      {
        id: 1,
        scheduled_at: '2024-04-15T10:00:00Z',
        location: 'Stadium A',
        home_team_name: 'Team A',
        away_team_name: 'Team B',
        home_score: null,
        away_score: null,
        status: 'scheduled',
        home_team_id: 1,
        away_team_id: 2,
      },
      {
        id: 2,
        scheduled_at: '2024-05-20T14:00:00Z',
        location: 'Stadium B',
        home_team_name: 'Team C',
        away_team_name: 'Team D',
        home_score: null,
        away_score: null,
        status: 'scheduled',
        home_team_id: 3,
        away_team_id: 4,
      },
    ];

    mockUseGames.mockReturnValue({
      games,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    const prevButton = screen.getByRole('button', { name: '上个月' });
    const nextButton = screen.getByRole('button', { name: '下个月' });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('shows authenticated attendance info on game cards', () => {
    const games = [
      {
        id: 1,
        scheduled_at: '2024-04-15T10:00:00Z',
        location: 'Stadium A',
        home_team_name: 'Team A',
        away_team_name: 'Team B',
        home_score: null,
        away_score: null,
        status: 'scheduled',
        home_team_id: 1,
        away_team_id: 2,
      },
    ];

    mockUseGames.mockReturnValue({
      games,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseAuthStore.mockReturnValue({
      user: { id: 1, name: 'Alice' },
      isAuthenticated: true,
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    mockUseAttendance.mockReturnValue({
      attendance: { gameId: 1, status: 'confirmed', confirmedCount: 5 },
      isLoading: false,
      error: null,
      updateAttendance: vi.fn(),
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByTestId('signup-status-badge')).toBeInTheDocument();
    expect(screen.getByTestId('attendee-count')).toHaveTextContent('5人已报名');
  });

  it('links each game card to its detail page', () => {
    const games = [
      {
        id: 1,
        scheduled_at: '2024-04-15T10:00:00Z',
        location: 'Stadium A',
        home_team_name: 'Team A',
        away_team_name: 'Team B',
        home_score: null,
        away_score: null,
        status: 'scheduled',
        home_team_id: 1,
        away_team_id: 2,
      },
    ];

    mockUseGames.mockReturnValue({
      games,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    const card = screen.getByTestId('schedule-game-card');
    expect(card).toHaveAttribute('href', '/games/1');
  });
});
