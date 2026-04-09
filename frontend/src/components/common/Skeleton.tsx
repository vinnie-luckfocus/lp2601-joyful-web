import type { CSSProperties } from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '4px',
  className = '',
}) => {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${className}`}
      style={style}
      data-testid="skeleton"
    />
  );
};

export interface SkeletonCardProps {
  rows?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-card shadow-card p-6 ${className}`} data-testid="skeleton-card">
      <Skeleton width="60%" height="24px" borderRadius="4px" className="mb-4" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === rows - 1 ? '80%' : '100%'}
          height="16px"
          borderRadius="4px"
          className="mb-3"
        />
      ))}
    </div>
  );
};

export interface SkeletonTableProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  columns = 4,
  rows = 5,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-card shadow-card overflow-hidden ${className}`} data-testid="skeleton-table">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              width={`${100 / columns}%`}
              height="20px"
              borderRadius="4px"
            />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="px-6 py-4 border-b border-gray-100 last:border-b-0"
        >
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                width={`${100 / columns}%`}
                height="16px"
                borderRadius="4px"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
