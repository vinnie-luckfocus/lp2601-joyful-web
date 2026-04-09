import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceButtons } from '../AttendanceButtons';

describe('AttendanceButtons', () => {
  const mockOnConfirm = vi.fn();
  const mockOnDecline = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both buttons', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    expect(screen.getByTestId('decline-button')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-button')).toHaveTextContent('参加');
    expect(screen.getByTestId('decline-button')).toHaveTextContent('不参加');
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByTestId('confirm-button'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when decline button is clicked', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByTestId('decline-button'));
    expect(mockOnDecline).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons when loading', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('confirm-button')).toBeDisabled();
    expect(screen.getByTestId('decline-button')).toBeDisabled();
  });

  it('enables both buttons when not loading', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('confirm-button')).not.toBeDisabled();
    expect(screen.getByTestId('decline-button')).not.toBeDisabled();
  });

  it('renders selected state for confirmed', () => {
    render(
      <AttendanceButtons
        myStatus="confirmed"
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    const confirmButton = screen.getByTestId('confirm-button');
    expect(confirmButton).toHaveClass('ring-2');
    expect(confirmButton).toHaveClass('ring-[#BF0D3E]');
  });

  it('renders selected state for declined', () => {
    render(
      <AttendanceButtons
        myStatus="declined"
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={false}
      />
    );

    const declineButton = screen.getByTestId('decline-button');
    expect(declineButton).toHaveClass('ring-2');
    expect(declineButton).toHaveClass('ring-gray-400');
  });

  it('does not call handlers when disabled buttons are clicked', () => {
    render(
      <AttendanceButtons
        myStatus={null}
        onConfirm={mockOnConfirm}
        onDecline={mockOnDecline}
        isLoading={true}
      />
    );

    fireEvent.click(screen.getByTestId('confirm-button'));
    fireEvent.click(screen.getByTestId('decline-button'));

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(mockOnDecline).not.toHaveBeenCalled();
  });
});
