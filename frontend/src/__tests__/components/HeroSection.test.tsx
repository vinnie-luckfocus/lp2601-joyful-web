import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { HeroSection } from '../../components/hero/HeroSection';

describe('HeroSection', () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    originalImage = global.Image;
  });

  afterEach(() => {
    global.Image = originalImage;
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('hero-title')).toHaveTextContent('举父棒球联赛');
    expect(screen.getByTestId('hero-slogan')).toHaveTextContent(
      '专业的棒球联赛数据平台，为您提供实时、准确的赛事数据和统计信息'
    );
    expect(screen.getByTestId('hero-login-button')).toHaveTextContent('登录');
  });

  it('renders with custom props', () => {
    render(
      <HeroSection
        leagueName="Custom League"
        slogan="Custom slogan text"
      />
    );

    expect(screen.getByTestId('hero-title')).toHaveTextContent('Custom League');
    expect(screen.getByTestId('hero-slogan')).toHaveTextContent('Custom slogan text');
  });

  it('calls onLoginClick when login button is clicked', () => {
    const handleLoginClick = vi.fn();
    render(<HeroSection onLoginClick={handleLoginClick} />);

    fireEvent.click(screen.getByTestId('hero-login-button'));
    expect(handleLoginClick).toHaveBeenCalledTimes(1);
  });

  it('has correct height classes', () => {
    render(<HeroSection />);

    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toHaveClass('h-[50vh]', 'md:h-[60vh]');
  });

  it('renders login button with MLB Red color', () => {
    render(<HeroSection />);

    const loginButton = screen.getByTestId('hero-login-button');
    expect(loginButton).toHaveClass('bg-mlb-red');
  });

  it('has bottom gradient transition', () => {
    render(<HeroSection />);

    const bottomGradient = screen.getByTestId('hero-bottom-gradient');
    expect(bottomGradient).toBeInTheDocument();
    expect(bottomGradient).toHaveClass(
      'absolute',
      'bottom-0',
      'bg-gradient-to-t',
      'from-gray-50'
    );
  });

  it('has responsive text sizes', () => {
    render(<HeroSection />);

    const title = screen.getByTestId('hero-title');
    expect(title).toHaveClass('text-4xl', 'md:text-6xl');
  });

  it('has white bold text for title', () => {
    render(<HeroSection />);

    const title = screen.getByTestId('hero-title');
    expect(title).toHaveClass('text-white', 'font-bold');
  });

  it('centers content', () => {
    render(<HeroSection />);

    const content = screen.getByTestId('hero-title').parentElement;
    expect(content).toHaveClass('text-center');
  });

  it('loads background image lazily', async () => {
    // Mock Image to simulate successful loading
    const mockOnload = vi.fn();
    global.Image = class MockImage {
      src = '';
      onload: (() => void) | null = null;
      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 10);
      }
    } as unknown as typeof Image;

    const backgroundImage = '/test-image.jpg';
    render(<HeroSection backgroundImage={backgroundImage} />);

    // Should show placeholder initially
    expect(screen.getByTestId('hero-background-placeholder')).toBeInTheDocument();

    // Wait for image to load
    await waitFor(() => {
      expect(screen.queryByTestId('hero-background-placeholder')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('does not show placeholder when no background image provided', () => {
    render(<HeroSection />);

    expect(screen.queryByTestId('hero-background-placeholder')).not.toBeInTheDocument();
  });

  it('has MLB Navy gradient background when no image', () => {
    render(<HeroSection />);

    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toHaveStyle({
      background: 'linear-gradient(to bottom, #041E42, #0a2a5c)',
    });
  });

  it('renders Framer Motion animated elements', () => {
    render(<HeroSection />);

    // All animated elements should be rendered
    expect(screen.getByTestId('hero-title')).toBeInTheDocument();
    expect(screen.getByTestId('hero-slogan')).toBeInTheDocument();
    expect(screen.getByTestId('hero-button-container')).toBeInTheDocument();
  });
});
