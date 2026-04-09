import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScheduleGameCard } from '../ScheduleGameCard';
import type { Game } from '../../../hooks/usePublicGames';

// Mock child components
vi.mock('../GameCardMeta', () => ({
  GameCardMeta: () => <div data-testid="game-card-meta">Meta</div>,
}));

vi.mock('../GameCardTeams', () => ({
  GameCardTeams: () => <div data-testid="game-card-teams">Teams</div>,
}));

describe('ScheduleGameCard', () => {
  const mockGame: Game = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders game card with props', () => {
    render(
      <ScheduleGameCard
        game={mockGame}
        myStatus={null}
        confirmedCount={5}
        index={0}
      />
    );

    expect(screen.getByTestId('schedule-game-card')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-meta')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-teams')).toBeInTheDocument();
    expect(screen.getByTestId('attendee-count')).toHaveTextContent('5人已报名');
    expect(screen.getByText('芬威球场')).toBeInTheDocument();
  });

  it('shows confirmed highlight border with #BF0D3E when confirmed', () => {
    render(
      <ScheduleGameCard
        game={mockGame}
        myStatus="confirmed"
        confirmedCount={8}
        index={0}
      />
    );

    const card = screen.getByTestId('schedule-game-card');
    expect(card).toHaveStyle({ borderLeftColor: '#BF0D3E' });
    expect(card).toHaveStyle({ borderLeftWidth: '4px' });
  });

  it('does not show highlight border when not confirmed', () => {
    render(
      <ScheduleGameCard
        game={mockGame}
        myStatus={null}
        confirmedCount={3}
        index={0}
      />
    );

    const card = screen.getByTestId('schedule-game-card');
    expect(card).not.toHaveStyle({ borderLeftColor: '#BF0D3E' });
  });

  it('displays signup status badge when confirmed', () => {
    render(
      <ScheduleGameCard
        game={mockGame}
        myStatus="confirmed"
        confirmedCount={8}
        index={0}
      />
    );

    expect(screen.getByTestId('signup-status-badge')).toBeInTheDocument();
    expect(screen.getByTestId('signup-status-badge')).toHaveTextContent('已报名');
  });

  it('does not display signup status badge when not confirmed', () => {
    render(
      <ScheduleGameCard
        game={mockGame}
        myStatus="declined"
        confirmedCount={8}
        index={0}
      />
    );

    expect(screen.queryByTestId('signup-status-badge')).not.toBeInTheDocument();
  });

  it('renders attendee count correctly', () => {
    render(
      <ScheduleGameCard
        game={mockGame}
        myStatus={null}
        confirmedCount={12}
        index={0}
      />
    );

    expect(screen.getByTestId('attendee-count')).toHaveTextContent('12人已报名');
  });

  it('renders with index-based animation delay', () => {
    const { container } = render(
      <ScheduleGameCard
        game={mockGame}
        myStatus={null}
        confirmedCount={0}
        index={2}
      />
    );

    expect(container.querySelector('[data-testid="schedule-game-card"]')).toBeInTheDocument();
  });
});
