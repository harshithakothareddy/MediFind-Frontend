import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MapPin, ArrowRight, ShieldCheck, Clock, Star,
  Pill, Store, Users, RefreshCw, CheckCircle, Bell, Heart,
  BarChart2, Package, Zap, ChevronRight, AlertCircle, LocateFixed,
  Sparkles, TrendingUp, Activity, ScanLine
} from 'lucide-react';
import { getPopularMedicines, MEDICINE_DATABASE, ALL_CATEGORIES } from '../../constants/medicineDatabase';
import { DEMO_PHARMACIES } from '../../constants/demoData';
import { AvailabilityBadge, VerifiedBadge, OpenBadge } from '../../components/common/Badges';

const STEPS = [
  { step: 1, icon: Search,       title: 'Search Medicine',     desc: 'Enter medicine name, generic name, or category to find availability across pharmacies.' },
  { step: 2, icon: BarChart2,    title: 'Compare Availability', desc: 'See real-time stock status, quantity, pricing, and distance across multiple pharmacies.' },
  { step: 3, icon: Store,        title: 'Choose Pharmacy',      desc: 'Select the best pharmacy based on availability, proximity, and operating hours.' },
  { step: 4, icon: CheckCircle,  title: 'Get Medicine',         desc: 'Visit the pharmacy confidently knowing your medicine is available and ready.' },
];

const FEATURES = [
  { icon: Search,     title: 'Smart Search',          desc: 'Find medicines by name, generic, or category.',   color: 'text-[#059669]',   bg: 'bg-[#d1fae5]' },
  { icon: Store,      title: 'Pharmacy Availability', desc: 'Real-time stock across verified pharmacies.',      color: 'text-[#0f766e]',   bg: 'bg-[#d1fae5]' },
  { icon: MapPin,     title: 'Nearby Finder',         desc: 'Discover pharmacies nearest to your location.',    color: 'text-[#059669]',  bg: 'bg-[#d1fae5]' },
  { icon: RefreshCw,  title: 'Live Updates',          desc: 'Pharmacies update inventory for fresh data.',      color: 'text-[#064e3b]',  bg: 'bg-[#d1fae5]' },
  { icon: Bell,       title: 'Restock Alerts',        desc: 'Get notified when a medicine becomes available.',  color: 'text-[#0f766e]', bg: 'bg-[#d1fae5]' },
  { icon: ShieldCheck,title: 'Verified Pharmacies',   desc: 'All pharmacies verified for trust.',               color: 'text-[#064e3b]', bg: 'bg-[#d1fae5]' },
  { icon: Heart,      title: 'Favorites',             desc: 'Save preferred medicines and pharmacies.',         color: 'text-[#059669]',    bg: 'bg-[#d1fae5]' },
  { icon: BarChart2,  title: 'Analytics',             desc: 'Pharmacies gain insights on search trends.',       color: 'text-[#0f766e]',   bg: 'bg-[#d1fae5]' },
  { icon: Package,    title: 'Inventory Mgmt',        desc: 'Pharmacies manage stock with low-stock alerts.',   color: 'text-[#059669]', bg: 'bg-[#d1fae5]' },
  { icon: AlertCircle,title: 'Report Issues',         desc: 'Flag incorrect availability for accuracy.',        color: 'text-[#064e3b]', bg: 'bg-[#d1fae5]' },
];

/* ── Animated counter ───────────────────────────────────────────── */
const CounterCard = ({ label, value, suffix = '+', color = 'text-white' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target  = value;
    const step    = Math.ceil(target / 60);
    let   current = 0;
    const timer   = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className="text-center">
      <div className={`text-2xl md:text-3xl font-black mb-1 ${color}`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-emerald-200/90 text-sm font-medium">{label}</div>
    </div>
  );
};

/* ── Popular medicine card ──────────────────────────────────────── */
const MedCard = ({ med, onClick }) => (
  <div
    onClick={onClick}
    className="card-hover p-5 cursor-pointer group bg-white border border-[#d1e7dd]"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 bg-[#d1fae5] border border-[#a7f3d0] rounded-xl flex items-center justify-center">
        <Pill className="w-5 h-5 text-[#059669]" />
      </div>
      <div className="flex items-center gap-1.5">
        {!med.prescription
          ? <span className="badge-available text-xs">OTC</span>
          : <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200">Rx</span>
        }
      </div>
    </div>
    <h3 className="text-base font-bold text-[#12352b] mb-0.5 group-hover:text-[#059669] transition-colors">{med.name}</h3>
    <p className="text-xs text-[#64748b] mb-0.5">{med.genericName}</p>
    {med.brand && <p className="text-xs text-[#0f766e] mb-2 font-medium">{med.brand}</p>}
    <p className="text-xs text-[#64748b] mb-4">{med.category} · {med.strength} {med.dosageForm}</p>
    <div className="flex items-center justify-between pt-3 border-t border-[#d1e7dd]/60">
      <span className="text-base font-bold text-[#064e3b]">₹{med.price}</span>
      <span className="flex items-center gap-1 text-xs font-semibold text-[#059669] group-hover:gap-2 transition-all">
        Check <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
);

/* ── Pharmacy preview card ──────────────────────────────────────── */
const PharmacyCard = ({ pharmacy }) => (
  <div className="card-hover p-5 group bg-white border border-[#d1e7dd]">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#d1fae5] border border-[#a7f3d0] rounded-xl flex items-center justify-center">
          <Store className="w-5 h-5 text-[#059669]" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[#12352b] leading-tight group-hover:text-[#059669] transition-colors">{pharmacy.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            {pharmacy.verified && <span className="badge-verified text-xs">Verified</span>}
            <span className={`badge text-xs ${pharmacy.open ? 'badge-open' : 'badge-closed'}`}>
              {pharmacy.open ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-semibold text-[#12352b]">{pharmacy.rating}</span>
      </div>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
      <MapPin className="w-3 h-3 shrink-0 text-[#059669]" />
      <span className="truncate">{pharmacy.address}</span>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
      <Clock className="w-3 h-3 shrink-0 text-[#059669]" />
      <span>{pharmacy.operatingHours}</span>
    </div>
    <div className="mt-3 pt-3 border-t border-[#d1e7dd]/60 flex items-center justify-between">
      <span className="text-xs font-semibold text-[#064e3b] bg-[#d1fae5] px-2 py-0.5 rounded-lg border border-[#a7f3d0]/60">
        📍 {pharmacy.distance}
      </span>
      <span className="text-xs text-[#64748b]">{pharmacy.availableMedicines} medicines</span>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const popularMeds = getPopularMedicines(9);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#047857] pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#a7f3d0]/15 to-transparent" />
        <div className="absolute top-20 right-32 w-72 h-72 bg-[#d1fae5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-[#064e3b]/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">

            {/* Left content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#022c22]/40 backdrop-blur-sm border border-[#a7f3d0]/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 bg-[#a7f3d0] rounded-full animate-pulse" />
                <span className="text-[#d1fae5] text-sm font-medium">Live Medicine Availability Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Find Your Medicine.{' '}
                <span className="bg-gradient-to-r from-[#a7f3d0] via-[#6ee7b7] to-white bg-clip-text text-transparent">
                  Find It Nearby.
                </span>
              </h1>

              <p className="text-xl text-emerald-100/90 mb-8 leading-relaxed">
                MediFind helps you discover real-time medicine availability across verified pharmacies.
                Search, compare, and find what you need — quickly and reliably.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine name, brand, generic..."
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-neutral-900 placeholder:text-neutral-400 text-base font-medium focus:ring-2 focus:ring-[#059669] focus:outline-none shadow-lg border border-[#d1e7dd]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-14 px-8 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-glow flex items-center gap-2 justify-center whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/scan-prescription')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl transition-all text-sm font-bold shadow-md hover:shadow-glow"
                >
                  <ScanLine className="w-4 h-4" />
                  Scan / Upload Prescription
                </button>
                <button
                  onClick={() => navigate('/pharmacies')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#022c22]/50 hover:bg-[#022c22]/70 border border-[#a7f3d0]/30 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Nearby Pharmacies
                </button>
                <p className="text-emerald-200/90 text-sm">
                  Popular: <button onClick={() => navigate('/medicines?q=Paracetamol')} className="text-[#a7f3d0] hover:underline font-medium">Paracetamol</button>,{' '}
                  <button onClick={() => navigate('/medicines?q=Amoxicillin')} className="text-[#a7f3d0] hover:underline font-medium">Amoxicillin</button>,{' '}
                  <button onClick={() => navigate('/medicines?q=Cetirizine')} className="text-[#a7f3d0] hover:underline font-medium">Cetirizine</button>
                </p>
              </div>
            </div>

            {/* Right — hero image + floating cards */}
            <div className="hidden lg:flex relative items-center justify-center mt-8 lg:mt-0" style={{minHeight:'420px'}}>

              {/* Medicine hero illustration */}
              <div className="relative z-10 flex items-end justify-center" style={{width:'320px',height:'380px'}}>
                <img
                  src="/medicine-hero.jpg"
                  alt="Medicine bottle with pills and green leaves"
                  className="w-full h-full object-contain drop-shadow-2xl animate-float"
                  style={{borderRadius:'24px'}}
                />
              </div>

              {/* Card 1 — top-left */}
              <div className="absolute left-0 top-4 w-52 bg-white rounded-2xl p-4 shadow-card-xl animate-float-delay border border-[#d1e7dd] z-20">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-[#059669]" />
                  <span className="text-sm font-bold text-[#12352b]">Paracetamol 500mg</span>
                </div>
                <span className="badge-available text-xs">Available</span>
                <p className="text-xs text-[#64748b] mt-1.5">14 pharmacies nearby</p>
              </div>

              {/* Card 2 — top-right */}
              <div className="absolute right-0 top-0 w-52 bg-white rounded-2xl p-4 shadow-card-xl animate-float border border-[#d1e7dd] z-20">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <span className="text-sm font-bold text-[#12352b]">Apollo Pharmacy</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="badge-verified text-xs">Verified</span>
                  <span className="badge-open text-xs">Open Now</span>
                </div>
                <p className="text-xs text-[#64748b]">0.8 km away · 4.7 ★</p>
              </div>

              {/* Card 3 — bottom-left */}
              <div className="absolute left-0 bottom-4 w-48 bg-white rounded-2xl p-4 shadow-card-xl animate-float-delay2 border border-[#d1e7dd] z-20">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-[#059669]">Live Update</span>
                </div>
                <div className="text-base font-bold text-[#12352b]">2 min ago</div>
                <p className="text-xs text-[#64748b] mt-0.5">Amoxicillin restocked</p>
              </div>

              {/* Card 4 — bottom-right */}
              <div className="absolute right-0 bottom-4 w-44 bg-gradient-to-br from-[#064e3b] to-[#0f766e] rounded-2xl p-4 shadow-card-xl animate-float-delay border border-[#a7f3d0]/30 z-20">
                <TrendingUp className="w-5 h-5 text-[#a7f3d0] mb-2" />
                <div className="text-xl font-black text-white">{MEDICINE_DATABASE.length}+</div>
                <p className="text-xs text-[#d1fae5]">Medicines listed</p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <CounterCard label="Medicines in Database"  value={MEDICINE_DATABASE.length} />
              <CounterCard label="Medicine Categories"    value={ALL_CATEGORIES.length} />
              <CounterCard label="OTC Medicines"          value={MEDICINE_DATABASE.filter(m => !m.prescription).length} />
              <CounterCard label="Verified Pharmacies"    value={134} />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-[#064e3b] uppercase tracking-widest bg-[#d1fae5] border border-[#a7f3d0] px-3.5 py-1 rounded-full mb-3 shadow-xs">
              Simple Process
            </span>
            <h2 className="text-3xl font-black text-[#12352b] mb-3">How MediFind Works</h2>
            <p className="text-[#64748b] max-w-xl mx-auto">Find the medicines you need in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#064e3b] via-[#059669] to-[#0f766e]" />
            {STEPS.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#059669] rounded-2xl flex items-center justify-center shadow-card-md group-hover:shadow-glow group-hover:-translate-y-1 transition-all duration-300">
                    <step.icon className="w-8 h-8 text-[#d1fae5]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-[#059669] rounded-full flex items-center justify-center text-xs font-black text-[#064e3b] shadow-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#12352b] mb-2">{step.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-[#d1e7dd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-[#064e3b] uppercase tracking-widest bg-[#d1fae5] border border-[#a7f3d0] px-3.5 py-1 rounded-full mb-3 shadow-xs">
              Platform Features
            </span>
            <h2 className="text-3xl font-black text-[#12352b] mb-3">Everything You Need</h2>
            <p className="text-[#64748b] max-w-xl mx-auto">A comprehensive platform for medicine discovery and pharmacy management</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover p-5 group cursor-pointer bg-white border border-[#d1e7dd]">
                <div className={`w-10 h-10 ${f.bg} border border-[#a7f3d0] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-bold text-[#12352b] mb-1 group-hover:text-[#059669] transition-colors">{f.title}</h3>
                <p className="text-xs text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Medicines ────────────────────────────────────── */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-xs font-bold text-[#064e3b] uppercase tracking-widest bg-[#d1fae5] border border-[#a7f3d0] px-3.5 py-1 rounded-full mb-3 shadow-xs">
                Real Database
              </span>
              <h2 className="text-3xl font-black text-[#12352b]">Popular Medicines</h2>
              <p className="text-[#64748b] mt-1">{MEDICINE_DATABASE.length}+ medicines across {ALL_CATEGORIES.length} categories</p>
            </div>
            <button
              onClick={() => navigate('/medicines')}
              className="hidden sm:flex items-center gap-1.5 text-[#059669] font-semibold hover:gap-3 transition-all text-sm group hover:text-[#047857]"
            >
              View All {MEDICINE_DATABASE.length}+ <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularMeds.map((med) => (
              <MedCard
                key={`${med.id}-${med.strength}`}
                med={med}
                onClick={() => navigate(`/medicines?q=${encodeURIComponent(med.name)}`)}
              />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => navigate('/medicines')}
              className="btn-primary btn-md"
            >
              View All {MEDICINE_DATABASE.length}+ Medicines <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Nearby Pharmacies CTA ────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-[#d1e7dd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pharmacy list preview */}
            <div>
              <div className="mb-6">
                <span className="inline-block text-xs font-bold text-[#064e3b] uppercase tracking-widest bg-[#d1fae5] border border-[#a7f3d0] px-3.5 py-1 rounded-full mb-3 shadow-xs">
                  Nearby Pharmacies
                </span>
                <h2 className="text-3xl font-black text-[#12352b]">Find Pharmacies Near You</h2>
                <p className="text-[#64748b] mt-2">Share your location to see real pharmacies from OpenStreetMap data — with directions & hours.</p>
              </div>
              <div className="space-y-4">
                {DEMO_PHARMACIES.slice(0, 3).map(ph => (
                  <PharmacyCard key={ph.id} pharmacy={ph} />
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/pharmacies')}
                  className="btn-primary btn-md"
                >
                  <LocateFixed className="w-4 h-4" />
                  Find Nearby Now
                </button>
                <button
                  onClick={() => navigate('/pharmacies')}
                  className="btn-secondary btn-md"
                >
                  <Store className="w-4 h-4" />
                  All Pharmacies
                </button>
              </div>
            </div>

            {/* Trust & features */}
            <div className="bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#047857] rounded-3xl p-8 text-white relative overflow-hidden shadow-card-lg border border-[#a7f3d0]/20">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 bg-[#022c22]/40 border border-[#a7f3d0]/30 rounded-full px-3 py-1.5 text-xs font-medium mb-6">
                  <span className="w-2 h-2 bg-[#a7f3d0] rounded-full animate-pulse" />
                  <span className="text-[#d1fae5]">Live OpenStreetMap Data</span>
                </span>
                <h3 className="text-2xl font-black mb-4">Trusted Healthcare Information</h3>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: ShieldCheck, title: 'Verified Pharmacies',    desc: 'All pharmacies go through verification before being listed.' },
                    { icon: Clock,       title: 'Fresh Availability Data', desc: 'Pharmacies update inventory regularly with timestamps.' },
                    { icon: AlertCircle, title: 'User Reporting',          desc: 'Flag incorrect availability to maintain data accuracy.' },
                    { icon: Zap,         title: 'Secure Platform',         desc: 'JWT-based auth with role-based access control.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#022c22]/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#a7f3d0]/20">
                        <item.icon className="w-4 h-4 text-[#a7f3d0]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-emerald-100/80 text-xs mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#022c22]/40 border border-[#a7f3d0]/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#a7f3d0] shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-100/80 leading-relaxed">
                      <strong className="text-[#a7f3d0]">Disclaimer:</strong> MediFind provides medicine availability info only. Always consult a qualified healthcare professional before taking any medication.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => navigate('/register')} className="flex-1 h-11 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-glow text-sm">
                    Get Started
                  </button>
                  <button onClick={() => navigate('/about')} className="flex-1 h-11 bg-[#022c22]/60 hover:bg-[#022c22]/80 border border-[#a7f3d0]/30 text-white font-semibold rounded-xl transition-colors text-sm">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
