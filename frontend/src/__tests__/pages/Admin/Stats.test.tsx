import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Stats from '../../../pages/Admin/Stats';

describe('Admin Stats Page', () => {
  it('should render within AdminLayout', () => {
    render(
      <MemoryRouter>
        <Stats />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: '数据录入' })).toBeInTheDocument();
    expect(screen.getByText('录入和管理比赛统计数据')).toBeInTheDocument();
    expect(screen.getByText('统计数据')).toBeInTheDocument();
    expect(screen.getByText('数据录入功能即将上线...')).toBeInTheDocument();
  });
});
