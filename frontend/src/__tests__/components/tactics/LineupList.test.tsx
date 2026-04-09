import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LineupList } from '../../../components/tactics/LineupList';
import type { LineupPlayer } from '../../../hooks/useLineup';

const mockLineup: LineupPlayer[] = [
  { batting_order: 1, user_id: '1', name: '张伟', position: '投手', jersey_number: '1' },
  { batting_order: 2, user_id: '2', name: '王芳', position: '捕手', jersey_number: '2' },
  { batting_order: 3, user_id: '3', name: '李娜', position: '一垒手', jersey_number: '3' },
];

describe('LineupList', () => {
  it('renders all lineup rows in batting order', () => {
    render(<LineupList lineup={mockLineup} />);
    expect(screen.getByText('张伟')).toBeInTheDocument();
    expect(screen.getByText('王芳')).toBeInTheDocument();
    expect(screen.getByText('李娜')).toBeInTheDocument();
  });

  it('renders jersey number and position for each player', () => {
    render(<LineupList lineup={mockLineup} />);
    expect(screen.getByText('#1 · 投手')).toBeInTheDocument();
    expect(screen.getByText('#2 · 捕手')).toBeInTheDocument();
    expect(screen.getByText('#3 · 一垒手')).toBeInTheDocument();
  });

  it('highlights current user row with red background', () => {
    const { container } = render(<LineupList lineup={mockLineup} currentUserId="2" />);
    const currentRow = screen.getByText('王芳').closest('div[class*="bg-[#BF0D3E]"]');
    expect(currentRow).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const handleClick = vi.fn();
    render(<LineupList lineup={mockLineup} onRowClick={handleClick} />);
    const row = screen.getByText('张伟').closest('div[class*="cursor-pointer"]');
    expect(row).toBeTruthy();
    fireEvent.click(row!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('sorts lineup by batting order', () => {
    const unsorted: LineupPlayer[] = [
      { batting_order: 3, user_id: '3', name: '李娜', position: '一垒手', jersey_number: '3' },
      { batting_order: 1, user_id: '1', name: '张伟', position: '投手', jersey_number: '1' },
      { batting_order: 2, user_id: '2', name: '王芳', position: '捕手', jersey_number: '2' },
    ];
    render(<LineupList lineup={unsorted} />);
    const rows = screen.getAllByText(/张伟|王芳|李娜/);
    expect(rows[0]).toHaveTextContent('张伟');
    expect(rows[1]).toHaveTextContent('王芳');
    expect(rows[2]).toHaveTextContent('李娜');
  });
});
