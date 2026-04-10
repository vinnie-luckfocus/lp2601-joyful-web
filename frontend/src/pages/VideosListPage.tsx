import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Trophy } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { SEO } from '../components/seo';
import { ErrorState } from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { useVideos } from '../hooks/useVideos';

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function VideosListPage() {
  const { videos, isLoading, error, refetch } = useVideos();
  const navigate = useNavigate();

  const heroVideo = videos[0] || null;
  const remainingVideos = useMemo(() => videos.slice(1), [videos]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <SEO title="比赛视频" description="观看举父棒球联赛的精彩比赛回放和集锦" />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-mlb-navy mb-6">比赛视频</h1>

        {isLoading ? (
          <div className="space-y-8">
            <SkeletonCard rows={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard rows={2} />
              <SkeletonCard rows={2} />
            </div>
          </div>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : videos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">暂无比赛视频</p>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            {heroVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden bg-gray-900 cursor-pointer group mb-8"
                onClick={() => navigate(`/videos/${heroVideo.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/videos/${heroVideo.id}`); }}
                role="button"
                tabIndex={0}
                aria-label={`播放 ${heroVideo.title}`}
              >
                <div className="aspect-video relative">
                  <img
                    src={heroVideo.thumbnail_url || 'https://placehold.co/1280x720/041E42/FFFFFF?text=Video'}
                    alt={heroVideo.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                    </div>
                  </div>
                  {heroVideo.duration_seconds && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/60 rounded text-white text-sm">
                      <Clock className="w-3 h-3" />
                      {formatDuration(heroVideo.duration_seconds)}
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6 bg-white">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{heroVideo.title}</h2>
                  <p className="text-gray-500 mt-1">
                    {heroVideo.game_date ? formatDate(heroVideo.game_date) : ''}
                    {heroVideo.home_team && heroVideo.away_team
                      ? ` · ${heroVideo.home_team} VS ${heroVideo.away_team}`
                      : ''}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Video Grid */}
            {remainingVideos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {remainingVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/videos/${video.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/videos/${video.id}`); }}
                    role="button"
                    tabIndex={0}
                    aria-label={`播放 ${video.title}`}
                  >
                    <div className="aspect-video relative bg-gray-100">
                      <img
                        src={video.thumbnail_url || 'https://placehold.co/640x360/041E42/FFFFFF?text=Video'}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                      {video.duration_seconds && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs">
                          <Clock className="w-3 h-3" />
                          {formatDuration(video.duration_seconds)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {video.game_date ? formatDate(video.game_date) : ''}
                        {video.home_team && video.away_team
                          ? ` · ${video.home_team} VS ${video.away_team}`
                          : ''}
                      </p>
                      {video.highlights_count > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-mlb-red">
                          <Trophy className="w-3 h-3" />
                          <span>{video.highlights_count} 个精彩时刻</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default VideosListPage;
