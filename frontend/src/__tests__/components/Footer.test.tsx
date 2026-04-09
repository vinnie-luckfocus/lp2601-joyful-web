import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../components/layout/Footer';

describe('Footer', () => {
  it('renders with logo and brand name', () => {
    render(<Footer />);
    expect(screen.getByText('JF')).toBeInTheDocument();
    expect(screen.getByText('举父棒球联赛')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Footer />);
    expect(screen.getByText(/专业的棒球联赛数据平台/)).toBeInTheDocument();
  });

  it('renders footer link sections', () => {
    render(<Footer />);
    expect(screen.getByText('产品')).toBeInTheDocument();
    expect(screen.getByText('支持')).toBeInTheDocument();
    expect(screen.getByText('关于')).toBeInTheDocument();
  });

  it('renders product links', () => {
    render(<Footer />);
    expect(screen.getByText('球队数据')).toBeInTheDocument();
    expect(screen.getByText('球员统计')).toBeInTheDocument();
    expect(screen.getByText('赛程安排')).toBeInTheDocument();
  });

  it('renders support links', () => {
    render(<Footer />);
    expect(screen.getByText('帮助中心')).toBeInTheDocument();
    expect(screen.getByText('联系我们')).toBeInTheDocument();
    expect(screen.getByText('反馈建议')).toBeInTheDocument();
  });

  it('renders about links', () => {
    render(<Footer />);
    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
    expect(screen.getByText('服务条款')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    render(<Footer />);
    expect(screen.getByText('数据仅供学习交流使用')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Footer className="custom-footer" />);
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });

  it('has MLB navy background', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer')).toHaveClass('bg-mlb-navy');
  });
});
