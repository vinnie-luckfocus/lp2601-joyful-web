import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { SEO } from '../components/seo';
import { ErrorState } from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { Leaderboard } from '../components/leaders';
import { StatCard } from '../components/stats/StatCard';
import { TrendChart } from '../components/stats/TrendChart';
import { RadarAbilityChart } from '../components/stats/RadarAbilityChart';
import { MilestoneCard } from '../components/stats/MilestoneCard';
import { useStats } from '../hooks/useStats';
import { useAuthStore } from '../stores/auth';

function PlayerStatsPage() {
  const { stats, isLoading, error, refetch } = useStats();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Navbar isLoggedIn={isAuthenticated} userName={user?.name} onLogout={logout} />
        <main className="flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4 space-y-6">
            <SkeletonCard rows={2} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} rows={1} />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard rows={3} />
              <SkeletonCard rows={3} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Navbar isLoggedIn={isAuthenticated} userName={user?.name} onLogout={logout} />
        <main className="flex-1 flex items-center justify-center px-4">
          <ErrorState
            title="加载失败"
            message={error?.message || '无法获取统计数据'}
            onRetry={refetch}
            retryLabel="重新加载"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const { cumulative, recent_5_games, milestones } = stats;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <SEO title="个人数据" />
      <Navbar isLoggedIn={isAuthenticated} userName={user?.name} onLogout={logout} />

      <main className="flex-1 py-6 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div
            className="bg-[#041E42] rounded-2xl p-6 md:p-8 text-white mb-6 md:mb-8"
            style={{ animation: 'fadeInUp 0.5s ease-out both' }}
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center text-[#041E42] font-bold text-xl md:text-2xl">
                {stats.user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{stats.user.name}</h1>
                <p className="text-white/70 text-sm md:text-base mt-1">
                  {stats.user.team || '自由球员'} · #{stats.user.jersey_number || '-'} · {stats.user.position || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Cumulative Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatCard label="出赛场次" value={cumulative.games} delay={0} />
            <StatCard label="打席" value={cumulative.at_bats} delay={60} />
            <StatCard label="安打" value={cumulative.hits} delay={120} />
            <StatCard label="打击率" value={cumulative.batting_avg.toFixed(3)} highlight delay={180} />
            <StatCard label="一垒打" value={cumulative.singles} delay={240} />
            <StatCard label="二垒打" value={cumulative.doubles} delay={300} />
            <StatCard label="本垒打" value={cumulative.hr} delay={360} />
            <StatCard label="打点" value={cumulative.rbi} delay={420} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-3">
              <TrendChart data={recent_5_games} className="h-full" />
            </div>
            <div className="lg:col-span-2">
              <RadarAbilityChart
                data={{
                  batting_avg: cumulative.batting_avg,
                  hits: cumulative.hits,
                  hr: cumulative.hr,
                  rbi: cumulative.rbi,
                  runs: cumulative.runs,
                }}
                className="h-full"
              />
            </div>
          </div>

          {/* Milestones & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-1 space-y-4">
              {milestones.hits_to_100 !== null && (
                <MilestoneCard
                  title="100安打里程碑"
                  current={cumulative.hits}
                  target={100}
                  unit="安打"
                />
              )}
              <MilestoneCard
                title="50安打里程碑"
                current={cumulative.hits}
                target={50}
                unit="安打"
              />
            </div>
            <div className="lg:col-span-2">
              <Leaderboard />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PlayerStatsPage;
