import { Github, Twitter, Mail } from 'lucide-react';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: '产品',
      links: [
        { label: '球队数据', href: '/teams' },
        { label: '球员统计', href: '/players' },
        { label: '赛程安排', href: '/schedule' },
      ],
    },
    {
      title: '支持',
      links: [
        { label: '帮助中心', href: '/help' },
        { label: '联系我们', href: '/contact' },
        { label: '反馈建议', href: '/feedback' },
      ],
    },
    {
      title: '关于',
      links: [
        { label: '关于我们', href: '/about' },
        { label: '隐私政策', href: '/privacy' },
        { label: '服务条款', href: '/terms' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Mail, href: 'mailto:contact@example.com', label: 'Email' },
  ];

  return (
    <footer className={`bg-mlb-navy text-white ${className}`} data-testid="footer" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center" aria-hidden="true">
                <span className="text-mlb-navy font-bold text-sm">JF</span>
              </div>
              <span className="text-xl font-bold">举父棒球联赛</span>
            </div>
            <p className="text-gray-300 text-sm mb-6 max-w-xs">
              专业的棒球联赛数据平台，为您提供实时、准确的赛事数据和统计分析。
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={social.label}
                >
                  <social.icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <nav key={section.title} aria-labelledby={`footer-heading-${section.title}`}>
              <h3 id={`footer-heading-${section.title}`} className="text-sm font-semibold uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-gray-300 text-sm hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Joyful Web. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            数据仅供学习交流使用
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
