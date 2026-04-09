import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameDetailPage } from '../GameDetailPage';
import * as useAttendanceModule from '../../hooks/useAttendance';
import * as authStoreModule from '../../stores/auth';
import api from '../../utils/axios';

// Mock hooks
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

vi.mock('../../utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockUseAttendance = vi.mocked(useAttendanceModule.useAttendance);
const mockUseAuthStore = vi.mocked(authStoreModule.useAuthStore);
const mockApiGet = vi.mocked(api.get);

const renderWithRouter = (initialRoute = '/games/1') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/games/:id" element={<GameDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('GameDetailPage', () => {
  const mockGame = {
    id: 1,
    scheduled_at: '2024-05-10T14:00:00Z',
    location: '芬威球场',
    home_team_id: 1,
    away_team_id: 2,
    home_team_name: '红袜队',
    away_team_name: '洋基队',
    home_score: 5,
    away_score: 3,
    status: 'completed',
    my_status: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      user: { id: 1, name: '张三', username: 'zhangsan', role: 'player', team_id: 1, is_first_login: false },
      isAuthenticated: true,
      logout: vi.fn(),
      login: vi.fn(),
      checkAuth: vi.fn(),
      changePassword: vi.fn(),
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof authStoreModule.useAuthStore>);

    mockUseAttendance.mockReturnValue({
      attendance: {
        gameId: 1,
        status: null,
        confirmedCount: 2,
        confirmed: [
          { id: '1', name: '张三', username: 'zhangsan' },
          { id: '2', name: '李四', username: 'lisi' },
        ],
        pending: [{ id: '3', name: '王五', username: 'wangwu' }],
        declined: [{ id: '4', name: '赵六', username: 'zhaoliu' }],
      },
      isLoading: false,
      error: null,
      updateAttendance: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('renders all sections when game loads', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: { success: true, data: mockGame },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('红袜队')).toBeInTheDocument();
    });

    expect(screen.getByText('洋基队')).toBeInTheDocument();
    expect(screen.getByText('芬威球场')).toBeInTheDocument();
    expect(screen.getByText('已结束')).toBeInTheDocument();
    expect(screen.getByText('已确认')).toBeInTheDocument();
    expect(screen.getByText('未回复')).toBeInTheDocument();
    expect(screen.getAllByText('不参加').length).toBeGreaterThanOrEqual(1);
  });

  it('renders game status badge with correct style', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: { success: true, data: { ...mockGame, status: 'live' } },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('game-status-badge')).toBeInTheDocument();
    });

    const badge = screen.getByTestId('game-status-badge');
    expect(badge).toHaveTextContent('进行中');
    expect(badge).toHaveStyle({ backgroundColor: '#2D8659' });
  });

  it('renders scores when available', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: { success: true, data: mockGame },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows success animation on confirm', async () => {
    const updateAttendance = vi.fn().mockResolvedValue(undefined);
    mockUseAttendance.mockReturnValue({
      attendance: {
        gameId: 1,
        status: null,
        confirmedCount: 2,
        confirmed: [{ id: '2', name: '李四', username: 'lisi' }],
        pending: [{ id: '1', name: '张三', username: 'zhangsan' }],
        declined: [],
      },
      isLoading: false,
      error: null,
      updateAttendance,
      refetch: vi.fn(),
    });

    mockApiGet.mockResolvedValueOnce({
      data: { success: true, data: mockGame },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));

    await waitFor(() => {
      expect(updateAttendance).toHaveBeenCalledWith('confirmed');
    });
  });

  it('shows error alert when updateAttendance fails', async () => {
    const updateAttendance = vi.fn().mockRejectedValue(new Error('Network error'));
    mockUseAttendance.mockReturnValue({
      attendance: {
        gameId: 1,
        status: null,
        confirmedCount: 2,
        confirmed: [{ id: '2', name: '李四', username: 'lisi' }],
        pending: [{ id: '1', name: '张三', username: 'zhangsan' }],
        declined: [],
      },
      isLoading: false,
      error: null,
      updateAttendance,
      refetch: vi.fn(),
    });

    mockApiGet.mockResolvedValueOnce({
      data: { success: true, data: mockGame },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('renders invalid ID message for non-numeric game ID', () => {
    renderWithRouter('/games/invalid');

    expect(screen.getByText('比赛未找到')).toBeInTheDocument();
    expect(screen.getByText('链接中的比赛 ID 无效，请检查网址是否正确。')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    mockApiGet.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: { success: true, data: mockGame } }), 100);
        })
    );

    renderWithRouter();

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders error state on fetch failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Fetch failed'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });

    expect(screen.getByText('Fetch failed')).toBeInTheDocument();
  });

  it('renders game not found when game is null after loading', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: { success: true, data: null },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  it('renders attendance buttons with correct status', async () => {
    mockUseAttendance.mockReturnValue({
      attendance: {
        gameId: 1,
        status: 'confirmed',
        confirmedCount: 2,
        confirmed: [
          { id: '1', name: '张三', username: 'zhangsan' },
          { id: '2', name: '李四', username: 'lisi' },
        ],
        pending: [],
        declined: [],
      },
      isLoading: false,
      error: null,
      updateAttendance: vi.fn(),
      refetch: vi.fn(),
    });

    mockApiGet.mockResolvedValueOnce({
      data: { success: true, data: mockGame },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    const confirmButton = screen.getByTestId('confirm-button');
    expect(confirmButton).toHaveClass('ring-2');
    expect(confirmButton).toHaveClass('ring-[#BF0D3E]');
  });
});
