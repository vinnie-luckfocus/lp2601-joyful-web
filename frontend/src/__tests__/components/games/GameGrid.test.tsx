import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameGrid } from '../../../components/games/GameGrid';
import * as usePublicGamesModule from '../../../hooks/usePublicGames';
import type { Game, UsePublicGamesReturn } from '../../../hooks/usePublicGames';


// Mock the hook
vi.mock('../../../hooks/usePublicGames', () => ({
  usePublicGames: vi.fn(),
}));

describe('GameGrid', () => {
  const mockGames: Game[] = [
    {
      id: 1,
      scheduled_at: '2024-01-15T14:00:00Z',
      location: 'Yankee Stadium',
      home_team_id: 1,
      away_team_id: 2,
      home_team_name: 'New York Yankees',
      away_team_name: 'Boston Red Sox',
      home_score: null,
      away_score: null,
      status: 'scheduled',
    },
    {
      id: 2,
      scheduled_at: '2024-01-16T19:00:00Z',
      location: 'Fenway Park',
      home_team_id: 2,
      away_team_id: 1,
      home_team_name: 'Boston Red Sox',
      away_team_name: 'New York Yankees',
      home_score: 5,
      away_score: 3,
      status: 'completed',
    },
    {
      id: 3,
      scheduled_at: '2024-01-17T20:00:00Z',
      location: 'Wrigley Field',
      home_team_id: 3,
      away_team_id: 4,
      home_team_name: 'Chicago Cubs',
      away_team_name: 'St. Louis Cardinals',
      home_score: null,
      away_score: null,
      status: 'scheduled',
    },
  ];

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUsePublicGames = (overrides: Partial<UsePublicGamesReturn> = {}) => {
    const defaultReturn: UsePublicGamesReturn = {
      games: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      lastUpdated: null,
    };
    vi.mocked(usePublicGamesModule.usePublicGames).mockReturnValue({
      ...defaultReturn,
      ...overrides,
    });
  };

  describe('Loading State', () => {
    it('should render skeleton cards when loading', () => {
      mockUsePublicGames({ isLoading: true });

      render(<GameGrid />);

      expect(screen.getByText('近期赛程')).toBeInTheDocument();
      expect(document.querySelectorAll('[data-testid="skeleton-card"]').length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should render error state when there is an error', () => {
      mockUsePublicGames({
        error: new Error('无法加载比赛数据，请稍后重试'),
        isLoading: false,
      });

      render(<GameGrid />);

      expect(screen.getByText('加载赛程失败')).toBeInTheDocument();
      expect(screen.getByText('无法加载比赛数据，请稍后重试')).toBeInTheDocument();
      expect(screen.getByText('重新加载')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', () => {
      mockUsePublicGames({
        error: new Error('Failed to fetch'),
        isLoading: false,
      });

      render(<GameGrid />);

      const retryButton = screen.getByText('重新加载');
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should display custom error message', () => {
      mockUsePublicGames({
        error: new Error('Network timeout'),
        isLoading: false,
      });

      render(<GameGrid />);

      expect(screen.getByText('Network timeout')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no games', () => {
      mockUsePublicGames({
        games: [],
        isLoading: false,
      });

      render(<GameGrid />);

      expect(screen.getByText('暂无赛程')).toBeInTheDocument();
      expect(screen.getByText('近期没有安排的比赛')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render game cards when data is loaded', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
        lastUpdated: new Date(),
      });

      render(<GameGrid />);

      expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      expect(screen.getAllByTestId('game-card').length).toBe(3);
    });

    it('should render data freshness indicator', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
        lastUpdated: new Date(),
      });

      render(<GameGrid />);

      expect(screen.getByTestId('data-freshness-indicator')).toBeInTheDocument();
    });

    it('should not render data freshness indicator when lastUpdated is null', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
        lastUpdated: null,
      });

      render(<GameGrid />);

      expect(screen.queryByTestId('data-freshness-indicator')).not.toBeInTheDocument();
    });

    it('should render view more link by default', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
      });

      render(<GameGrid />);

      expect(screen.getByTestId('view-more-link')).toHaveTextContent('查看更多');
    });

    it('should hide view more link when showViewMore is false', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
      });

      render(<GameGrid showViewMore={false} />);

      expect(screen.queryByTestId('view-more-link')).not.toBeInTheDocument();
    });

    it('should show coming soon tooltip on hover for unimplemented routes', async () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
      });

      render(<GameGrid viewMoreHref="/unimplemented-route" />);

      const viewMoreLink = screen.getByTestId('view-more-link');

      fireEvent.mouseEnter(viewMoreLink);

      await waitFor(() => {
        expect(screen.getByTestId('coming-soon-tooltip')).toBeInTheDocument();
        expect(screen.getByText('即将上线')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(viewMoreLink);

      await waitFor(() => {
        expect(screen.queryByTestId('coming-soon-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should not show tooltip for implemented routes', async () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
      });

      render(<GameGrid viewMoreHref="/admin/games" />);

      const viewMoreLink = screen.getByTestId('view-more-link');

      fireEvent.mouseEnter(viewMoreLink);

      // Tooltip should not appear for implemented routes
      await waitFor(() => {
        expect(screen.queryByTestId('coming-soon-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should prevent default for unimplemented routes', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
      });

      render(<GameGrid viewMoreHref="/unimplemented-route" />);

      const viewMoreLink = screen.getByTestId('view-more-link');
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      viewMoreLink.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Props', () => {
    it('should pass limit to usePublicGames hook', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
      });

      render(<GameGrid limit={2} />);

      expect(usePublicGamesModule.usePublicGames).toHaveBeenCalledWith(2);
    });

    it('should use default limit of 4', () => {
      mockUsePublicGames({
        games: mockGames,
        isLoading: false,
      });

      render(<GameGrid />);

      expect(usePublicGamesModule.usePublicGames).toHaveBeenCalledWith(4);
    });
  });
});
