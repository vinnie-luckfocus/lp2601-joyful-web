import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Videos from '../../../pages/Admin/Videos';

describe('Admin Videos Page', () => {
  it('should render within AdminLayout', () => {
    render(
      <MemoryRouter>
        <Videos />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: '视频管理' })).toBeInTheDocument();
    expect(screen.getByText('管理比赛视频和集锦')).toBeInTheDocument();
    expect(screen.getByText('视频列表')).toBeInTheDocument();
    expect(screen.getByText('视频管理功能即将上线...')).toBeInTheDocument();
  });
});
