import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { Skeleton, SkeletonCard, SkeletonTable } from '../components/common/Skeleton';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { ErrorState } from '../components/common/ErrorState';
import { useState } from 'react';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = () => {
    window.location.href = '/login';
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onLoginClick={handleLoginClick} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-mlb-navy py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              MLB 数据平台
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              专业的棒球数据分析平台，为您提供实时、准确的 MLB 赛事数据和统计信息
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/teams'}
                variant="primary"
                size="lg"
                className="bg-mlb-red hover:bg-mlb-red-dark"
              >
                浏览球队
              </Button>
              <Button
                onClick={() => window.location.href = '/players'}
                variant="secondary"
                size="lg"
              >
                查看球员
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-mlb-navy mb-4">
                功能特色
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                全面的数据分析工具，助您深入了解 MLB 赛事
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-card shadow-card p-6 hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-12 h-12 bg-mlb-navy/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-mlb-navy" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
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

        {/* Demo Section - Component Showcase */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-mlb-navy mb-4">
                组件展示
              </h2>
              <p className="text-gray-600">
                基础布局与主题配置组件预览
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Skeleton Demo */}
              <div className="bg-gray-50 rounded-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Skeleton 加载骨架
                </h3>
                <SkeletonCard rows={3} />
              </div>

              {/* DataFreshnessIndicator Demo */}
              <div className="bg-gray-50 rounded-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  数据时效指示器
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="text-gray-700">球队数据</span>
                    <DataFreshnessIndicator lastUpdated={new Date()} />
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="text-gray-700">球员统计</span>
                    <DataFreshnessIndicator lastUpdated={Date.now() - 5 * 60 * 1000} />
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="text-gray-700">赛程安排</span>
                    <DataFreshnessIndicator lastUpdated={Date.now() - 60 * 60 * 1000} />
                  </div>
                </div>
              </div>

              {/* Button Demo */}
              <div className="bg-gray-50 rounded-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Button 按钮组件
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">主要按钮</Button>
                  <Button variant="secondary">次要按钮</Button>
                  <Button variant="danger">危险按钮</Button>
                  <Button variant="ghost">幽灵按钮</Button>
                </div>
              </div>

              {/* ErrorState Demo */}
              <div className="bg-gray-50 rounded-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                    <p className="text-gray-600 mb-4">点击按钮查看错误状态组件</p>
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
    </div>
  );
};

export default HomePage;
