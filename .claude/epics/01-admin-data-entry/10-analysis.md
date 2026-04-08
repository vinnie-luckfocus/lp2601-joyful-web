# Issue #10 Analysis: Navigation Menu Component

## Overview
Create configurable navigation menu component with icons and routing.

## Work Streams

### Stream A: Navigation Component (Single Stream)
**Files to Create:**
- `frontend/src/config/menu.ts` - Menu configuration
- `frontend/src/components/Navigation/index.tsx` - Navigation component
- Update `frontend/src/components/Layout/Sidebar.tsx` - Integrate Navigation

**Implementation Details:**
1. Menu configuration:
   ```typescript
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
   ```

2. Navigation component:
   - Map through menu items
   - Use NavLink from react-router-dom
   - Active state: bg-white/10, border-l-4 border-mlb-red
   - Inactive: text-gray-300, hover:bg-white/5

3. Icons from lucide-react:
   - Home, Users, UserCircle, Calendar, BarChart3, Video

**Parallel Streams:** 1

## Dependencies
- Issue #7 (React) - COMPLETED ✓
- Issue #8 (Tailwind) - COMPLETED ✓
- Issue #9 (Layout) - COMPLETED ✓

## Definition of Done
- [ ] Menu config exists
- [ ] Navigation component renders
- [ ] Active route highlighted (red border)
- [ ] Icons displayed
- [ ] Click navigates to route
