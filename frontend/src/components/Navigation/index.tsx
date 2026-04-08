import { NavLink } from 'react-router-dom';
import { MenuItem } from '../../config/menu';

interface NavigationProps {
  menuItems: MenuItem[];
  collapsed?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ menuItems, collapsed = false }) => {
  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center py-3 px-3 rounded-lg transition-colors ${
              collapsed ? 'justify-center' : ''
            } ${
              isActive
                ? 'border-l-4 border-mlb-red bg-white/10 text-white'
                : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
            }`
          }
        >
          <span className="flex-shrink-0">
            <item.icon className="w-5 h-5" />
          </span>
          {!collapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;
