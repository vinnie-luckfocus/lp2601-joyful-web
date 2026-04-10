import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VideoPlaybackPage from '../../pages/VideoPlaybackPage';

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

describe('VideoPlaybackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithParams = (initialEntries: string[]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/videos/:id" element={<VideoPlaybackPage />} />
          <Route path="/404" element={<div data-testid="not-found">404</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('redirects to 404 for invalid id "abc"', () => {
    renderWithParams(['/videos/abc']);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('redirects to 404 for non-positive id "0"', () => {
    renderWithParams(['/videos/0']);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('redirects to 404 for negative id', () => {
    renderWithParams(['/videos/-5']);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('renders loading state for valid id', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));

    renderWithParams(['/videos/1']);

    expect(screen.getByRole('button', { name: '返回视频列表' })).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('renders error state and retries', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    renderWithParams(['/videos/1']);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    mockGet.mockResolvedValue({
      data: {
        data: {
          id: 1,
          title: 'Game One',
          description: null,
          video_url: 'http://example.com/1.mp4',
          thumbnail_url: null,
          duration_seconds: 60,
          status: 'ready',
          game_id: null,
          game_date: '2024-06-01',
          home_team: 'A',
          away_team: 'B',
          highlights: [],
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: '重试' }));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  it('renders not found state when video is null', async () => {
    mockGet.mockResolvedValue({ data: { data: null } });

    renderWithParams(['/videos/99']);

    await waitFor(() => {
      expect(screen.getByText('未找到视频')).toBeInTheDocument();
    });
    expect(screen.getByText('该视频不存在或已被删除')).toBeInTheDocument();
  });

  it('renders ready video player with metadata and back button navigates', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          id: 1,
          title: 'World Series Game 1',
          description: 'A great game.',
          video_url: 'http://example.com/ws1.mp4',
          thumbnail_url: 'http://example.com/ws1.jpg',
          duration_seconds: 725,
          status: 'ready',
          game_id: 10,
          game_date: '2024-10-01',
          home_team: 'Dodgers',
          away_team: 'Yankees',
          highlights: [
            { id: 101, title: 'Home Run', description: 'Amazing shot', start_time: 120, end_time: 130 },
            { id: 102, title: 'Double Play', description: null, start_time: 300, end_time: 310 },
          ],
        },
      },
    });

    renderWithParams(['/videos/1']);

    await waitFor(() => {
      expect(screen.getByText('World Series Game 1')).toBeInTheDocument();
    });

    const video = document.querySelector('video') as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video.src).toBe('http://example.com/ws1.mp4');
    expect(video.poster).toBe('http://example.com/ws1.jpg');
    expect(video).toHaveAttribute('controls');

    expect(screen.getByText('2024年10月1日')).toBeInTheDocument();
    expect(screen.getByText('Dodgers VS Yankees')).toBeInTheDocument();
    expect(screen.getByText('12:05')).toBeInTheDocument();
    expect(screen.getByText('A great game.')).toBeInTheDocument();

    expect(screen.getByText('Home Run').closest('button')).toBeInTheDocument();
    expect(screen.getByText('Double Play').closest('button')).toBeInTheDocument();
    expect(screen.getByText('Amazing shot')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '返回视频列表' }));
    expect(mockNavigate).toHaveBeenCalledWith('/videos');
  });

  it('renders processing state when video status is not ready', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          id: 2,
          title: 'Processing Video',
          description: null,
          video_url: '',
          thumbnail_url: null,
          duration_seconds: null,
          status: 'processing',
          game_id: null,
          game_date: null,
          home_team: null,
          away_team: null,
          highlights: [],
        },
      },
    });

    renderWithParams(['/videos/2']);

    await waitFor(() => {
      expect(screen.getByText('Processing Video')).toBeInTheDocument();
    });

    expect(screen.getByText('视频处理中')).toBeInTheDocument();
    expect(screen.getByText('请稍后再来观看')).toBeInTheDocument();
    expect(screen.queryByText('您的浏览器不支持视频播放。')).not.toBeInTheDocument();
  });

  it('seeks video to highlight time and plays on highlight click', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          id: 3,
          title: 'Highlights Game',
          description: null,
          video_url: 'http://example.com/hl.mp4',
          thumbnail_url: null,
          duration_seconds: 600,
          status: 'ready',
          game_id: null,
          game_date: null,
          home_team: null,
          away_team: null,
          highlights: [
            { id: 201, title: 'Triple', description: null, start_time: 45, end_time: 55 },
          ],
        },
      },
    });

    renderWithParams(['/videos/3']);

    await waitFor(() => {
      expect(screen.getByText('Triple').closest('button')).toBeInTheDocument();
    });

    const video = document.querySelector('video') as HTMLVideoElement;
    const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined);

    fireEvent.click(screen.getByText('Triple').closest('button')!);
    expect(video.currentTime).toBe(45);
    expect(playSpy).toHaveBeenCalled();
  });

  it('gracefully handles play rejection when seeking', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          id: 4,
          title: 'Another Game',
          description: null,
          video_url: 'http://example.com/4.mp4',
          thumbnail_url: null,
          duration_seconds: 300,
          status: 'ready',
          game_id: null,
          game_date: null,
          home_team: null,
          away_team: null,
          highlights: [
            { id: 301, title: 'Steal', description: 'Fast', start_time: 15, end_time: 20 },
          ],
        },
      },
    });

    renderWithParams(['/videos/4']);

    await waitFor(() => {
      expect(screen.getByText('Steal').closest('button')).toBeInTheDocument();
    });

    const video = document.querySelector('video') as HTMLVideoElement;
    vi.spyOn(video, 'play').mockRejectedValue(new Error('Autoplay blocked'));

    expect(() => fireEvent.click(screen.getByText('Steal').closest('button')!)).not.toThrow();
    expect(video.currentTime).toBe(15);
  });

  it('does not render highlights section when empty', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          id: 5,
          title: 'No Highlights',
          description: null,
          video_url: 'http://example.com/5.mp4',
          thumbnail_url: null,
          duration_seconds: 100,
          status: 'ready',
          game_id: null,
          game_date: null,
          home_team: null,
          away_team: null,
          highlights: [],
        },
      },
    });

    renderWithParams(['/videos/5']);

    await waitFor(() => {
      expect(screen.getByText('No Highlights')).toBeInTheDocument();
    });

    expect(screen.queryByText('精彩时刻')).not.toBeInTheDocument();
  });

  it('omits game info fields when they are null', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          id: 6,
          title: 'Sparse Info',
          description: null,
          video_url: 'http://example.com/6.mp4',
          thumbnail_url: null,
          duration_seconds: null,
          status: 'ready',
          game_id: null,
          game_date: null,
          home_team: null,
          away_team: null,
          highlights: [],
        },
      },
    });

    renderWithParams(['/videos/6']);

    await waitFor(() => {
      expect(screen.getByText('Sparse Info')).toBeInTheDocument();
    });

    expect(screen.queryByText('年')).not.toBeInTheDocument();
    expect(screen.queryByText('VS')).not.toBeInTheDocument();
  });
});
