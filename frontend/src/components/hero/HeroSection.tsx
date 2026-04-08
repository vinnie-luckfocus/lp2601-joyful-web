import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { useState, useEffect } from 'react';

export interface HeroSectionProps {
  leagueName?: string;
  slogan?: string;
  onLoginClick?: () => void;
  backgroundImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  leagueName = 'MLB 数据平台',
  slogan = '专业的棒球数据分析平台，为您提供实时、准确的 MLB 赛事数据和统计信息',
  onLoginClick,
  backgroundImage,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      img.onload = () => {
        setImageSrc(backgroundImage);
        setImageLoaded(true);
      };
    }
  }, [backgroundImage]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  };

  return (
    <section
      className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden"
      style={{
        background: imageSrc
          ? `linear-gradient(to bottom, rgba(4, 30, 66, 0.85), rgba(4, 30, 66, 0.95)), url(${imageSrc})`
          : 'linear-gradient(to bottom, #041E42, #0a2a5c)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      data-testid="hero-section"
    >
      {/* Background image loading state */}
      {backgroundImage && !imageLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-mlb-navy to-mlb-navy/90"
          data-testid="hero-background-placeholder"
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-6"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
          data-testid="hero-title"
        >
          {leagueName}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
          data-testid="hero-slogan"
        >
          {slogan}
        </motion.p>

        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
          data-testid="hero-button-container"
        >
          <Button
            onClick={onLoginClick}
            variant="primary"
            size="lg"
            className="bg-mlb-red hover:bg-mlb-red-dark text-white font-bold px-8 py-3"
            data-testid="hero-login-button"
          >
            登录
          </Button>
        </motion.div>
      </div>

      {/* Bottom gradient transition to content area */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"
        data-testid="hero-bottom-gradient"
      />
    </section>
  );
};

export default HeroSection;
