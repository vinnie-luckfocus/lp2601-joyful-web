import type { LineupPlayer } from '../../hooks/useLineup';

interface LineupListProps {
  lineup: LineupPlayer[];
  currentUserId?: string;
  onRowClick?: (player: LineupPlayer) => void;
  className?: string;
}

export function LineupList({ lineup, currentUserId, onRowClick, className = '' }: LineupListProps) {
  const sortedLineup = [...lineup].sort((a, b) => a.batting_order - b.batting_order);

  return (
    <div className={`bg-[#041E42] rounded-xl overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-base"> batting 顺序</h3>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {sortedLineup.map((player, index) => {
          const isCurrentUser = player.user_id === currentUserId;
          return (
            <div
              id={`lineup-row-${player.user_id}`}
              key={player.user_id}
              onClick={() => onRowClick?.(player)}
              className={`
                flex items-center px-4 py-3 border-b border-white/5 cursor-pointer
                transition-colors duration-200
                ${isCurrentUser ? 'bg-[#BF0D3E]' : 'hover:bg-white/5'}
              `}
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 60}ms both${isCurrentUser ? `, lineupRowPulse 2s ease-in-out infinite ${index * 60 + 500}ms` : ''}`,
              }}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3
                  ${isCurrentUser ? 'bg-white text-[#BF0D3E]' : 'bg-white/10 text-white'}
                `}
              >
                {player.batting_order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-white">
                  {player.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs opacity-90">(我)</span>
                  )}
                </div>
                <div className="text-xs text-white/70">
                  #{player.jersey_number} · {player.position}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LineupList;
