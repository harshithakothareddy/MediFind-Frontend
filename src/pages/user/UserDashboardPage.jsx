import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Search, Pill, Store, Clock, Heart, Bell, CheckCircle,
  AlertTriangle, ArrowRight, ShieldCheck, MapPin, Calendar,
  ExternalLink, Sparkles, QrCode
} from 'lucide-react';
import { DEMO_MEDICINES, DEMO_PHARMACIES, DEMO_SEARCH_HISTORY, DEMO_NOTIFICATIONS } from '../../constants/demoData';
import { AvailabilityBadge, OpenBadge, VerifiedBadge } from '../../components/common/Badges';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';

const UserDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock active reservations for user
  const [reservations, setReservations] = useState([
    {
      id: 'RES-89214A',
      medicineName: 'Amoxicillin',
      strength: '250mg',
      dosageForm: 'Capsule',
      quantity: 2,
      pharmacyName: 'Apollo Pharmacy — Demo Branch',
      pharmacyAddress: '12, MG Road, Sector 5',
      pharmacyPhone: '+91 98000 00001',
      totalPrice: 170.00,
      expiresAt: new Date(Date.now() + 2 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'HELD', // HELD, COMPLETED, CANCELLED
    },
    {
      id: 'RES-44109B',
      medicineName: 'Cetirizine',
      strength: '10mg',
      dosageForm: 'Tablet',
      quantity: 1,
      pharmacyName: 'MedPlus — Demo Branch',
      pharmacyAddress: '45, Park Street, Block A',
      pharmacyPhone: '+91 98000 00002',
      totalPrice: 35.00,
      expiresAt: new Date(Date.now() + 1.5 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'HELD',
    }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCancelReservation = (resId) => {
    setReservations(prev => prev.filter(r => r.id !== resId));
    toast.info(`Reservation ${resId} cancelled.`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#047857] text-white shadow-md relative overflow-hidden border border-[#a7f3d0]/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#a7f3d0]">
              Personal Healthcare Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Healthcare Seeker'}!
            </h1>
            <p className="text-[#d1fae5] text-sm max-w-xl">
              Track your medicine reservations, find verified pharmacies, monitor restock alerts, and save your frequent prescriptions.
            </p>
          </div>

          <Link to="/search" className="btn-primary py-3 px-5 text-sm font-semibold shrink-0 shadow-md">
            <Search className="w-4 h-4" /> Search Medicine Availability
          </Link>
        </div>

        {/* Search input in banner */}
        <div className="mt-6 pt-6 border-t border-white/10 max-w-2xl">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Quick search any medicine, brand or salt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 bg-white/95 text-neutral-900 placeholder:text-neutral-500 text-sm border-0"
              />
            </div>
            <button type="submit" className="btn-primary py-2.5 px-4 text-sm shrink-0">
              Find
            </button>
          </form>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Holds"
          value={reservations.length}
          subtitle="Ready for pickup"
          icon={Clock}
          color="primary"
        />
        <StatCard
          title="Saved Medicines"
          value="4"
          subtitle="Stock monitored"
          icon={Heart}
          color="danger"
        />
        <StatCard
          title="Favorite Pharmacies"
          value="2"
          subtitle="Nearby stores"
          icon={Store}
          color="teal"
        />
        <StatCard
          title="Restock Alerts"
          value="3"
          subtitle="Notifications active"
          icon={Bell}
          color="warning"
        />
      </div>

      {/* Active Medicine Reservations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" /> Active Medicine Reservations
            </h2>
            <p className="text-xs text-neutral-500">Pick up these reserved items before the hold window expires</p>
          </div>
          <Link to="/user/reservations" className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1">
            All Reservations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reservations.map((res) => (
              <div key={res.id} className="card p-5 border border-primary-100 bg-white shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                        {res.id}
                      </span>
                      <h3 className="font-bold text-base text-neutral-900 mt-1">
                        {res.medicineName} ({res.strength})
                      </h3>
                      <p className="text-xs text-neutral-500">{res.dosageForm} • Quantity: {res.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hold until {res.expiresAt}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                    <p className="font-semibold text-neutral-900">{res.pharmacyName}</p>
                    <p className="text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {res.pharmacyAddress}
                    </p>
                    <p className="text-neutral-500">Phone: {res.pharmacyPhone}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 block">Total Due at Counter</span>
                    <span className="text-base font-bold text-neutral-900">{formatPrice(res.totalPrice)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCancelReservation(res.id)}
                      className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Cancel Hold
                    </button>
                    <Link
                      to="/user/reservations"
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Pickup Pass
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center bg-white border border-neutral-200">
            <CheckCircle className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-700">No Active Holds</p>
            <p className="text-xs text-neutral-500 mt-1">Search medicines and reserve stock for quick counter pickup.</p>
          </div>
        )}
      </div>

      {/* Grid: Recent Searches & Monitored Health Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Search History */}
        <div className="card p-6 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
              <Search className="w-4 h-4 text-primary-600" /> Recent Inquiries
            </h3>
            <span className="text-xs text-neutral-500">Quick re-check</span>
          </div>

          <div className="divide-y divide-neutral-100 text-sm">
            {DEMO_SEARCH_HISTORY.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between hover:bg-neutral-50 px-2 rounded-lg transition-colors">
                <div>
                  <span className="font-semibold text-neutral-800">{item.query}</span>
                  <span className="text-xs text-neutral-400 block">{item.results} pharmacies with stock</span>
                </div>
                <Link
                  to={`/search?q=${encodeURIComponent(item.query)}`}
                  className="btn-secondary text-xs py-1 px-2.5"
                >
                  Check Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Notifications & Alerts */}
        <div className="card p-6 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-600" /> Availability & System Notifications
            </h3>
            <Link to="/user/alerts" className="text-xs font-semibold text-primary-600 hover:underline">
              Manage Alerts
            </Link>
          </div>

          <div className="space-y-3">
            {DEMO_NOTIFICATIONS.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-50 transition-colors flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-xs font-bold text-neutral-900">{notif.title}</h4>
                  <p className="text-xs text-neutral-600">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
