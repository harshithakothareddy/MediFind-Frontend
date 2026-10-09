import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import {
  LayoutDashboard, Users, Store, Pill, Package, FileText,
  BarChart2, Bell, ClipboardList, Settings, LogOut, ShieldCheck, AlertTriangle
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { divider: true, key: 'd1' },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Pharmacies', path: '/admin/pharmacies', icon: Store },
  { label: 'Medicines', path: '/admin/medicines', icon: Pill },
  { label: 'Inventory', path: '/admin/inventory', icon: Package },
  { divider: true, key: 'd2' },
  { label: 'Avail. Reports', path: '/admin/reports', icon: AlertTriangle },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { label: 'Report Center', path: '/admin/report-center', icon: FileText },
  { divider: true, key: 'd3' },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { divider: true, key: 'd4' },
  { label: 'Logout', icon: LogOut },
];

const AdminLayout = ({ children }) => (
  <div className="min-h-screen flex bg-[#f0fdf4]">
    <Sidebar navItems={ADMIN_NAV} title="Admin Control" />
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

export default AdminLayout;
