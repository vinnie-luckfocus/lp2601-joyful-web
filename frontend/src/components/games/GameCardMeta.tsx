import { Calendar } from 'lucide-react';
import type { Game } from '../../hooks/usePublicGames';

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

export interface GameCardMetaProps {
  game: Game;
}

export const GameCardMeta: React.FC<GameCardMetaProps> = ({ game }) => {
  return (
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
  );
};
