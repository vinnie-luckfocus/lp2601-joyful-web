import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { SEO } from '../components/seo';
import { ErrorState } from '../components/common/ErrorState';
import { Skeleton } from '../components/common/Skeleton';
import { ScheduleGameCard } from '../components/games/ScheduleGameCard';
import { useGames } from '../hooks/useGames';
import { useAttendance, Attendance } from '../hooks/useAttendance';
import { useAuthStore } from '../stores/auth';
import type { Game } from '../hooks/usePublicGames';

const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

const getGameMonth = (scheduledAt: string): number => {
  return new Date(scheduledAt).getMonth();
};

const getGameDay = (scheduledAt: string): number => {
  return new Date(scheduledAt).getDate();
};

const getGameWeekday = (scheduledAt: string): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[new Date(scheduledAt).getDay()];
};

const getGameTime = (scheduledAt: string): string => {
  return new Date(scheduledAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

interface TimelineItemProps {
  gameId: number;
  scheduledAt: string;
  index: number;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ gameId, scheduledAt, index }) => {
  const { games } = useGames();
  const game = useMemo(() => games.find((g) => g.id === gameId), [games, gameId]);

  if (!game) return null;

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-end w-16 pt-1 shrink-0">
        <span className="text-xl font-bold text-mlb-navy">{getGameDay(scheduledAt)}</span>
        <span className="text-xs text-gray-500">{getGameWeekday(scheduledAt)}</span>
        <span className="text-xs text-gray-400 mt-0.5">{getGameTime(scheduledAt)}</span>
      </div>
      <div className="relative flex flex-col items-center pt-2">
        <div className="w-3 h-3 rounded-full bg-mlb-navy" />
        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
      </div>
      <div className="flex-1 pb-6">
        <ScheduleGameCardWithAttendance game={game} index={index} />
      </div>
    </div>
  );
};

interface ScheduleGameCardWithAttendanceProps {
  game: { id: number; scheduled_at: string; location: string; home_team_name: string; away_team_name: string; home_score: number | null; away_score: number | null; status: string };
  index: number;
}

const ScheduleGameCardWithAttendance: React.FC<ScheduleGameCardWithAttendanceProps> = ({ game, index }) => {
  const { isAuthenticated } = useAuthStore();
  const { attendance } = useAttendance(game.id);

  return (
    <ScheduleGameCard
      game={game as Game}
      myStatus={isAuthenticated ? (attendance?.status ?? null) : null}
      confirmedCount={isAuthenticated ? (attendance?.confirmedCount ?? 0) : 0}
      index={index}
    />
  );
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const GameSchedulePage: React.FC = () => {
  const { games, isLoading, error, refetch } = useGames();
  const { logout, user, isAuthenticated } = useAuthStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    games.forEach((game) => months.add(getGameMonth(game.scheduled_at)));
    return Array.from(months).sort((a, b) => a - b);
  }, [games]);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  useMemo(() => {
    if (availableMonths.length > 0 && currentMonthIndex >= availableMonths.length) {
      setCurrentMonthIndex(availableMonths.length - 1);
    }
  }, [availableMonths, currentMonthIndex]);

  const currentMonth = availableMonths[currentMonthIndex] ?? new Date().getMonth();

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => getGameMonth(game.scheduled_at) === currentMonth)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [games, currentMonth]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => Math.min(availableMonths.length - 1, prev + 1));
  }, [availableMonths.length]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F7FA' }}>
      <SEO title="赛程安排" description="查看举父棒球联赛的全部赛程安排" />

      <Navbar
        isLoggedIn={isAuthenticated}
        userName={user?.name}
        onLogout={logout}
        onLoginClick={() => setLoginModalOpen(true)}
      />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-mlb-navy">赛程安排</h1>

            {availableMonths.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={currentMonthIndex === 0}
                  className="p-2 rounded-full bg-white shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed transition-shadow"
                  aria-label="上个月"
                >
                  <ChevronLeft size={20} className="text-mlb-navy" />
                </button>
                <span className="text-lg font-semibold text-gray-800 min-w-[4rem] text-center">
                  {MONTH_NAMES[currentMonth]}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={currentMonthIndex === availableMonths.length - 1}
                  className="p-2 rounded-full bg-white shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed transition-shadow"
                  aria-label="下个月"
                >
                  <ChevronRight size={20} className="text-mlb-navy" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-16 shrink-0 pt-1 space-y-2">
                    <Skeleton width="70%" height="24px" borderRadius="4px" className="bg-[#041E42]/20" />
                    <Skeleton width="50%" height="14px" borderRadius="4px" className="bg-[#041E42]/20" />
                  </div>
                  <div className="relative flex flex-col items-center pt-2">
                    <Skeleton width="12px" height="12px" borderRadius="9999px" className="bg-[#041E42]/20" />
                    <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                      <Skeleton width="60%" height="20px" borderRadius="4px" className="bg-[#041E42]/20" />
                      <Skeleton width="100%" height="16px" borderRadius="4px" className="bg-[#041E42]/20" />
                      <Skeleton width="80%" height="16px" borderRadius="4px" className="bg-[#041E42]/20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="加载失败"
              message={error.message}
              onRetry={refetch}
              retryLabel="重新加载"
            />
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500">该月份暂无赛程</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMonth}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative"
              >
                {filteredGames.map((game, index) => (
                  <motion.div key={game.id} variants={itemVariants}>
                    <TimelineItem gameId={game.id} scheduledAt={game.scheduled_at} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GameSchedulePage;
