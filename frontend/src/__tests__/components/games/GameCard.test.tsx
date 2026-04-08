import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameCard, formatGameDate, getGameStatusText, getGameStatusColor } from '../../../components/games/GameCard';
import type { Game } from '../../../hooks/usePublicGames';


describe('GameCard', () => {
  const mockGame: Game = {
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
  };

  const mockCompletedGame: Game = {
    ...mockGame,
    id: 2,
    status: 'completed',
    home_score: 5,
    away_score: 3,
  };

  const mockLiveGame: Game = {
    ...mockGame,
    id: 3,
    status: 'live',
    home_score: 2,
    away_score: 1,
  };

  describe('formatGameDate', () => {
    it('should format date correctly for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      futureDate.setHours(14, 30, 0, 0);

      const result = formatGameDate(futureDate.toISOString());
      expect(result).toContain('14:30');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatGameDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('getGameStatusText', () => {
    it('should return correct status text for all statuses', () => {
      expect(getGameStatusText('scheduled')).toBe('未开始');
      expect(getGameStatusText('live')).toBe('进行中');
      expect(getGameStatusText('completed')).toBe('已结束');
      expect(getGameStatusText('postponed')).toBe('延期');
      expect(getGameStatusText('cancelled')).toBe('取消');
      expect(getGameStatusText('unknown')).toBe('unknown');
    });
  });

  describe('getGameStatusColor', () => {
    it('should return correct color classes for all statuses', () => {
      expect(getGameStatusColor('scheduled')).toBe('bg-gray-100 text-gray-600');
      expect(getGameStatusColor('live')).toBe('bg-green-100 text-green-700');
      expect(getGameStatusColor('completed')).toBe('bg-blue-100 text-blue-700');
      expect(getGameStatusColor('postponed')).toBe('bg-yellow-100 text-yellow-700');
      expect(getGameStatusColor('cancelled')).toBe('bg-red-100 text-red-700');
      expect(getGameStatusColor('unknown')).toBe('bg-gray-100 text-gray-600');
    });
  });

  describe('Component Rendering', () => {
    it('should render game card with correct structure', () => {
      render(<GameCard game={mockGame} />);

      expect(screen.getByTestId('game-card')).toBeInTheDocument();
      expect(screen.getByText('New York Yankees')).toBeInTheDocument();
      expect(screen.getByText('Boston Red Sox')).toBeInTheDocument();
      expect(screen.getByText('Yankee Stadium')).toBeInTheDocument();
    });

    it('should render scheduled status correctly', () => {
      render(<GameCard game={mockGame} />);

      const statusElement = screen.getByTestId('game-status');
      expect(statusElement).toHaveTextContent('未开始');
      expect(statusElement).toHaveClass('bg-gray-100', 'text-gray-600');
    });

    it('should render live status correctly', () => {
      render(<GameCard game={mockLiveGame} />);

      const statusElement = screen.getByTestId('game-status');
      expect(statusElement).toHaveTextContent('进行中');
      expect(statusElement).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('should render completed status with scores', () => {
      render(<GameCard game={mockCompletedGame} />);

      const statusElement = screen.getByTestId('game-status');
      expect(statusElement).toHaveTextContent('已结束');

      expect(screen.getByTestId('home-score')).toHaveTextContent('5');
      expect(screen.getByTestId('away-score')).toHaveTextContent('3');
    });

    it('should not render scores when game is scheduled', () => {
      render(<GameCard game={mockGame} />);

      expect(screen.queryByTestId('home-score')).not.toBeInTheDocument();
      expect(screen.queryByTestId('away-score')).not.toBeInTheDocument();
    });

    it('should render VS divider', () => {
      render(<GameCard game={mockGame} />);

      expect(screen.getByText('VS')).toBeInTheDocument();
    });

    it('should render with index for animation', () => {
      const { container } = render(<GameCard game={mockGame} index={2} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle game with zero scores', () => {
      const gameWithZeroScores: Game = {
        ...mockGame,
        status: 'completed',
        home_score: 0,
        away_score: 0,
      };

      render(<GameCard game={gameWithZeroScores} />);

      expect(screen.getByTestId('home-score')).toHaveTextContent('0');
      expect(screen.getByTestId('away-score')).toHaveTextContent('0');
    });

    it('should handle game with null scores but completed status', () => {
      const gameWithNullScores: Game = {
        ...mockGame,
        status: 'completed',
        home_score: null,
        away_score: null,
      };

      render(<GameCard game={gameWithNullScores} />);

      expect(screen.queryByTestId('home-score')).not.toBeInTheDocument();
      expect(screen.queryByTestId('away-score')).not.toBeInTheDocument();
    });
  });
});
