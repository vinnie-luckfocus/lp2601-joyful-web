import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { SEO } from '../components/seo';
import { ErrorState } from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { FieldDiagram, LineupList, TacticsPanel } from '../components/tactics';
import { useLineup } from '../hooks/useLineup';
import { useAuthStore } from '../stores/auth';

function TacticsBoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useLineup(id);
  const currentUser = useAuthStore((state) => state.user);

  const handlePositionClick = (_position: { key: string; label: string }, player?: { user_id: string }) => {
    if (!player) return;
    const row = document.getElementById(`lineup-row-${player.user_id}`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.style.animation = 'none';
      row.offsetHeight;
      row.style.animation = 'lineupRowPulse 1s ease';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard rows={5} className="h-full" />
            </div>
            <div className="lg:col-span-3">
              <SkeletonCard rows={4} className="h-full" />
            </div>
          </div>
          <div className="mt-6">
            <SkeletonCard rows={3} />
          </div>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <ErrorState
            title="加载失败"
            message={error?.message || '无法获取战术板数据'}
            onRetry={refetch}
            retryLabel="重新加载"
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-2 order-1">
            <LineupList
              lineup={data.lineup}
              currentUserId={currentUser?.id?.toString()}
              className="h-full"
            />
          </div>
          <div className="lg:col-span-3 order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 h-full">
              <FieldDiagram
                lineup={data.lineup}
                onPositionClick={handlePositionClick}
                className="max-w-md mx-auto"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 order-3">
          <TacticsPanel tactics={data.tactics} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <SEO title="战术板" />
      <Navbar />

      <main className="flex-1">
        <div className="bg-[#041E42] text-white py-4 md:py-6">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">战术板</h1>
              <p className="text-white/70 text-sm">
                比赛编号 #{id}
              </p>
            </div>
          </div>
        </div>

        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}

export default TacticsBoardPage;
