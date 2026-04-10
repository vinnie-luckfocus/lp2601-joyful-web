import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VideosListPage from '../../pages/VideosListPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockGet = vi.fn();

vi.mock('../../utils/axios', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('VideosListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '比赛视频' })).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  });

  it('renders empty state when no videos are returned', async () => {
    mockGet.mockResolvedValue({ data: { data: [] } });

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('暂无比赛视频')).toBeInTheDocument();
    });
  });

  it('renders video list with hero and grid', async () => {
    const videos = [
      {
        id: 1,
        title: 'Game One',
        description: null,
        video_url: 'http://example.com/1.mp4',
        thumbnail_url: 'http://example.com/1.jpg',
        duration_seconds: 125,
        status: 'ready',
        game_date: '2024-06-01',
        home_team: 'Red Sox',
        away_team: 'Blue Jays',
        highlights_count: 0,
      },
      {
        id: 2,
        title: 'Game Two',
        description: null,
        video_url: 'http://example.com/2.mp4',
        thumbnail_url: null,
        duration_seconds: 90,
        status: 'ready',
        game_date: '2024-06-02',
        home_team: 'Yankees',
        away_team: 'Orioles',
        highlights_count: 2,
      },
    ];
    mockGet.mockResolvedValue({ data: { data: videos } });

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Game One')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('播放 Game One')).toBeInTheDocument();
    expect(screen.getByLabelText('播放 Game Two')).toBeInTheDocument();
    expect(screen.getByText(/Red Sox VS Blue Jays/)).toBeInTheDocument();
    expect(screen.getByText(/Yankees VS Orioles/)).toBeInTheDocument();
    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('1:30')).toBeInTheDocument();
    expect(screen.getByText('2 个精彩时刻')).toBeInTheDocument();
  });

  it('navigates to video detail on hero card click', async () => {
    const videos = [
      {
        id: 1,
        title: 'Game One',
        description: null,
        video_url: 'http://example.com/1.mp4',
        thumbnail_url: 'http://example.com/1.jpg',
        duration_seconds: 60,
        status: 'ready',
        game_date: '2024-06-01',
        home_team: 'A',
        away_team: 'B',
        highlights_count: 0,
      },
    ];
    mockGet.mockResolvedValue({ data: { data: videos } });

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('播放 Game One')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('播放 Game One'));
    expect(mockNavigate).toHaveBeenCalledWith('/videos/1');
  });

  it('navigates via Enter key on grid card', async () => {
    const videos = [
      {
        id: 1,
        title: 'Game One',
        description: null,
        video_url: 'http://example.com/1.mp4',
        thumbnail_url: null,
        duration_seconds: 60,
        status: 'ready',
        game_date: '2024-06-01',
        home_team: 'A',
        away_team: 'B',
        highlights_count: 0,
      },
      {
        id: 2,
        title: 'Game Two',
        description: null,
        video_url: 'http://example.com/2.mp4',
        thumbnail_url: null,
        duration_seconds: 60,
        status: 'ready',
        game_date: '2024-06-02',
        home_team: 'C',
        away_team: 'D',
        highlights_count: 0,
      },
    ];
    mockGet.mockResolvedValue({ data: { data: videos } });

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('播放 Game Two')).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByLabelText('播放 Game Two'), {
      key: 'Enter',
      code: 'Enter',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/videos/2');
  });

  it('renders error state and retries on button click', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    mockGet.mockResolvedValue({ data: { data: [] } });
    fireEvent.click(screen.getByRole('button', { name: '重试' }));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  it('does not show highlights badge when count is zero', async () => {
    const videos = [
      {
        id: 1,
        title: 'No Highlights',
        description: null,
        video_url: 'http://example.com/1.mp4',
        thumbnail_url: null,
        duration_seconds: null,
        status: 'ready',
        game_date: null,
        home_team: null,
        away_team: null,
        highlights_count: 0,
      },
    ];
    mockGet.mockResolvedValue({ data: { data: videos } });

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Highlights')).toBeInTheDocument();
    });

    expect(screen.queryByText(/精彩时刻/)).not.toBeInTheDocument();
  });

  it('shows default thumbnail placeholder when thumbnail_url is null', async () => {
    const videos = [
      {
        id: 1,
        title: 'Game One',
        description: null,
        video_url: 'http://example.com/1.mp4',
        thumbnail_url: null,
        duration_seconds: 60,
        status: 'ready',
        game_date: '2024-06-01',
        home_team: 'A',
        away_team: 'B',
        highlights_count: 0,
      },
    ];
    mockGet.mockResolvedValue({ data: { data: videos } });

    render(
      <MemoryRouter>
        <VideosListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Game One')).toBeInTheDocument();
    });

    const img = screen.getByAltText('Game One') as HTMLImageElement;
    expect(img.src).toContain('placehold.co');
  });
});
