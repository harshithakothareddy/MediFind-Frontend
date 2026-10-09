import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Store, Pill, Activity, ShieldCheck, AlertTriangle,
  CheckCircle, XCircle, ArrowUpRight, TrendingUp, Search,
  FileText, Clock, Server, BarChart2
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import StatCard from '../../components/common/StatCard';
import { DEMO_PLATFORM_STATS, DEMO_PHARMACIES } from '../../constants/demoData';
import { VerifiedBadge } from '../../components/common/Badges';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import { adminService } from '../../api/adminService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingPharmacies, setPendingPharmacies] = useState([
    {
      id: 101,
      name: 'LifeCare Meds — Sector 62',
      license: 'DL-2026-DL-99120',
      appliedAt: '3 hours ago',
      owner: 'Dr. Vivek Saxena',
      city: 'Noida, UP',
    },
    {
      id: 102,
      name: 'Wellness 24 Pharmacy',
      license: 'DL-2026-HR-44122',
      appliedAt: '5 hours ago',
      owner: 'Ramesh Gupta',
      city: 'Gurugram, HR',
    },
  ]);

  React.useEffect(() => {
    adminService.getDashboardStats()
      .then(res => {
        const d = res.data?.data || res.data;
        if (d && typeof d === 'object') {
          setStats(d);
        }
      })
      .catch(() => {});

    adminService.getPendingVerification()
      .then(res => {
        const payload = res.data?.content || res.data?.items || res.data?.data || res.data;
        if (Array.isArray(payload) && payload.length > 0) {
          setPendingPharmacies(payload.map(p => ({
            id: p.id,
            name: p.name,
            license: p.licenseNumber || 'PENDING-LIC',
            appliedAt: 'Recently',
            owner: p.ownerName || 'Pharmacy Applicant',
            city: `${p.city || 'Hyderabad'}, ${p.state || 'Telangana'}`,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const [recentDiscrepancies, setRecentDiscrepancies] = useState([
    { id: 1, pharmacy: 'Apollo Pharmacy — Demo Branch', user: 'Patient #8210', issue: 'Paracetamol price difference (₹2)', status: 'INVESTIGATING' },
    { id: 2, pharmacy: 'HealthKart Pharmacy — Demo', user: 'Patient #9914', issue: 'Reported store closed during listed hours', status: 'RESOLVED' },
  ]);

  const searchTrendsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Platform Medicine Searches (Thousands)',
        data: [32, 41, 48, 44, 58, 72, 85],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const pharmacySignupsData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'New Pharmacies Verified',
        data: [18, 24, 31, 29, 38, 45],
        backgroundColor: '#0d9488',
        borderRadius: 6,
      }
    ]
  };

  const handleApprovePharmacy = (id, name) => {
    setPendingPharmacies(prev => prev.filter(p => p.id !== id));
    toast.success(`Approved & verified ${name}!`);
  };

  const handleRejectPharmacy = (id, name) => {
    setPendingPharmacies(prev => prev.filter(p => p.id !== id));
    toast.info(`Application for ${name} rejected.`);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">MediFind Master Control Tower</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            System overview, regulatory verification queues, and nationwide medication search telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            All 14 Nodes Healthy (42ms)
          </div>
        </div>
      </div>

      {/* Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Users"
          value={stats ? stats.totalUsers?.toLocaleString() : DEMO_PLATFORM_STATS.activeUsers.toLocaleString()}
          subtitle="Registered patients in database"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Licensed Pharmacies"
          value={stats ? stats.totalPharmacies : DEMO_PLATFORM_STATS.verifiedPharmacies}
          subtitle={`${stats ? stats.verifiedPharmacies : 5} verified in network`}
          icon={Store}
          color="teal"
        />
        <StatCard
          title="Tracked Drug Database"
          value={stats ? stats.totalMedicines?.toLocaleString() : DEMO_PLATFORM_STATS.medicinesListed.toLocaleString()}
          subtitle="Formulations active in catalog"
          icon={Pill}
          color="purple"
        />
        <StatCard
          title="Total Stocked Items"
          value={stats ? stats.totalInventoryEntries?.toLocaleString() : DEMO_PLATFORM_STATS.availabilityUpdates.toLocaleString()}
          subtitle={`${stats ? stats.inStockItems : 60} in stock across stores`}
          icon={Activity}
          color="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 border border-neutral-200 shadow-sm space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900">Weekly Search Query Volume</h3>
            <span className="text-xs text-neutral-500">Live platform load</span>
          </div>
          <div className="h-64">
            <Line
              data={searchTrendsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>

        <div className="card p-6 border border-neutral-200 shadow-sm space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900">Monthly Onboarded Pharmacies</h3>
            <span className="text-xs text-neutral-500">Verified retail network</span>
          </div>
          <div className="h-64">
            <Bar
              data={pharmacySignupsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Verification Queue & Discrepancies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pharmacy Verification Queue */}
        <div className="card border border-neutral-200 shadow-sm overflow-hidden bg-white">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-base text-neutral-900">Pharmacy Verification Queue</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pendingPharmacies.length} Pending Approval
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {pendingPharmacies.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-neutral-900">{item.name}</h4>
                  <p className="text-xs text-neutral-500">
                    License: <span className="font-mono font-medium text-neutral-700">{item.license}</span> • {item.city}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Owner: {item.owner} • Submitted {item.appliedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRejectPharmacy(item.id, item.name)}
                    className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprovePharmacy(item.id, item.name)}
                    className="btn-teal text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            ))}
            {pendingPharmacies.length === 0 && (
              <div className="p-8 text-center text-xs text-neutral-500">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                All pharmacy verification applications processed!
              </div>
            )}
          </div>
        </div>

        {/* User-Reported Stock Discrepancies */}
        <div className="card border border-neutral-200 shadow-sm overflow-hidden bg-white">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-neutral-900">User Availability Discrepancy Reports</h3>
            </div>
            <Link to="/admin/reports" className="text-xs font-semibold text-primary-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentDiscrepancies.map((rep) => (
              <div key={rep.id} className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-neutral-900">{rep.pharmacy}</h4>
                  <p className="text-xs text-neutral-600">{rep.issue}</p>
                  <span className="text-[11px] text-neutral-400 block">Reported by {rep.user}</span>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    rep.status === 'INVESTIGATING'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
