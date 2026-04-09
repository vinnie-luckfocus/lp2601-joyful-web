import { Shield } from 'lucide-react';
import type { Game } from '../../hooks/usePublicGames';

export interface GameCardTeamsProps {
  game: Game;
}

export const GameCardTeams: React.FC<GameCardTeamsProps> = ({ game }) => {
  return (
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
  );
};
