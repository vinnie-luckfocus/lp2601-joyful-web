interface MilestoneCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  className?: string;
}

export function MilestoneCard({ title, current, target, unit, className = '' }: MilestoneCardProps) {
  const progress = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-400">{current} / {target} {unit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#BF0D3E] to-[#041E42] transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-xs text-gray-500 mt-2">还差 {remaining} {unit}</p>
      )}
      {remaining === 0 && (
        <p className="text-xs text-[#C4A35A] font-medium mt-2">已达成！</p>
      )}
    </div>
  );
}

export default MilestoneCard;
