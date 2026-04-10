import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameDetailPage from '../../pages/GameDetailPage';

const mockUseParams = vi.fn();
const mockUseAttendance = vi.fn();
const mockUseAuthStore = vi.fn();
const mockApiGet = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: (...args: unknown[]) => mockUseParams(...args),
  };
});

vi.mock('../../hooks/useAttendance', () => ({
  useAttendance: (...args: unknown[]) => mockUseAttendance(...args),
}));

vi.mock('../../stores/auth', () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
}));

vi.mock('../../utils/axios', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../../components/games/BattingRecordEntry', () => ({
  BattingRecordEntry: ({ gameId }: { gameId: number }) => (
    <div data-testid="batting-record-entry">BattingRecordEntry {gameId}</div>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <GameDetailPage />
    </MemoryRouter>
  );

const baseGame = {
  id: 1,
  scheduled_at: '2024-04-15T10:00:00Z',
  location: 'Stadium A',
  home_team_name: 'Team A',
  away_team_name: 'Team B',
  home_score: 5,
  away_score: 3,
  status: 'completed',
  home_team_id: 1,
  away_team_id: 2,
};

describe('GameDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReset();
    mockUseAttendance.mockReset();
    mockUseAuthStore.mockReset();
    mockApiGet.mockReset();

    mockUseParams.mockReturnValue({ id: '1' });
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });
    mockUseAttendance.mockReturnValue({
      attendance: null,
      isLoading: false,
      error: null,
      updateAttendance: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('shows invalid ID message when gameId is NaN', () => {
    mockUseParams.mockReturnValue({ id: 'invalid' });
    renderPage();

    expect(screen.getByText('比赛未找到')).toBeInTheDocument();
    expect(screen.getByText('链接中的比赛 ID 无效，请检查网址是否正确。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回赛程' })).toHaveAttribute('href', '/schedule');
  });

  it('renders loading state with skeletons', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {}));
    renderPage();

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders game details after successful fetch', async () => {
    mockApiGet.mockResolvedValue({
      data: { success: true, data: baseGame },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument();
    });

    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Stadium A')).toBeInTheDocument();
    expect(screen.getByTestId('game-status-badge')).toHaveTextContent('已结束');
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    mockApiGet.mockRejectedValue(new Error('Network error'));
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('calls window.location.reload when retry clicked on error', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, reload: reloadMock },
    });

    mockApiGet.mockRejectedValue(new Error('Network error'));
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '刷新页面' }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('renders error when API returns success false', async () => {
    mockApiGet.mockResolvedValue({
      data: { success: false },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('handles attendance confirm', async () => {
    const updateAttendanceMock = vi.fn().mockResolvedValue(undefined);
    mockUseAttendance.mockReturnValue({
      attendance: { status: null, confirmedCount: 0 },
      isLoading: false,
      error: null,
      updateAttendance: updateAttendanceMock,
      refetch: vi.fn(),
    });

    mockApiGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          ...baseGame,
          home_score: null,
          away_score: null,
          status: 'scheduled',
        },
      },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));
    expect(updateAttendanceMock).toHaveBeenCalledTimes(1);
    expect(updateAttendanceMock).toHaveBeenCalledWith('confirmed');
  });

  it('handles attendance decline', async () => {
    const updateAttendanceMock = vi.fn().mockResolvedValue(undefined);
    mockUseAttendance.mockReturnValue({
      attendance: { status: null, confirmedCount: 0 },
      isLoading: false,
      error: null,
      updateAttendance: updateAttendanceMock,
      refetch: vi.fn(),
    });

    mockApiGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          ...baseGame,
          home_score: null,
          away_score: null,
          status: 'scheduled',
        },
      },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('decline-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('decline-button'));
    expect(updateAttendanceMock).toHaveBeenCalledTimes(1);
    expect(updateAttendanceMock).toHaveBeenCalledWith('declined');
  });

  it('shows success animation on confirm', async () => {
    const updateAttendanceMock = vi.fn().mockResolvedValue(undefined);
    mockUseAttendance.mockReturnValue({
      attendance: { status: null, confirmedCount: 0 },
      isLoading: false,
      error: null,
      updateAttendance: updateAttendanceMock,
      refetch: vi.fn(),
    });

    mockApiGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          ...baseGame,
          home_score: null,
          away_score: null,
          status: 'scheduled',
        },
      },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));
    await waitFor(() => {
      expect(screen.getByText('报名成功')).toBeInTheDocument();
    });
  });

  it('shows alert when attendance update fails', async () => {
    const updateAttendanceMock = vi.fn().mockRejectedValue(new Error('Update failed'));
    mockUseAttendance.mockReturnValue({
      attendance: { status: null, confirmedCount: 0 },
      isLoading: false,
      error: null,
      updateAttendance: updateAttendanceMock,
      refetch: vi.fn(),
    });

    mockApiGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          ...baseGame,
          home_score: null,
          away_score: null,
          status: 'scheduled',
        },
      },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('renders batting record entry for admin', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, name: 'Admin', role: 'admin' },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    mockApiGet.mockResolvedValue({
      data: { success: true, data: baseGame },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('batting-record-entry')).toBeInTheDocument();
    });
  });

  it('does not render batting record entry for non-admin', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, name: 'User', role: 'player' },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    mockApiGet.mockResolvedValue({
      data: { success: true, data: baseGame },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('batting-record-entry')).not.toBeInTheDocument();
  });

  it('renders error state when API returns null data', async () => {
    mockApiGet.mockResolvedValue({
      data: { success: true, data: null },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('renders attendance error state', async () => {
    mockApiGet.mockResolvedValue({
      data: { success: true, data: baseGame },
    });
    mockUseAttendance.mockReturnValue({
      attendance: null,
      isLoading: false,
      error: new Error('Attendance fetch failed'),
      updateAttendance: vi.fn(),
      refetch: vi.fn(),
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
    expect(screen.getByText('Attendance fetch failed')).toBeInTheDocument();
  });
});
