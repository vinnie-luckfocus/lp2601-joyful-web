import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Games from '../../../pages/Admin/Games';

describe('Admin Games Page', () => {
  it('should render within AdminLayout', () => {
    render(
      <MemoryRouter>
        <Games />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: '赛程管理' })).toBeInTheDocument();
    expect(screen.getByText('管理比赛日程和赛程安排')).toBeInTheDocument();
    expect(screen.getByText('赛程列表')).toBeInTheDocument();
    expect(screen.getByText('赛程管理功能即将上线...')).toBeInTheDocument();
  });
});
