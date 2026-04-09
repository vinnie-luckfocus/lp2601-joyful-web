import { useState, useMemo } from 'react';
import type { LineupPlayer } from '../../hooks/useLineup';

interface PositionDef {
  key: string;
  label: string;
  x: number;
  y: number;
}

const positions: PositionDef[] = [
  { key: 'P', label: '投手', x: 50, y: 62 },
  { key: 'C', label: '捕手', x: 50, y: 86 },
  { key: '1B', label: '一垒手', x: 72, y: 42 },
  { key: '2B', label: '二垒手', x: 62, y: 32 },
  { key: '3B', label: '三垒手', x: 28, y: 42 },
  { key: 'SS', label: '游击手', x: 38, y: 32 },
  { key: 'LF', label: '左外野', x: 20, y: 18 },
  { key: 'CF', label: '中外野', x: 50, y: 10 },
  { key: 'RF', label: '右外野', x: 80, y: 18 },
];

const positionMap: Record<string, string> = {
  投手: 'P',
  捕手: 'C',
  一垒手: '1B',
  二垒手: '2B',
  三垒手: '3B',
  游击手: 'SS',
  左外野: 'LF',
  中外野: 'CF',
  右外野: 'RF',
};

interface FieldDiagramProps {
  lineup: LineupPlayer[];
  onPositionClick?: (position: PositionDef, player?: LineupPlayer) => void;
  className?: string;
}

export function FieldDiagram({ lineup, onPositionClick, className = '' }: FieldDiagramProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const playerByPosition = useMemo(() => {
    const map = new Map<string, LineupPlayer>();
    for (const player of lineup) {
      const posKey = positionMap[player.position];
      if (posKey) {
        map.set(posKey, player);
      }
    }
    return map;
  }, [lineup]);

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox="0 0 100 90"
        className="w-full h-auto"
        style={{ display: 'block' }}
        aria-label="棒球场防守位置图"
      >
        {/* Outfield grass */}
        <path
          d="M5,35 Q50,0 95,35 L85,55 Q50,25 15,55 Z"
          fill="#2D8659"
        />

        {/* Infield dirt */}
        <path
          d="M20,55 L50,88 L80,55 L50,35 Z"
          fill="#8B4513"
        />

        {/* Home plate */}
        <polygon
          points="47,82 53,82 55,86 50,90 45,86"
          fill="#FFFFFF"
        />

        {/* Bases */}
        <rect x="18" y="52" width="4" height="4" fill="#FFFFFF" />
        <rect x="48" y="33" width="4" height="4" fill="#FFFFFF" />
        <rect x="78" y="52" width="4" height="4" fill="#FFFFFF" />

        {/* Foul lines */}
        <line x1="20" y1="55" x2="5" y2="35" stroke="#FFFFFF" strokeWidth="0.5" />
        <line x1="80" y1="55" x2="95" y2="35" stroke="#FFFFFF" strokeWidth="0.5" />

        {/* Position markers */}
        {positions.map((pos, index) => {
          const player = playerByPosition.get(pos.key);
          const isHovered = hoveredKey === pos.key;
          const fill = isHovered ? '#BF0D3E' : '#FFFFFF';
          const stroke = '#BF0D3E';
          const textFill = isHovered ? '#FFFFFF' : '#041E42';

          return (
            <g
              key={pos.key}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer"
              style={{
                animation: `fieldMarkerPopIn 0.4s ease-out ${index * 80}ms both`,
              }}
              onMouseEnter={() => setHoveredKey(pos.key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => onPositionClick?.(pos, player)}
            >
              <circle
                r="5"
                fill={fill}
                stroke={stroke}
                strokeWidth="0.8"
                style={{ transition: 'fill 200ms ease' }}
              />
              <text
                y="1.5"
                textAnchor="middle"
                fontSize="3.5"
                fontWeight="600"
                fill={textFill}
                style={{ transition: 'fill 200ms ease', pointerEvents: 'none' }}
              >
                {pos.key}
              </text>
              {player && (
                <text
                  y="8"
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#FFFFFF"
                  fontWeight="500"
                  style={{ pointerEvents: 'none' }}
                >
                  {player.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default FieldDiagram;
