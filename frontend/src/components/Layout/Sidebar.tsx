import { LayoutDashboard, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse }) => {
  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <Users size={20} />, label: 'Users', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

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
      <nav className="mt-6 px-3">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center py-3 px-3 mb-1 rounded-lg transition-colors ${
              item.active
                ? 'border-l-4 border-mlb-red bg-white/10 text-white'
                : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
          </a>
        ))}
      </nav>

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
