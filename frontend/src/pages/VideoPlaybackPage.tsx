import { useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Trophy } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { SEO } from '../components/seo';
import { ErrorState } from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { useVideo } from '../hooks/useVideo';

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

function VideoPlaybackPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoId = id ? parseInt(id, 10) : NaN;

  if (Number.isNaN(videoId) || videoId <= 0) {
    return <Navigate to="/404" replace />;
  }

  const { video, isLoading, error, refetch } = useVideo(videoId);

  const handleSeekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <SEO title={video?.title ? `${video.title} - 比赛视频` : '比赛视频'} description="观看举父棒球联赛的精彩比赛回放" />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/videos')}
          className="flex items-center gap-2 text-gray-600 hover:text-mlb-navy mb-4 transition-colors"
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
          返回视频列表
        </button>

        {isLoading ? (
          <SkeletonCard rows={5} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : video ? (
          <>
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-xl overflow-hidden"
            >
              {video.status === 'ready' ? (
                <video
                  ref={videoRef}
                  src={video.video_url}
                  poster={video.thumbnail_url || undefined}
                  controls
                  preload="metadata"
                  className="w-full aspect-video"
                >
                  您的浏览器不支持视频播放。
                </video>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                  <p className="text-lg font-medium">视频处理中</p>
                  <p className="text-white/60 text-sm mt-1">请稍后再来观看</p>
                </div>
              )}
            </motion.div>

            {/* Game Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{video.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600">
                {video.game_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(video.game_date)}</span>
                  </div>
                )}
                {video.home_team && video.away_team && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {video.home_team} VS {video.away_team}
                    </span>
                  </div>
                )}
                {video.duration_seconds && (
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">{formatDuration(video.duration_seconds)}</span>
                  </div>
                )}
              </div>
              {video.description && (
                <p className="mt-4 text-gray-600 leading-relaxed">{video.description}</p>
              )}
            </motion.div>

            {/* Highlights */}
            {video.highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-mlb-red" />
                  精彩时刻
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {video.highlights.map((highlight) => (
                    <button
                      key={highlight.id}
                      onClick={() => handleSeekTo(highlight.start_time)}
                      className="text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-mlb-red hover:shadow-sm transition-all"
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-gray-900">{highlight.title}</h3>
                        <span className="shrink-0 px-2 py-0.5 bg-mlb-navy text-white text-xs rounded">
                          {formatDuration(highlight.start_time)}
                        </span>
                      </div>
                      {highlight.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{highlight.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <ErrorState title="未找到视频" message="该视频不存在或已被删除" />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default VideoPlaybackPage;
