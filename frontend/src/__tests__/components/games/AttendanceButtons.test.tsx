import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttendanceButtons } from '../../../components/games/AttendanceButtons';

describe('AttendanceButtons', () => {
  it('should render confirm and decline buttons', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />
    );

    expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    expect(screen.getByTestId('decline-button')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={onConfirm}
        onDecline={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('confirm-button'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onDecline when decline button is clicked', () => {
    const onDecline = vi.fn();
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={vi.fn()}
        onDecline={onDecline}
      />
    );

    fireEvent.click(screen.getByTestId('decline-button'));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when loading', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('confirm-button')).toBeDisabled();
    expect(screen.getByTestId('decline-button')).toBeDisabled();
  });

  it('should show confirmed state', () => {
    render(
      <AttendanceButtons
        myStatus="confirmed"
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />
    );

    const confirmButton = screen.getByTestId('confirm-button');
    expect(confirmButton).toHaveClass('ring-2');
  });

  it('should show declined state', () => {
    render(
      <AttendanceButtons
        myStatus="declined"
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />
    );

    const declineButton = screen.getByTestId('decline-button');
    expect(declineButton).toHaveClass('ring-2');
  });
});
