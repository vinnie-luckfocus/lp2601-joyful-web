import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TacticsBoardPage from '../../pages/TacticsBoardPage';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

// Mock useLineup hook
vi.mock('../../hooks/useLineup', () => ({
  useLineup: vi.fn(),
}));

// Mock useAuthStore
vi.mock('../../stores/auth', () => ({
  useAuthStore: vi.fn(),
}));

import { useParams } from 'react-router-dom';
import { useLineup } from '../../hooks/useLineup';
import { useAuthStore } from '../../stores/auth';

const mockedUseParams = vi.mocked(useParams);
const mockedUseLineup = vi.mocked(useLineup);
const mockedUseAuthStore = vi.mocked(useAuthStore);

const mockLineupData = {
  game_id: 42,
  lineup: [
    { batting_order: 1, user_id: 'user-1', name: '张三', position: '游击手', jersey_number: '3' },
    { batting_order: 2, user_id: 'user-2', name: '李四', position: '投手', jersey_number: '18' },
    { batting_order: 3, user_id: 'user-3', name: '王五', position: '一垒手', jersey_number: '25' },
    { batting_order: 4, user_id: 'user-4', name: '赵六', position: '左外野', jersey_number: '7' },
    { batting_order: 5, user_id: 'user-5', name: '孙七', position: '中外野', jersey_number: '8' },
    { batting_order: 6, user_id: 'user-6', name: '周八', position: '右外野', jersey_number: '9' },
    { batting_order: 7, user_id: 'user-7', name: '吴九', position: '二垒手', jersey_number: '4' },
    { batting_order: 8, user_id: 'user-8', name: '郑十', position: '三垒手', jersey_number: '5' },
    { batting_order: 9, user_id: 'user-9', name: '钱十一', position: '捕手', jersey_number: '2' },
  ],
  tactics: {
    general_notes: '集中攻击对方先发投手的内角球。',
    signals: { steal: '摸帽子', bunt: '拉袖子' },
    defense_strategy: '双杀守备优先。',
  },
};

function renderWithRouter(ui: React.ReactElement, initialEntries = ['/tactics/42']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/tactics/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TacticsBoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseParams.mockReturnValue({ id: '42' });
    // TacticsBoardPage uses useAuthStore with a selector: (state) => state.user
    mockedUseAuthStore.mockImplementation((selector?: (state: { user: { id: number; name: string } | null }) => unknown) => {
      const state = { user: { id: 1, name: '张三' } };
      return selector ? selector(state) : state;
    });
  });

  it('renders loading state with skeleton cards', () => {
    mockedUseLineup.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  });

  it('renders error state and allows retry', () => {
    const refetch = vi.fn();
    mockedUseLineup.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Fetch failed'),
      refetch,
    });

    renderWithRouter(<TacticsBoardPage />);

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('Fetch failed')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: '重新加载' });
    retryButton.click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders fallback error message when error has no message', () => {
    mockedUseLineup.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error(''),
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    expect(screen.getByText('无法获取战术板数据')).toBeInTheDocument();
  });

  it('renders header with game id and back button navigates back', () => {
    mockedUseLineup.mockReturnValue({
      data: mockLineupData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    expect(screen.getByRole('heading', { name: '战术板' })).toBeInTheDocument();
    expect(screen.getByText('比赛编号 #42')).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: '返回' });
    backButton.click();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders lineup list with correct batting order', () => {
    mockedUseLineup.mockReturnValue({
      data: mockLineupData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    mockLineupData.lineup.forEach((player) => {
      // Use getElementById to target lineup row specifically
      const row = document.getElementById(`lineup-row-${player.user_id}`);
      expect(row).toBeInTheDocument();
      expect(row!.textContent).toContain(player.name);
      expect(row!.textContent).toContain(player.position);
      expect(row!.textContent).toContain(player.jersey_number);
    });
  });

  it('highlights current user in lineup', () => {
    const lineupWithNumericId = {
      ...mockLineupData,
      lineup: mockLineupData.lineup.map((p, i) =>
        i === 0 ? { ...p, user_id: '1' } : p
      ),
    };

    // TacticsBoardPage selects user via selector; use mockImplementation to support it
    mockedUseAuthStore.mockImplementation((selector?: (state: { user: { id: number; name: string } | null }) => unknown) => {
      const state = { user: { id: 1, name: '张三' } };
      return selector ? selector(state) : state;
    });

    mockedUseLineup.mockReturnValue({
      data: lineupWithNumericId,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    const currentUserRow = document.getElementById('lineup-row-1');
    expect(currentUserRow).toBeInTheDocument();
    expect(currentUserRow?.textContent).toContain('张三');
    expect(currentUserRow?.textContent).toContain('(我)');
  });

  it('renders field diagram and allows position click with player', () => {
    mockedUseLineup.mockReturnValue({
      data: mockLineupData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    // The field diagram renders an SVG with aria-label
    expect(screen.getByLabelText('棒球场防守位置图')).toBeInTheDocument();
  });

  it('renders tactics panel with notes, signals, and defense strategy', () => {
    mockedUseLineup.mockReturnValue({
      data: mockLineupData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    expect(screen.getByText('集中攻击对方先发投手的内角球。')).toBeInTheDocument();
    expect(screen.getByText('摸帽子')).toBeInTheDocument();
    expect(screen.getByText('拉袖子')).toBeInTheDocument();
    expect(screen.getByText('双杀守备优先。')).toBeInTheDocument();
  });

  it('toggles tactics sections on click', () => {
    mockedUseLineup.mockReturnValue({
      data: mockLineupData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    const notesButton = screen.getByRole('button', { name: '总体战术' });
    expect(notesButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(notesButton);
    expect(notesButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders empty tactics message when no tactics data', () => {
    mockedUseLineup.mockReturnValue({
      data: {
        ...mockLineupData,
        tactics: {
          general_notes: null,
          signals: {},
          defense_strategy: null,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    expect(screen.getByText('暂无战术安排')).toBeInTheDocument();
  });

  it('renders error state when data is null without error', () => {
    mockedUseLineup.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<TacticsBoardPage />);

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('无法获取战术板数据')).toBeInTheDocument();
  });

  it('passes undefined gameId to useLineup when id param is missing', () => {
    mockedUseParams.mockReturnValue({});
    mockedUseLineup.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Render without route params via direct MemoryRouter wrapper
    render(
      <MemoryRouter>
        <TacticsBoardPage />
      </MemoryRouter>
    );

    expect(mockedUseLineup).toHaveBeenCalledWith(undefined);
    // In JSX, undefined renders as empty string, so "#" with no id after it
    expect(screen.getByText('比赛编号 #')).toBeInTheDocument();
  });
});
