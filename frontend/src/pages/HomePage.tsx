import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/common/Button';
import { SkeletonCard, SkeletonTable } from '../components/common/Skeleton';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { ErrorState } from '../components/common/ErrorState';
import { SEO } from '../components/seo';
import { HeroSection } from '../components/hero/HeroSection';
import { GameGrid } from '../components/games/GameGrid';
import { RecentGames } from '../components/games/RecentGames';
import { StatsSection } from '../components/stats/StatsSection';
import { LoginModal } from '../components/LoginModal';
import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { useSearchParams } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    // Deep-link fallback: open login modal if ?login=true
    if (searchParams.get('login') === 'true') {
      setIsLoginModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleRetry = () => {
    setShowError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const features = [
    {
      icon: Trophy,
      title: '球队数据',
      description: '全面的球队统计数据和排名信息',
    },
    {
      icon: Users,
      title: '球员统计',
      description: '详细的球员表现数据分析',
    },
    {
      icon: Calendar,
      title: '赛程安排',
      description: '实时更新的比赛日程和结果',
    },
    {
      icon: TrendingUp,
      title: '数据趋势',
      description: '历史数据对比和趋势分析',
    },
  ];

  // JSON-LD structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: '举父棒球联赛',
    description: '专业的棒球联赛数据平台，为您提供实时、准确的赛事数据和统计信息',
    url: 'https://joyful-baseball.example.com',
    sport: 'Baseball',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO
        title="举父棒球联赛 - 专业的棒球联赛数据平台"
        description="专业的棒球联赛数据平台，为您提供实时、准确的赛事数据和统计信息。查看球队排名、球员数据、赛程安排和历史战绩。"
        structuredData={structuredData}
      />

      <Navbar
        onLoginClick={handleLoginClick}
        isLoggedIn={isAuthenticated}
        userName={user?.name}
      />

      <main className="flex-1" role="main">
        {/* Hero Section */}
        <HeroSection
          leagueName="举父棒球联赛"
          slogan="专业的棒球联赛数据平台，为您提供实时、准确的赛事数据和统计信息"
          onLoginClick={handleLoginClick}
        />

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="features-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 id="features-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mlb-navy mb-3 sm:mb-4">
                功能特色
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                全面的数据分析工具，助您深入了解联赛赛事
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-card shadow-card p-4 sm:p-6 hover:shadow-card-hover transition-shadow focus-within:ring-2 focus-within:ring-mlb-navy focus-within:ring-offset-2"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-mlb-navy/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-mlb-navy" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - Standings + Leaderboard */}
        <StatsSection />

        {/* Recent Games Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-labelledby="recent-games-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RecentGames className="max-w-5xl mx-auto" />
          </div>
        </section>

        {/* Upcoming Games Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50" aria-labelledby="upcoming-games-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="upcoming-games-title" className="sr-only">即将进行的比赛</h2>
            <GameGrid limit={3} showViewMore={true} />
          </div>
        </section>

        {/* Demo Section - Component Showcase */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-labelledby="demo-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 id="demo-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mlb-navy mb-3 sm:mb-4">
                组件展示
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                基础布局与主题配置组件预览
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Skeleton Demo */}
              <div className="bg-gray-50 rounded-card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Skeleton 加载骨架
                </h3>
                <SkeletonCard rows={3} />
              </div>

              {/* DataFreshnessIndicator Demo */}
              <div className="bg-gray-50 rounded-card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  数据时效指示器
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="text-gray-700 text-sm sm:text-base">球队数据</span>
                    <DataFreshnessIndicator lastUpdated={new Date()} />
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="text-gray-700 text-sm sm:text-base">球员统计</span>
                    <DataFreshnessIndicator lastUpdated={Date.now() - 5 * 60 * 1000} />
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="text-gray-700 text-sm sm:text-base">赛程安排</span>
                    <DataFreshnessIndicator lastUpdated={Date.now() - 60 * 60 * 1000} />
                  </div>
                </div>
              </div>

              {/* Button Demo */}
              <div className="bg-gray-50 rounded-card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Button 按钮组件
                </h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Button variant="primary">主要按钮</Button>
                  <Button variant="secondary">次要按钮</Button>
                  <Button variant="danger">危险按钮</Button>
                  <Button variant="ghost">幽灵按钮</Button>
                </div>
              </div>

              {/* ErrorState Demo */}
              <div className="bg-gray-50 rounded-card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  ErrorState 错误状态
                </h3>
                {showError ? (
                  <ErrorState
                    title="加载失败"
                    message="数据加载出错，点击重试按钮重新加载"
                    onRetry={handleRetry}
                  />
                ) : isLoading ? (
                  <div className="py-8">
                    <SkeletonTable columns={3} rows={3} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">点击按钮查看错误状态组件</p>
                    <Button
                      variant="danger"
                      onClick={() => setShowError(true)}
                    >
                      模拟错误
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default HomePage;
