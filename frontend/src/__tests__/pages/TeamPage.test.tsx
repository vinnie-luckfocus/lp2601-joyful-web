import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import TeamPage from '../../pages/TeamPage';
import * as useTeamModule from '../../hooks/useTeam';
import type { Team, UseTeamReturn } from '../../hooks/useTeam';

// Mock the hook
vi.mock('../../hooks/useTeam', () => ({
  useTeam: vi.fn(),
}));

// Mock MemberGrid since it's tested separately
vi.mock('../../components/teams/MemberGrid', () => ({
  MemberGrid: ({ teamId, captainId }: { teamId: number; captainId: number | null }) => (
    <div data-testid="member-grid-mock" data-team-id={teamId} data-captain-id={captainId}>
      Mocked MemberGrid
    </div>
  ),
}));

const AllProviders = ({ children, initialEntries = ['/teams/1'] }: { children: React.ReactNode; initialEntries?: string[] }) => (
  <HelmetProvider>
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/teams/:id" element={children} />
        <Route path="/404" element={<div data-testid="not-found">404 Page</div>} />
      </Routes>
    </MemoryRouter>
  </HelmetProvider>
);

describe('TeamPage', () => {
  const mockTeam: Team = {
    id: 1,
    name: 'Test Team',
    logo_url: 'https://example.com/logo.png',
    description: 'This is a test team description that might be long enough to need expansion. '.repeat(5),
    division: 'Division A',
    captain_id: 5,
    captain_name: 'Captain Lee',
    captain_avatar_url: 'https://example.com/captain.png',
    record: {
      wins: 10,
      losses: 5,
      win_rate: 66.7,
    },
  };

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUseTeam = (overrides: Partial<UseTeamReturn> = {}) => {
    const defaultReturn: UseTeamReturn = {
      team: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    };
    vi.mocked(useTeamModule.useTeam).mockReturnValue({
      ...defaultReturn,
      ...overrides,
    });
  };

  describe('Invalid Team ID', () => {
    it('should redirect to 404 when id is missing', () => {
      mockUseTeam();

      render(
        <HelmetProvider>
          <MemoryRouter initialEntries={['/teams/']}>
            <Routes>
              <Route path="/teams/:id?" element={<TeamPage />} />
              <Route path="/404" element={<div data-testid="not-found">404 Page</div>} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      );

      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    it('should redirect to 404 when id is not a number', () => {
      mockUseTeam();

      render(
        <AllProviders initialEntries={['/teams/abc']}>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    it('should redirect to 404 when id is zero', () => {
      mockUseTeam();

      render(
        <AllProviders initialEntries={['/teams/0']}>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    it('should redirect to 404 when id is negative', () => {
      mockUseTeam();

      render(
        <AllProviders initialEntries={['/teams/-1']}>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton card while loading', () => {
      mockUseTeam({ isLoading: true });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(document.querySelectorAll('[data-testid="skeleton-card"]').length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should render error state when there is an error', () => {
      mockUseTeam({
        error: new Error('Failed to load team'),
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', () => {
      mockUseTeam({
        error: new Error('Failed to load team'),
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      const retryButton = screen.getByRole('button', { name: '重试' });
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Team Not Found', () => {
    it('should render not found error state when team is null and not loading/error', () => {
      mockUseTeam({
        team: null,
        isLoading: false,
        error: null,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByText('未找到球队')).toBeInTheDocument();
      expect(screen.getByText('该球队不存在或已被删除')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render team name and division', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByRole('heading', { name: 'Test Team' })).toBeInTheDocument();
      expect(screen.getByText('Division A')).toBeInTheDocument();
    });

    it('should render team record with wins, losses, and win rate', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByText('战绩')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('(66.7%)')).toBeInTheDocument();
    });

    it('should render team logo with provided url', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      const img = screen.getByAltText('Test Team') as HTMLImageElement;
      expect(img.src).toBe('https://example.com/logo.png');
    });

    it('should use default logo when logo_url is null', () => {
      mockUseTeam({
        team: { ...mockTeam, logo_url: null },
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      const img = screen.getByAltText('Test Team') as HTMLImageElement;
      expect(img.src).toContain('placehold.co');
    });

    it('should render description and expand/collapse button', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getByText(/This is a test team description/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /展开|收起/ })).toBeInTheDocument();
    });

    it('should toggle description expansion on button click', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      const toggleButton = screen.getByRole('button', { name: /展开|收起/ });

      // Initial state should show "展开" (expand)
      expect(toggleButton).toHaveTextContent('展开');

      fireEvent.click(toggleButton);

      // After click should show "收起" (collapse)
      expect(toggleButton).toHaveTextContent('收起');

      fireEvent.click(toggleButton);

      // After second click should show "展开" again
      expect(toggleButton).toHaveTextContent('展开');
    });

    it('should not render description section when description is null', () => {
      mockUseTeam({
        team: { ...mockTeam, description: null },
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.queryByRole('button', { name: /展开|收起/ })).not.toBeInTheDocument();
    });

    it('should not render division badge when division is null', () => {
      mockUseTeam({
        team: { ...mockTeam, division: null },
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.queryByText('Division A')).not.toBeInTheDocument();
    });

    it('should render MemberGrid with correct props', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      const memberGridMock = screen.getByTestId('member-grid-mock');
      expect(memberGridMock).toBeInTheDocument();
      expect(memberGridMock).toHaveAttribute('data-team-id', '1');
      expect(memberGridMock).toHaveAttribute('data-captain-id', '5');
    });

    it('should pass correct teamId to useTeam hook', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders initialEntries={['/teams/42']}>
          <TeamPage />
        </AllProviders>
      );

      expect(useTeamModule.useTeam).toHaveBeenCalledWith(42);
    });

    it('should render navbar and footer', () => {
      mockUseTeam({
        team: mockTeam,
        isLoading: false,
      });

      render(
        <AllProviders>
          <TeamPage />
        </AllProviders>
      );

      expect(screen.getAllByText('举父棒球联赛').length).toBeGreaterThan(0);
      expect(screen.getByText('数据仅供学习交流使用')).toBeInTheDocument();
    });
  });
});
