import { motion } from 'framer-motion';
import { ChevronRight, CalendarX } from 'lucide-react';
import { GameCard } from './GameCard';
import { DataFreshnessIndicator } from '../common/DataFreshnessIndicator';
import { ErrorState } from '../common/ErrorState';
import { SkeletonCard } from '../common/Skeleton';
import { usePublicGames } from '../../hooks/usePublicGames';
import { useState } from 'react';

export interface GameGridProps {
  limit?: number;
  showViewMore?: boolean;
  viewMoreHref?: string;
}

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
}

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const checkRouteExists = (href: string): boolean => {
  // List of implemented routes
  const implementedRoutes = ['/admin/games'];
  return implementedRoutes.includes(href);
};

export const GameGrid: React.FC<GameGridProps> = ({
  limit = 4,
  showViewMore = true,
  viewMoreHref = '/games',
}) => {
  const { games, isLoading, error, refetch, lastUpdated } = usePublicGames(limit);
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, x: 0, y: 0 });
  const isRouteImplemented = checkRouteExists(viewMoreHref);

  const handleViewMoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isRouteImplemented) {
      e.preventDefault();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isRouteImplemented) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 40,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-mlb-navy">近期赛程</h2>
          <SkeletonCard className="w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <SkeletonCard key={index} rows={3} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mlb-navy">近期赛程</h2>
        <ErrorState
          title="加载赛程失败"
          message={error.message || '无法加载比赛数据，请稍后重试'}
          onRetry={refetch}
          retryLabel="重新加载"
        />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mlb-navy" id="games-section-title">近期赛程</h2>
        <div className="bg-gray-50 rounded-xl p-12 text-center" role="status" aria-live="polite">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <CalendarX size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无赛程</h3>
          <p className="text-gray-500">近期没有安排的比赛</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-mlb-navy" id="games-section-title">近期赛程</h2>
        <div className="flex items-center gap-4">
          {lastUpdated && <DataFreshnessIndicator lastUpdated={lastUpdated} />}
          {showViewMore && (
            <a
              href={viewMoreHref}
              onClick={handleViewMoreClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mlb-navy focus:ring-offset-2 rounded ${
                isRouteImplemented
                  ? 'text-mlb-red hover:text-mlb-red-dark'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              data-testid="view-more-link"
              aria-label={isRouteImplemented ? '查看更多赛程' : '查看更多赛程 - 即将上线'}
            >
              查看更多
              <ChevronRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && !isRouteImplemented && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
          }}
          data-testid="coming-soon-tooltip"
        >
          即将上线
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Grid */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        data-testid="game-grid"
        role="region"
        aria-labelledby="games-section-title"
      >
        {games.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </motion.div>
    </div>
  );
};

export default GameGrid;
