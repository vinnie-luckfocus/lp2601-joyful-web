import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ContentArea } from './ContentArea';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header />
        <ContentArea>{children}</ContentArea>
      </div>
    </div>
  );
};

export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { ContentArea } from './ContentArea';

export type { SidebarProps } from './Sidebar';
export type { ContentAreaProps } from './ContentArea';

export default AdminLayout;
