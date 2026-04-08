import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigation } from '../Navigation';
import { adminMenu } from '../../config/menu';

export interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse }) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-mlb-navy transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <span className={`text-white font-bold text-xl ${collapsed ? 'hidden' : 'block'}`}>
          Admin
        </span>
        {!collapsed && <span className="text-mlb-red font-bold text-xl ml-1">Panel</span>}
        {collapsed && <span className="text-mlb-red font-bold text-xl">A</span>}
      </div>

      {/* Navigation */}
      <div className="mt-6 px-3">
        <Navigation menuItems={adminMenu} collapsed={collapsed} />
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => onCollapse?.(!collapsed)}
        className="absolute bottom-6 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;
