import { motion } from 'framer-motion';
import type { Game } from '../../hooks/usePublicGames';
import { GameCardMeta } from './GameCardMeta';
import { GameCardTeams } from './GameCardTeams';
import { GameCardFooter } from './GameCardFooter';

export interface GameCardProps {
  game: Game;
  index?: number;
}

export { formatGameDate, getGameStatusText, getGameStatusColor } from './GameCardMeta';

export const GameCard: React.FC<GameCardProps> = ({ game, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ willChange: 'transform' }}
      data-testid="game-card"
      className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md"
    >
      <GameCardMeta game={game} />
      <GameCardTeams game={game} />
      <GameCardFooter location={game.location} />
    </motion.div>
  );
};

export default GameCard;
