import { Trophy } from 'lucide-react';
import { useStandings, Standing } from '../../hooks/useStandings';
import { DataFreshnessIndicator } from '../common/DataFreshnessIndicator';
import { ErrorState } from '../common/ErrorState';
import { SkeletonTable } from '../common/Skeleton';

export interface StandingsTableProps {
  className?: string;
  ariaLabel?: string;
}

export interface RankBadgeProps {
  rank: number;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  const isTopThree = rank <= 3;

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
        isTopThree
          ? 'bg-[#C4A35A] text-white'
          : 'bg-gray-100 text-gray-700'
      }`}
      data-testid={`rank-badge-${rank}`}
      aria-label={`排名 ${rank}${isTopThree ? ' (前三名)' : ''}`}
    >
      {rank}
    </span>
  );
};

export interface WinRateBarProps {
  winRate: number;
}

export const WinRateBar: React.FC<WinRateBarProps> = ({ winRate }) => {
  const rate = Number(winRate);
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-900 w-12" aria-label={`胜率 ${rate.toFixed(1)}%`}>
        {rate.toFixed(1)}%
      </span>
      <div
        className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]"
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`胜率进度 ${rate.toFixed(0)}%`}
      >
        <div
          className="h-full bg-[#041E42] rounded-full transition-all duration-300"
          style={{ width: `${rate}%` }}
          data-testid="win-rate-bar"
        />
      </div>
    </div>
  );
};

export interface TableRowProps {
  standing: Standing & { rank: number };
}

export const TableRow: React.FC<TableRowProps> = ({ standing }) => {
  return (
    <tr
      className="hover:bg-gray-50 transition-colors"
      data-testid={`standing-row-${standing.id}`}
      tabIndex={0}
      aria-label={`${standing.name}, 排名 ${standing.rank}, 胜 ${standing.wins} 负 ${standing.losses}, 胜率 ${Number(standing.win_percentage).toFixed(1)}%`}
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <RankBadge rank={standing.rank} />
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{standing.name}</span>
          {standing.division && (
            <span className="text-xs text-gray-500">{standing.division}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {standing.wins}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {standing.losses}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <WinRateBar winRate={standing.win_percentage} />
      </td>
    </tr>
  );
};

export interface EmptyStateProps {
  onRefresh?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4" role="status" aria-live="polite">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4" aria-hidden="true">
        <Trophy className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        暂无积分榜数据
      </h3>
      <p className="text-gray-500 mb-4 text-center">
        目前还没有球队战绩数据，请稍后再来查看
      </p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-[#041E42] text-white rounded-lg hover:bg-[#0a2a5c] transition-colors focus:outline-none focus:ring-2 focus:ring-mlb-navy focus:ring-offset-2"
          aria-label="刷新积分榜数据"
        >
          刷新数据
        </button>
      )}
    </div>
  );
};

export const StandingsTable: React.FC<StandingsTableProps> = ({
  className = '',
  ariaLabel = '球队积分榜',
}) => {
  const { standings, isLoading, error, lastUpdated, refetch } = useStandings();

  if (isLoading) {
    return (
      <div className={`bg-white rounded-card shadow-card overflow-hidden ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <SkeletonTable columns={5} rows={1} />
        </div>
        <SkeletonTable columns={5} rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-card shadow-card overflow-hidden ${className}`}>
        <ErrorState
          title="加载失败"
          message={error.message || '无法加载积分榜数据'}
          onRetry={refetch}
          retryLabel="重新加载"
        />
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className={`bg-white rounded-card shadow-card overflow-hidden ${className}`}>
        <EmptyState onRefresh={refetch} />
      </div>
    );
  }

  // Add rank to standings (already sorted by API by win_percentage)
  const standingsWithRank = standings.map((standing, index) => ({
    ...standing,
    rank: index + 1,
  }));

  return (
    <div className={`bg-white rounded-card shadow-card overflow-hidden ${className}`}>
      {/* Header with title and freshness indicator */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900">积分榜</h2>
        {lastUpdated && (
          <DataFreshnessIndicator lastUpdated={lastUpdated} />
        )}
      </div>

      {/* Responsive table container */}
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[600px]"
          aria-label={ariaLabel}
        >
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
              >
                排名
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                球队
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                胜
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                负
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                胜率
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {standingsWithRank.map((standing) => (
              <TableRow key={standing.id} standing={standing} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTable;
