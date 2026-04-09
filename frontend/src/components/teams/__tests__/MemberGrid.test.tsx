import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberGrid } from '../MemberGrid';
import * as useTeamMembersModule from '../../../hooks/useTeamMembers';
import type { TeamMember } from '../../../hooks/useTeamMembers';

vi.mock('../../../hooks/useTeamMembers', async () => {
  const actual = await vi.importActual<typeof useTeamMembersModule>('../../../hooks/useTeamMembers');
  return {
    ...actual,
    useTeamMembers: vi.fn(),
  };
});

const mockUseTeamMembers = vi.mocked(useTeamMembersModule.useTeamMembers);

const mockMembers: TeamMember[] = [
  { id: 1, name: '张伟', jersey_number: 1, position: '投手', role: 'player', avatar_url: null },
  { id: 2, name: '王芳', jersey_number: 2, position: '捕手', role: 'player', avatar_url: null },
];

describe('MemberGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseTeamMembers.mockReturnValue({
      members: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<MemberGrid teamId={1} captainId={1} />);
    expect(document.querySelector('[data-testid="skeleton-card"]')).toBeInTheDocument();
  });

  it('renders members with captain badge', async () => {
    mockUseTeamMembers.mockReturnValue({
      members: mockMembers,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MemberGrid teamId={1} captainId={1} />);
    await waitFor(() => {
      expect(screen.getByText('张伟')).toBeInTheDocument();
    });

    expect(screen.getByText('王芳')).toBeInTheDocument();
    expect(screen.getByTestId('member-grid')).toHaveClass('grid-cols-2', 'md:grid-cols-4');
  });

  it('renders empty state when no members', async () => {
    mockUseTeamMembers.mockReturnValue({
      members: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MemberGrid teamId={1} captainId={null} />);
    await waitFor(() => {
      expect(screen.getByText('暂无成员')).toBeInTheDocument();
    });
  });
});
