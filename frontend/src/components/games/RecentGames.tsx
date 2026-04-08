import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { useRecentGames, type Highlight } from '../../hooks/useRecentGames';
import { DataFreshnessIndicator } from '../common/DataFreshnessIndicator';
import { ErrorState } from '../common/ErrorState';
import { SkeletonCard } from '../common/Skeleton';

interface HighlightBadgeProps {
  highlight: Highlight;
}

const HighlightBadge: React.FC<HighlightBadgeProps> = ({ highlight }) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'hr':
        return 'bg-mlb-red text-white';
      case 'rbi':
        return 'bg-gold text-mlb-navy';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
        highlight.type
      )}`}
      data-testid="highlight-badge"
    >
      {highlight.description}
    </span>
  );
};

interface RecentGameCardProps {
  game: {
    id: string;
    homeTeam: {
      id: string;
      name: string;
      score: number;
    };
    awayTeam: {
      id: string;
      name: string;
      score: number;
    };
    matchDate: string;
    venue: string;
    highlights: Highlight[];
  };
  onClick?: (gameId: string) => void;
  index: number;
}

const RecentGameCard: React.FC<RecentGameCardProps> = ({
  game,
  onClick,
  index,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isHomeWinner = game.homeTeam.score > game.awayTeam.score;
  const isAwayWinner = game.awayTeam.score > game.homeTeam.score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      style={{ willChange: 'transform' }}
      className="bg-white rounded-card shadow-card border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg"
      onClick={() => onClick?.(game.id)}
      data-testid="recent-game-card"
    >
      {/* Header - Date & Venue */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(game.matchDate)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {game.venue}
          </span>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </div>

      {/* Teams & Score */}
      <div className="p-4">
        {/* Away Team */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {isAwayWinner && (
              <Trophy size={16} className="text-gold" data-testid="winner-trophy" />
            )}
            <span
              className={`font-medium ${
                isAwayWinner ? 'text-mlb-navy' : 'text-gray-600'
              }`}
            >
              {game.awayTeam.name}
            </span>
          </div>
          <span
            className={`text-xl font-bold ${
              isAwayWinner ? 'text-mlb-navy' : 'text-gray-400'
            }`}
          >
            {game.awayTeam.score}
          </span>
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isHomeWinner && (
              <Trophy size={16} className="text-gold" data-testid="winner-trophy" />
            )}
            <span
              className={`font-medium ${
                isHomeWinner ? 'text-mlb-navy' : 'text-gray-600'
              }`}
            >
              {game.homeTeam.name}
            </span>
          </div>
          <span
            className={`text-xl font-bold ${
              isHomeWinner ? 'text-mlb-navy' : 'text-gray-400'
            }`}
          >
            {game.homeTeam.score}
          </span>
        </div>

        {/* Highlights */}
        {game.highlights.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2" data-testid="highlights-container">
              {game.highlights.map((highlight, idx) => (
                <HighlightBadge key={idx} highlight={highlight} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export interface RecentGamesProps {
  onGameClick?: (gameId: string) => void;
  onViewAllClick?: () => void;
  className?: string;
}

export const RecentGames: React.FC<RecentGamesProps> = ({
  onGameClick,
  onViewAllClick,
  className = '',
}) => {
  const { games, isLoading, error, lastUpdated, refetch } = useRecentGames(3);

  const handleGameClick = (gameId: string) => {
    if (onGameClick) {
      onGameClick(gameId);
    } else {
      // Default behavior: show coming soon or navigate
      console.log(`Game ${gameId} clicked - detail page coming soon`);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`} data-testid="recent-games-loading">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-mlb-navy">最近战报</h2>
          <SkeletonCard rows={0} className="w-32 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} rows={3} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} data-testid="recent-games-error">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-mlb-navy">最近战报</h2>
        </div>
        <ErrorState
          title="加载失败"
          message={error.message}
          onRetry={refetch}
          retryLabel="重新加载"
        />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className={className} data-testid="recent-games-empty">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-mlb-navy">最近战报</h2>
        </div>
        <div className="bg-gray-50 rounded-card p-8 text-center">
          <p className="text-gray-500">暂无最近战报</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-testid="recent-games">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-mlb-navy">最近战报</h2>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <DataFreshnessIndicator lastUpdated={lastUpdated} />
          )}
          <button
            onClick={onViewAllClick}
            className="text-sm text-mlb-red hover:text-mlb-red-dark font-medium flex items-center gap-1 transition-colors"
            data-testid="view-all-button"
          >
            查看更多
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <RecentGameCard
            key={game.id}
            game={game}
            index={index}
            onClick={handleGameClick}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentGames;
