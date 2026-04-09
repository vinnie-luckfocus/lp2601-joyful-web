import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TeamPage from '../TeamPage';
import * as useTeamModule from '../../hooks/useTeam';
import type { Team } from '../../hooks/useTeam';

vi.mock('../../hooks/useTeam', async () => {
  const actual = await vi.importActual<typeof useTeamModule>('../../hooks/useTeam');
  return {
    ...actual,
    useTeam: vi.fn(),
  };
});

vi.mock('../../components/teams/MemberGrid', () => ({
  MemberGrid: ({ teamId, captainId }: { teamId: number; captainId: number | null }) => (
    <div data-testid="member-grid-mock">
      MemberGrid: {teamId} - Captain: {captainId ?? 'none'}
    </div>
  ),
}));

const mockUseTeam = vi.mocked(useTeamModule.useTeam);

const mockTeam: Team = {
  id: 1,
  name: 'Joyful A队',
  logo_url: 'https://example.com/logo.png',
  description: '这是 Joyful A队 的球队简介，成立于 2024 年，是大联盟中的强队。',
  division: '大联盟',
  captain_id: 10,
  captain_name: '张伟',
  captain_avatar_url: null,
  record: { wins: 5, losses: 2, win_rate: 71.43 },
};

function renderWithRouter(initialRoute = '/teams/1') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/teams/:id" element={<TeamPage />} />
        <Route path="/404" element={<div data-testid="not-found">404</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockUseTeam.mockReturnValue({
      team: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter();
    expect(document.querySelector('[data-testid="skeleton-card"]')).toBeInTheDocument();
  });

  it('renders team hero and record', async () => {
    mockUseTeam.mockReturnValue({
      team: mockTeam,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Joyful A队')).toBeInTheDocument();
    });

    expect(screen.getAllByText('大联盟')[0]).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('胜')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('负')).toBeInTheDocument();
    expect(screen.getByText('(71.43%)')).toBeInTheDocument();
    expect(screen.getByTestId('member-grid-mock')).toHaveTextContent('MemberGrid: 1 - Captain: 10');
  });

  it('shows and hides description expand/collapse', async () => {
    mockUseTeam.mockReturnValue({
      team: mockTeam,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Joyful A队')).toBeInTheDocument();
    });

    const expandButton = screen.getByRole('button', { name: /展开/ });
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.getByRole('button', { name: /收起/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /收起/ }));
    expect(screen.getByRole('button', { name: /展开/ })).toBeInTheDocument();
  });

  it('renders error state with retry', async () => {
    const refetch = vi.fn();
    mockUseTeam.mockReturnValue({
      team: null,
      isLoading: false,
      error: new Error('Network error'),
      refetch,
    });

    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /重试/ });
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalled();
  });

  it('redirects to 404 for invalid team id', () => {
    mockUseTeam.mockReturnValue({
      team: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter('/teams/abc');
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });

  it('shows not found message when team is null after loading', async () => {
    mockUseTeam.mockReturnValue({
      team: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter('/teams/999');
    await waitFor(() => {
      expect(screen.getByText('未找到球队')).toBeInTheDocument();
    });
  });
});
