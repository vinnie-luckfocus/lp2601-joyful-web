import { Home, Users, UserCircle, Calendar, BarChart3, Video, LucideIcon } from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  children?: MenuItem[];
}

export const adminMenu: MenuItem[] = [
  { icon: Home, label: '首页', path: '/admin' },
  { icon: Users, label: '球队管理', path: '/admin/teams' },
  { icon: UserCircle, label: '队员管理', path: '/admin/players' },
  { icon: Calendar, label: '赛程管理', path: '/admin/games' },
  { icon: BarChart3, label: '数据录入', path: '/admin/stats' },
  { icon: Video, label: '视频管理', path: '/admin/videos' },
];
