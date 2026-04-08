import { motion } from 'framer-motion';
import { Calendar, MapPin, Shield } from 'lucide-react';
import type { Game } from '../../hooks/usePublicGames';

export interface GameCardProps {
  game: Game;
  index?: number;
}

export const formatGameDate = (scheduledAt: string): string => {
  const date = new Date(scheduledAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === date.toDateString();

  if (isToday) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (isTomorrow) {
    return `明天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getGameStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    scheduled: '未开始',
    live: '进行中',
    completed: '已结束',
    postponed: '延期',
    cancelled: '取消',
  };
  return statusMap[status] || status;
};

export const getGameStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    scheduled: 'bg-gray-100 text-gray-600',
    live: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    postponed: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-600';
};

export const GameCard: React.FC<GameCardProps> = ({ game, index = 0 }) => {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow"
      data-testid="game-card"
    >
      {/* Header: Date and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} className="text-mlb-navy" />
          <span className="text-sm font-medium">
            {formatGameDate(game.scheduled_at)}
          </span>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getGameStatusColor(game.status)}`}
          data-testid="game-status"
        >
          {getGameStatusText(game.status)}
        </span>
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mlb-navy/10 flex items-center justify-center">
              <Shield size={20} className="text-mlb-navy" />
            </div>
            <span className="font-semibold text-gray-900">{game.home_team_name}</span>
          </div>
          {game.home_score !== null && game.home_score !== undefined && (
            <span className="text-xl font-bold text-mlb-navy" data-testid="home-score">
              {game.home_score}
            </span>
          )}
        </div>

        {/* Divider with VS */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">VS</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Shield size={20} className="text-gray-500" />
            </div>
            <span className="font-semibold text-gray-900">{game.away_team_name}</span>
          </div>
          {game.away_score !== null && game.away_score !== undefined && (
            <span className="text-xl font-bold text-gray-700" data-testid="away-score">
              {game.away_score}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Location */}
      <div className="flex items-center gap-2 text-gray-500 pt-3 border-t border-gray-100">
        <MapPin size={14} />
        <span className="text-xs truncate">{game.location}</span>
      </div>
    </motion.div>
  );
};

export default GameCard;
