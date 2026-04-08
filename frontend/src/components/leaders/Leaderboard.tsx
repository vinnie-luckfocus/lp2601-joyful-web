import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { useLeaders, type LeaderCategory, type Leader } from '../../hooks/useLeaders';
import { CountUp } from './CountUp';
import { DataFreshnessIndicator } from '../common/DataFreshnessIndicator';
import { ErrorState } from '../common/ErrorState';
import { Skeleton } from '../common/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const CATEGORY_CONFIG: Record<LeaderCategory, { label: string; decimals: number; suffix: string }> = {
  batting_average: { label: '打击率', decimals: 3, suffix: '' },
  hits: { label: '安打', decimals: 0, suffix: '' },
  home_runs: { label: '本垒打', decimals: 0, suffix: '' },
  rbis: { label: '打点', decimals: 0, suffix: '' },
};

const TABS: { key: LeaderCategory; label: string }[] = [
  { key: 'batting_average', label: '打击率' },
  { key: 'hits', label: '安打' },
  { key: 'home_runs', label: '本垒打' },
  { key: 'rbis', label: '打点' },
];

interface LeaderboardRowProps {
  leader: Leader;
  rank: number;
  category: LeaderCategory;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ leader, rank, category }) => {
  const config = CATEGORY_CONFIG[category];
  const isTop3 = rank <= 3;

  const rankStyles = {
    1: 'bg-[#C4A35A] text-white',
    2: 'bg-[#C4A35A]/80 text-white',
    3: 'bg-[#C4A35A]/60 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.05 }}
      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
        isTop3 ? 'bg-gradient-to-r from-[#C4A35A]/5 to-transparent' : ''
      }`}
      data-testid={`leader-row-${rank}`}
    >
      {/* Rank Badge */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          isTop3 ? rankStyles[rank as 1 | 2 | 3] : 'bg-gray-100 text-gray-600'
        }`}
        data-testid={`rank-badge-${rank}`}
      >
        {rank}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <a
          href={`/players/${leader.user_id}`}
          className="text-[#3182CE] font-medium hover:underline truncate block"
          data-testid={`player-link-${rank}`}
        >
          {leader.player_name}
        </a>
        <span className="text-sm text-gray-500 truncate block">
          {leader.team_name || '自由球员'}
        </span>
      </div>

      {/* Value */}
      <div className="text-right">
        <div className={`font-bold text-lg ${isTop3 ? 'text-[#C4A35A]' : 'text-gray-800'}`}>
          <CountUp
            value={leader.value}
            decimals={config.decimals}
            duration={0.8}
          />
        </div>
      </div>
    </motion.div>
  );
};

interface LeaderboardProps {
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ className = '' }) => {
  const [activeCategory, setActiveCategory] = useState<LeaderCategory>('batting_average');
  const { leaders, isLoading, error, refetch } = useLeaders(activeCategory, 10);

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <ErrorState
            title="加载失败"
            message="无法加载排行榜数据"
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="leaderboard">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#C4A35A]" />
            数据排行榜
          </CardTitle>
          <a
            href="/stats"
            className="text-sm text-[#3182CE] hover:underline flex items-center gap-1"
            data-testid="view-all-link"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </CardHeader>

      {/* Tabs */}
      <div className="px-4 border-b border-gray-100">
        <div className="flex gap-1" role="tablist" data-testid="category-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeCategory === tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                activeCategory === tab.key
                  ? 'text-[#3182CE]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid={`tab-${tab.key}`}
            >
              {tab.label}
              {activeCategory === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182CE]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3" data-testid="leaderboard-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width={32} height={32} borderRadius={16} />
                <div className="flex-1">
                  <Skeleton width="60%" height={16} className="mb-1" />
                  <Skeleton width="40%" height={14} />
                </div>
                <Skeleton width={50} height={24} />
              </div>
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-8 text-center text-gray-500" data-testid="empty-state">
            暂无数据
          </div>
        ) : (
          <div className="py-2">
            {leaders.map((leader, index) => (
              <LeaderboardRow
                key={leader.user_id}
                leader={leader}
                rank={index + 1}
                category={activeCategory}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <DataFreshnessIndicator
          lastUpdated={new Date()}
          className="text-xs"
        />
      </div>
    </Card>
  );
};

export default Leaderboard;
