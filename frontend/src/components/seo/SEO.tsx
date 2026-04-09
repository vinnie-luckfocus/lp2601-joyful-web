import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  locale?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterHandle?: string;
  noIndex?: boolean;
  canonical?: string;
  structuredData?: Record<string, unknown>;
}

const DEFAULT_SEO = {
  title: '举父棒球联赛 - 专业的棒球联赛数据平台',
  description: '专业的棒球联赛数据平台，为您提供实时、准确的赛事数据和统计信息。查看球队排名、球员数据、赛程安排和历史战绩。',
  keywords: '棒球, 数据分析, 球队排名, 球员统计, 赛程, 业余棒球, 举父棒球',
  image: '/og-image.png',
  url: 'https://joyful-baseball.example.com',
  siteName: '举父棒球联赛',
  locale: 'zh_CN',
  twitterCard: 'summary_large_image' as const,
  twitterHandle: '@joyfulbaseball',
};

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  url = DEFAULT_SEO.url,
  type = 'website',
  locale = DEFAULT_SEO.locale,
  siteName = DEFAULT_SEO.siteName,
  twitterCard = DEFAULT_SEO.twitterCard,
  twitterHandle = DEFAULT_SEO.twitterHandle,
  noIndex = false,
  canonical,
  structuredData,
}) => {
  const fullTitle = title === DEFAULT_SEO.title ? title : `${title} | ${DEFAULT_SEO.siteName}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="zh-CN" />
      <html lang="zh-CN" />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${url}${image}`} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${url}${image}`} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* Mobile App Capable */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Theme Color */}
      <meta name="theme-color" content="#041E42" />
      <meta name="msapplication-TileColor" content="#041E42" />

      {/* Structured Data / JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
