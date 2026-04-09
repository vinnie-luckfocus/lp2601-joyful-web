import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TacticsPanel } from '../../../components/tactics/TacticsPanel';
import type { Tactics } from '../../../hooks/useLineup';

const mockTactics: Tactics = {
  general_notes: '总体战术：稳扎稳打',
  signals: { steal: '双触耳', bunt: '摸帽檐' },
  defense_strategy: '内野守备采用标准站位',
};

describe('TacticsPanel', () => {
  it('renders all three sections', () => {
    render(<TacticsPanel tactics={mockTactics} />);
    expect(screen.getByText('总体战术')).toBeInTheDocument();
    expect(screen.getByText('暗号')).toBeInTheDocument();
    expect(screen.getByText('防守策略')).toBeInTheDocument();
  });

  it('shows general notes content when expanded by default', () => {
    render(<TacticsPanel tactics={mockTactics} />);
    expect(screen.getByText('总体战术：稳扎稳打')).toBeInTheDocument();
  });

  it('expands and collapses sections on click', () => {
    render(<TacticsPanel tactics={mockTactics} />);
    const signalsButton = screen.getByRole('button', { name: /暗号/ });
    fireEvent.click(signalsButton);
    expect(screen.getByText('steal')).toBeInTheDocument();
    expect(screen.getByText('双触耳')).toBeInTheDocument();
    fireEvent.click(signalsButton);
  });

  it('renders signals as key-value list', () => {
    render(<TacticsPanel tactics={mockTactics} />);
    const signalsButton = screen.getByRole('button', { name: /暗号/ });
    fireEvent.click(signalsButton);
    expect(screen.getByText('steal')).toBeInTheDocument();
    expect(screen.getByText('双触耳')).toBeInTheDocument();
    expect(screen.getByText('bunt')).toBeInTheDocument();
    expect(screen.getByText('摸帽檐')).toBeInTheDocument();
  });

  it('shows empty state when no tactics data', () => {
    render(<TacticsPanel tactics={{ general_notes: null, signals: {}, defense_strategy: null }} />);
    expect(screen.getByText('暂无战术安排')).toBeInTheDocument();
  });

  it('skips sections with no data', () => {
    render(<TacticsPanel tactics={{ general_notes: 'notes', signals: {}, defense_strategy: null }} />);
    expect(screen.getByText('总体战术')).toBeInTheDocument();
    expect(screen.queryByText('暗号')).not.toBeInTheDocument();
    expect(screen.queryByText('防守策略')).not.toBeInTheDocument();
  });
});
