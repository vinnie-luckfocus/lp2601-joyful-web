import { Crown } from 'lucide-react';
import { SkeletonCard } from '../common/Skeleton';
import { ErrorState } from '../common/ErrorState';
import { useTeamMembers } from '../../hooks/useTeamMembers';

interface MemberGridProps {
  teamId: number;
  captainId: number | null;
}

const DEFAULT_AVATAR = 'https://placehold.co/56x56/e5e7eb/9ca3af?text=?';

export const MemberGrid: React.FC<MemberGridProps> = ({ teamId, captainId }) => {
  const { members, isLoading, error, refetch } = useTeamMembers(teamId);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#041E42] mb-4">球队成员</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} rows={2} className="!p-4" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#041E42] mb-4">球队成员</h2>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#041E42] mb-4">球队成员</h2>
      {members.length === 0 ? (
        <p className="text-gray-500">暂无成员</p>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          data-testid="member-grid"
        >
          {members.map((member, index) => {
            const isCaptain = member.id === captainId;
            return (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{
                  animation: `fadeInUp 0.3s ease forwards`,
                  animationDelay: `${index * 30}ms`,
                  opacity: 0,
                }}
              >
                <div className="relative mb-3">
                  <img
                    src={member.avatar_url || DEFAULT_AVATAR}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover bg-gray-100"
                    loading="lazy"
                  />
                  {isCaptain && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#C4A35A' }}
                      title="队长"
                    >
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white animate-pulse-dot"
                    style={{ backgroundColor: '#2D8659' }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  #{member.jersey_number ?? '-'} · {member.position ?? '未知位置'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberGrid;
