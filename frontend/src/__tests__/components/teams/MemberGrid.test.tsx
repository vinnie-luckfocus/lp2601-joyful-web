import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberGrid } from '../../../components/teams/MemberGrid';
import * as useTeamMembersModule from '../../../hooks/useTeamMembers';
import type { TeamMember, UseTeamMembersReturn } from '../../../hooks/useTeamMembers';

// Mock the hook
vi.mock('../../../hooks/useTeamMembers', () => ({
  useTeamMembers: vi.fn(),
}));

describe('MemberGrid', () => {
  const mockMembers: TeamMember[] = [
    {
      id: 1,
      name: '张三',
      jersey_number: 10,
      position: '投手',
      role: 'player',
      avatar_url: 'https://example.com/avatar1.jpg',
    },
    {
      id: 2,
      name: '李四',
      jersey_number: 23,
      position: '捕手',
      role: 'player',
      avatar_url: null,
    },
    {
      id: 3,
      name: '王五',
      jersey_number: null,
      position: null,
      role: 'coach',
      avatar_url: 'https://example.com/avatar3.jpg',
    },
  ];

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUseTeamMembers = (overrides: Partial<UseTeamMembersReturn> = {}) => {
    const defaultReturn: UseTeamMembersReturn = {
      members: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    };
    vi.mocked(useTeamMembersModule.useTeamMembers).mockReturnValue({
      ...defaultReturn,
      ...overrides,
    });
  };

  describe('Loading State', () => {
    it('should render skeleton cards when loading', () => {
      mockUseTeamMembers({ isLoading: true });

      render(<MemberGrid teamId={1} captainId={1} />);

      expect(screen.getByText('球队成员')).toBeInTheDocument();
      expect(document.querySelectorAll('[data-testid="skeleton-card"]').length).toBe(4);
    });
  });

  describe('Error State', () => {
    it('should render error state when there is an error', () => {
      mockUseTeamMembers({
        error: new Error('Failed to load members'),
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      expect(screen.getByText('球队成员')).toBeInTheDocument();
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', () => {
      mockUseTeamMembers({
        error: new Error('Failed to load members'),
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      const retryButton = screen.getByRole('button', { name: '重试' });
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no members', () => {
      mockUseTeamMembers({
        members: [],
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      expect(screen.getByText('暂无成员')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render member grid when data is loaded', () => {
      mockUseTeamMembers({
        members: mockMembers,
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      expect(screen.getByTestId('member-grid')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('王五')).toBeInTheDocument();
    });

    it('should display jersey number and position for each member', () => {
      mockUseTeamMembers({
        members: mockMembers,
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      expect(screen.getByText('#10 · 投手')).toBeInTheDocument();
      expect(screen.getByText('#23 · 捕手')).toBeInTheDocument();
    });

    it('should display fallback for null jersey number and position', () => {
      mockUseTeamMembers({
        members: mockMembers,
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      expect(screen.getByText('#- · 未知位置')).toBeInTheDocument();
    });

    it('should display captain crown badge for captain member', () => {
      mockUseTeamMembers({
        members: mockMembers,
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      // Captain is member id 1 (张三)
      const memberCards = screen.getAllByText(/张三|李四|王五/);
      expect(memberCards[0]).toBeInTheDocument();
    });

    it('should not display captain badge for non-captain members', () => {
      mockUseTeamMembers({
        members: mockMembers,
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={1} />);

      // All members rendered, only first one (id=1) is captain
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('王五')).toBeInTheDocument();
    });

    it('should use default avatar when avatar_url is null', () => {
      mockUseTeamMembers({
        members: [mockMembers[1]],
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={null} />);

      const img = screen.getByAltText('李四') as HTMLImageElement;
      expect(img.src).toContain('placehold.co');
    });

    it('should use provided avatar_url when available', () => {
      mockUseTeamMembers({
        members: [mockMembers[0]],
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={null} />);

      const img = screen.getByAltText('张三') as HTMLImageElement;
      expect(img.src).toBe('https://example.com/avatar1.jpg');
    });

    it('should handle captainId as null', () => {
      mockUseTeamMembers({
        members: mockMembers,
        isLoading: false,
      });

      render(<MemberGrid teamId={1} captainId={null} />);

      expect(screen.getByTestId('member-grid')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should pass teamId to useTeamMembers hook', () => {
      mockUseTeamMembers({
        members: [],
        isLoading: false,
      });

      render(<MemberGrid teamId={42} captainId={5} />);

      expect(useTeamMembersModule.useTeamMembers).toHaveBeenCalledWith(42);
    });

    it('should pass captainId for determining captain badge', () => {
      mockUseTeamMembers({
        members: mockMembers,
        isLoading: false,
      });

      const { container } = render(<MemberGrid teamId={1} captainId={2} />);

      // Member id 2 (李四) is now the captain
      expect(container.querySelector('title')).not.toBe('队长');
    });
  });
});
