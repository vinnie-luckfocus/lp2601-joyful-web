import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Shield, Check, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { SEO } from '../components/seo';
import { ErrorState } from '../components/common/ErrorState';
import { Skeleton } from '../components/common/Skeleton';
import { AttendanceButtons } from '../components/games/AttendanceButtons';
import { useAttendance, AttendanceStatus } from '../hooks/useAttendance';
import { useAuthStore } from '../stores/auth';
import api from '../utils/axios';
import type { Game } from '../hooks/usePublicGames';

interface GameWithMyStatus extends Game {
  my_status?: AttendanceStatus;
}

const getInitials = (name: string): string => {
  return name ? name.charAt(0) : '?';
};

const getGameStatusText = (status: string): string => {
  const map: Record<string, string> = {
    scheduled: '未开始',
    live: '进行中',
    completed: '已结束',
    postponed: '延期',
    cancelled: '取消',
  };
  return map[status] || status;
};

const getGameStatusBadgeStyle = (status: string): React.CSSProperties => {
  const colors: Record<string, { background: string; color: string }> = {
    scheduled: { background: '#041E42', color: '#FFFFFF' },
    live: { background: '#2D8659', color: '#FFFFFF' },
    completed: { background: '#A0AEC0', color: '#FFFFFF' },
    postponed: { background: '#E67E22', color: '#FFFFFF' },
    cancelled: { background: '#DC2626', color: '#FFFFFF' },
  };
  return colors[status] || { background: '#041E42', color: '#FFFFFF' };
};

const formatGameDateTime = (scheduledAt: string): string => {
  const date = new Date(scheduledAt);
  return date.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface AttendeeAvatarProps {
  name: string;
  index: number;
}

const AttendeeAvatar: React.FC<AttendeeAvatarProps> = ({ name, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs font-medium flex items-center justify-center border-2 border-white shrink-0"
      title={name}
    >
      {getInitials(name)}
    </motion.div>
  );
};

interface AttendanceSectionProps {
  label: string;
  accentColor: string;
  users: { id: string; name: string }[];
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({ label, accentColor, users }) => {
  const visible = users.slice(0, 5);
  const overflow = users.length > 5 ? users.length - 5 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">({users.length})</span>
      </div>
      <div className="flex items-center gap-1 min-h-[2.5rem]">
        {users.length === 0 ? (
          <span className="text-sm text-gray-400">暂无</span>
        ) : (
          <>
            {visible.map((user, index) => (
              <div key={user.id} className="flex flex-col items-center gap-0.5">
                <AttendeeAvatar name={user.name} index={index} />
                <span className="text-[10px] text-gray-500 truncate max-w-[2rem]">{user.name}</span>
              </div>
            ))}
            {overflow > 0 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center border-2 border-white shrink-0">
                +{overflow}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);
  const { user, isAuthenticated, logout } = useAuthStore();

  const [game, setGame] = useState<GameWithMyStatus | null>(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState<Error | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const {
    attendance,
    isLoading: attendanceLoading,
    error: attendanceError,
    updateAttendance,
    refetch: refetchAttendance,
  } = useAttendance(gameId);

  useEffect(() => {
    const fetchGame = async () => {
      setGameLoading(true);
      setGameError(null);
      try {
        const response = await api.get<{ success: boolean; data?: GameWithMyStatus }>(`/games/${gameId}`);
        if (response.data.success && response.data.data) {
          setGame(response.data.data);
        } else {
          throw new Error('Failed to fetch game');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred while fetching game';
        setGameError(new Error(message));
      } finally {
        setGameLoading(false);
      }
    };

    if (!Number.isNaN(gameId)) {
      fetchGame();
    }
  }, [gameId]);

  const handleUpdate = async (status: 'confirmed' | 'declined') => {
    setAlertMessage(null);
    try {
      await updateAttendance(status);
      if (status === 'confirmed') {
        setShowSuccess(true);
        setShake(true);
        setTimeout(() => setShake(false), 300);
        setTimeout(() => setShowSuccess(false), 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败，请重试';
      setAlertMessage(message);
    }
  };

  const statusBadgeStyle = useMemo(() => (game ? getGameStatusBadgeStyle(game.status) : undefined), [game]);

  const isLoading = gameLoading || attendanceLoading;
  const error = gameError || attendanceError;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F7FA' }}>
      <SEO title={game ? `${game.home_team_name} VS ${game.away_team_name}` : '比赛详情'} />

      <Navbar isLoggedIn={isAuthenticated} userName={user?.name} onLogout={logout} />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && !game ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <Skeleton width="40%" height="20px" borderRadius="4px" />
              <Skeleton width="60%" height="16px" borderRadius="4px" />
              <Skeleton width="100%" height="80px" borderRadius="8px" />
              <Skeleton width="100%" height="120px" borderRadius="8px" />
            </div>
          ) : error ? (
            <ErrorState title="加载失败" message={error.message} onRetry={() => window.location.reload()} retryLabel="刷新页面" />
          ) : game ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              {/* Header: Date + Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={18} className="text-mlb-navy" />
                  <span className="text-sm font-medium">{formatGameDateTime(game.scheduled_at)}</span>
                </div>
                {statusBadgeStyle && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: statusBadgeStyle.background, color: statusBadgeStyle.color }}
                    data-testid="game-status-badge"
                  >
                    {getGameStatusText(game.status)}
                  </span>
                )}
              </div>

              {/* Teams */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-mlb-navy/10 flex items-center justify-center">
                      <Shield size={24} className="text-mlb-navy" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{game.home_team_name}</span>
                  </div>
                  {game.home_score !== null && game.home_score !== undefined && (
                    <span className="text-2xl font-bold text-mlb-navy">{game.home_score}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">VS</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Shield size={24} className="text-gray-500" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{game.away_team_name}</span>
                  </div>
                  {game.away_score !== null && game.away_score !== undefined && (
                    <span className="text-2xl font-bold text-gray-700">{game.away_score}</span>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-6 pb-6 border-b border-gray-100">
                <MapPin size={18} className="text-gray-400" />
                <span className="text-sm">{game.location}</span>
              </div>

              {/* Attendance Sections */}
              <div className="space-y-5 mb-6">
                <AttendanceSection
                  label="已确认"
                  accentColor="#2D8659"
                  users={attendance?.confirmed || []}
                />
                <AttendanceSection
                  label="未回复"
                  accentColor="#A0AEC0"
                  users={attendance?.pending || []}
                />
                <AttendanceSection
                  label="不参加"
                  accentColor="#CBD5E0"
                  users={attendance?.declined || []}
                />
              </div>

              {/* Success Animation */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="flex items-center justify-center gap-2 mb-4 text-success"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={18} />
                    </div>
                    <span className="text-sm font-medium">报名成功</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Alert */}
              <AnimatePresence>
                {alertMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{alertMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons with Shake */}
              <motion.div animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.3 }}>
                <AttendanceButtons
                  myStatus={attendance?.status ?? game.my_status ?? null}
                  onConfirm={() => handleUpdate('confirmed')}
                  onDecline={() => handleUpdate('declined')}
                  isLoading={attendanceLoading}
                />
              </motion.div>
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500">比赛未找到</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GameDetailPage;
