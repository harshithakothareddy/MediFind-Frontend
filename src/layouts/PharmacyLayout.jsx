import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import {
  LayoutDashboard, Package, PlusCircle, AlertTriangle, BarChart2,
  FileText, Bell, Clock, Store, Settings, LogOut, ClipboardList, QrCode
} from 'lucide-react';

const PHARMACY_NAV = [
  { label: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/pharmacy/inventory', icon: Package },
  { label: 'Add Medicine', path: '/pharmacy/inventory/add', icon: PlusCircle },
  { label: 'Stock Alerts', path: '/pharmacy/stock-alerts', icon: AlertTriangle },
  { label: 'QR Pickup Verifier', path: '/pharmacy/pickup-verifier', icon: QrCode },
  { divider: true, key: 'd1' },
  { label: 'Search Analytics', path: '/pharmacy/analytics', icon: BarChart2 },
  { label: 'Reports', path: '/pharmacy/reports', icon: FileText },
  { divider: true, key: 'd2' },
  { label: 'Notifications', path: '/pharmacy/notifications', icon: Bell },
  { label: 'Prescription Reviews', path: '/pharmacy/prescriptions', icon: ClipboardList },
  { label: 'Operating Hours', path: '/pharmacy/hours', icon: Clock },
  { label: 'Pharmacy Profile', path: '/pharmacy/profile', icon: Store },
  { label: 'Settings', path: '/pharmacy/settings', icon: Settings },
  { divider: true, key: 'd3' },
  { label: 'Logout', icon: LogOut },
];

const PharmacyLayout = ({ children }) => (
  <div className="min-h-screen flex bg-[#f0fdf4]">
    <Sidebar navItems={PHARMACY_NAV} title="Pharmacy Portal" />
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

export default PharmacyLayout;
