import { motion } from 'framer-motion';
import { StandingsTable } from '../standings/StandingsTable';
import { Leaderboard } from '../leaders/Leaderboard';

export interface StatsSectionProps {
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export const StatsSection: React.FC<StatsSectionProps> = ({ className = '' }) => {
  return (
    <section
      className={`py-12 sm:py-16 lg:py-20 bg-gray-50 ${className}`}
      aria-labelledby="stats-section-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <h2
            id="stats-section-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mlb-navy mb-3 sm:mb-4"
          >
            数据榜单
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            实时更新的球队排名和球员数据统计
          </p>
        </motion.div>

        {/* Responsive Grid: Side-by-side on desktop, stacked on mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
          role="region"
          aria-label="积分榜和排行榜"
        >
          {/* Standings Table */}
          <motion.div
            variants={itemVariants}
            className="min-w-0"
            role="article"
            aria-labelledby="standings-title"
          >
            <h3 id="standings-title" className="sr-only">
              球队积分榜
            </h3>
            <StandingsTable ariaLabel="球队积分榜" />
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            variants={itemVariants}
            className="min-w-0"
            role="article"
            aria-labelledby="leaderboard-title"
          >
            <h3 id="leaderboard-title" className="sr-only">
              球员数据排行榜
            </h3>
            <Leaderboard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
