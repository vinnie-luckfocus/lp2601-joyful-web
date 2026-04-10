import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../../../pages/Admin';

const mockGet = vi.fn();

vi.mock('../../../utils/axios', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

describe('Admin Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to Admin Panel')).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBeGreaterThanOrEqual(1);
  });

  it('should render stats cards after API success', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] }) // teams
      .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] }) // players
      .mockResolvedValueOnce({ data: [{ id: 1 }] }); // games

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Teams')).toBeInTheDocument();
    expect(screen.getByText('Total Players')).toBeInTheDocument();
    expect(screen.getByText('Total Games')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
  });

  it('should render Quick Actions with correct links', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    const teamsLink = screen.getByText('Manage Teams').closest('a');
    const playersLink = screen.getByText('Manage Players').closest('a');
    const gamesLink = screen.getByText('Manage Games').closest('a');

    expect(teamsLink).toHaveAttribute('href', '/admin/teams');
    expect(playersLink).toHaveAttribute('href', '/admin/players');
    expect(gamesLink).toHaveAttribute('href', '/admin/games');
  });

  it('should handle API errors gracefully', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Welcome to Admin Panel')).toBeInTheDocument();
  });

  it('should default counts to 0 when API returns no data', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    const zeroCounts = await screen.findAllByText('0');
    expect(zeroCounts.length).toBeGreaterThanOrEqual(3);
  });
});
