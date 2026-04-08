import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface DataFreshnessIndicatorProps {
  lastUpdated: Date | string | number;
  className?: string;
  showIcon?: boolean;
}

export const formatTimeAgo = (timestamp: Date | string | number): string => {
  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return '刚刚更新';
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前更新`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前更新`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前更新`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前更新`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前更新`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前更新`;
};

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdated,
  className = '',
  showIcon = true,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>(() =>
    formatTimeAgo(lastUpdated)
  );

  useEffect(() => {
    // Update immediately
    setTimeAgo(formatTimeAgo(lastUpdated));

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(lastUpdated));
    }, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm text-gray-500 ${className}`}
      data-testid="data-freshness-indicator"
    >
      {showIcon && <Clock size={14} />}
      <span>{timeAgo}</span>
    </span>
  );
};

export default DataFreshnessIndicator;
