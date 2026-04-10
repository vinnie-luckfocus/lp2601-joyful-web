import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Players from '../../../pages/Admin/Players';

describe('Admin Players Page', () => {
  it('should render within AdminLayout', () => {
    render(
      <MemoryRouter>
        <Players />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: '队员管理' })).toBeInTheDocument();
    expect(screen.getByText('管理队员信息和档案')).toBeInTheDocument();
    expect(screen.getByText('队员列表')).toBeInTheDocument();
    expect(screen.getByText('队员管理功能即将上线...')).toBeInTheDocument();
  });
});
