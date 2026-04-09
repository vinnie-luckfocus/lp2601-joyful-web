import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import type { Game } from '../../hooks/usePublicGames';
import { GameCardMeta } from './GameCardMeta';
import { GameCardTeams } from './GameCardTeams';

export interface ScheduleGameCardProps {
  game: Game;
  myStatus: 'confirmed' | 'declined' | null;
  confirmedCount: number;
  index?: number;
  href?: string;
}

const CardContent: React.FC<{
  game: Game;
  myStatus: 'confirmed' | 'declined' | null;
  confirmedCount: number;
}> = ({ game, myStatus, confirmedCount }) => {
  const isConfirmed = myStatus === 'confirmed';
  return (
    <>
      <GameCardMeta game={game} />
      <GameCardTeams game={game} />

      {/* Footer: Attendance + Location */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin size={14} />
          <span className="text-xs truncate">{game.location}</span>
        </div>
        <div className="flex items-center gap-2">
          {isConfirmed && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-mlb-red/10 text-mlb-red"
              data-testid="signup-status-badge"
            >
              已报名
            </span>
          )}
          <div
            className="flex items-center gap-1 text-xs text-gray-500"
            data-testid="attendee-count"
          >
            <Users size={14} />
            <span>{confirmedCount}人已报名</span>
          </div>
        </div>
      </div>
    </>
  );
};

export const ScheduleGameCard: React.FC<ScheduleGameCardProps> = ({
  game,
  myStatus,
  confirmedCount,
  index = 0,
  href,
}) => {
  const isConfirmed = myStatus === 'confirmed';
  const cardStyle = isConfirmed
    ? { willChange: 'transform' as const, backgroundColor: '#FFFFFF' as const, borderLeftColor: '#BF0D3E' as const, borderLeftWidth: '4px' as const }
    : { willChange: 'transform' as const, backgroundColor: '#FFFFFF' as const };

  return href ? (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={cardStyle}
      data-testid="schedule-game-card"
      className={`block bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md cursor-pointer ${
        isConfirmed ? 'border-l-4' : ''
      }`}
    >
      <CardContent game={game} myStatus={myStatus} confirmedCount={confirmedCount} />
    </motion.a>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={cardStyle}
      data-testid="schedule-game-card"
      className={`bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md ${
        isConfirmed ? 'border-l-4' : ''
      }`}
    >
      <CardContent game={game} myStatus={myStatus} confirmedCount={confirmedCount} />
    </motion.div>
  );
};

export default ScheduleGameCard;
