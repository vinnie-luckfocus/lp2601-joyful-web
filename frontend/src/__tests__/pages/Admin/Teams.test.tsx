import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Teams from '../../../pages/Admin/Teams';

describe('Admin Teams Page', () => {
  it('should render within AdminLayout', () => {
    render(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: '球队管理' })).toBeInTheDocument();
    expect(screen.getByText('管理球队信息和设置')).toBeInTheDocument();
    expect(screen.getByText('球队列表')).toBeInTheDocument();
    expect(screen.getByText('球队管理功能即将上线...')).toBeInTheDocument();
  });
});
