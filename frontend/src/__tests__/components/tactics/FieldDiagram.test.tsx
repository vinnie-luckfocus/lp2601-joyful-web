import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldDiagram } from '../../../components/tactics/FieldDiagram';
import type { LineupPlayer } from '../../../hooks/useLineup';

const mockLineup: LineupPlayer[] = [
  { batting_order: 1, user_id: '1', name: '张伟', position: '投手', jersey_number: '1' },
  { batting_order: 2, user_id: '2', name: '王芳', position: '捕手', jersey_number: '2' },
  { batting_order: 3, user_id: '3', name: '李娜', position: '一垒手', jersey_number: '3' },
];

describe('FieldDiagram', () => {
  it('renders SVG with aria-label', () => {
    render(<FieldDiagram lineup={mockLineup} />);
    expect(screen.getByLabelText('棒球场防守位置图')).toBeInTheDocument();
  });

  it('renders all 9 position markers', () => {
    render(<FieldDiagram lineup={mockLineup} />);
    const markers = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
    for (const marker of markers) {
      expect(screen.getByText(marker)).toBeInTheDocument();
    }
  });

  it('displays player names on their positions', () => {
    render(<FieldDiagram lineup={mockLineup} />);
    expect(screen.getByText('张伟')).toBeInTheDocument();
    expect(screen.getByText('王芳')).toBeInTheDocument();
    expect(screen.getByText('李娜')).toBeInTheDocument();
  });

  it('calls onPositionClick when a marker is clicked', () => {
    const handleClick = vi.fn();
    render(<FieldDiagram lineup={mockLineup} onPositionClick={handleClick} />);
    const pitcherMarker = screen.getByText('P').closest('g');
    expect(pitcherMarker).toBeTruthy();
    fireEvent.click(pitcherMarker!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
