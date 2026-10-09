import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, Filter, MapPin, Clock, Heart, ShieldCheck,
  X, LayoutGrid, List, Pill, Store, AlertCircle,
  Star, ChevronDown, ArrowRight, Package, Tag,
  Info, RefreshCw, CheckCircle, SlidersHorizontal,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { MEDICINE_DATABASE, ALL_CATEGORIES, searchMedicines, getPopularMedicines } from '../../constants/medicineDatabase';
import { AvailabilityBadge } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const SORT_OPTIONS = [
  { value: 'name',       label: 'Name A–Z' },
  { value: 'name_desc',  label: 'Name Z–A' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'category',   label: 'Category' },
];

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Powder', 'Gel', 'Suspension', 'Solution'];

const PAGE_SIZE = 12;

/* ─── Medicine Card (Grid) ─────────────────────────────────────── */
const MedicineCardGrid = ({ medicine, onSave, saved }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="card p-5 border border-[#d1e7dd] hover:border-[#059669] hover:shadow-card-md transition-all group flex flex-col bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 bg-[#d1fae5] border border-[#a7f3d0] rounded-xl flex items-center justify-center shrink-0">
          <Pill className="w-5 h-5 text-[#059669]" />
        </div>
        <div className="flex items-center gap-1.5">
          {!medicine.prescription
            ? <span className="badge-available text-xs">OTC</span>
            : <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200">Rx</span>
          }
          <button
            onClick={() => onSave(medicine)}
            className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-red-500 bg-red-50' : 'text-[#64748b] hover:text-red-500 hover:bg-red-50'}`}
            title={saved ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <h3 className="text-base font-bold text-[#12352b] mb-0.5">{medicine.name}</h3>
      <p className="text-xs text-[#64748b] mb-1">{medicine.genericName}</p>
      {medicine.brand && <p className="text-xs text-[#0f766e] font-medium mb-2">Brand: {medicine.brand}</p>}

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d1fae5] text-[#064e3b] text-xs rounded-md font-medium border border-[#a7f3d0]/60">
          <Tag className="w-3 h-3 text-[#059669]" />{medicine.category}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-[#64748b] text-xs rounded-md border border-[#d1e7dd]/60">
          {medicine.strength} {medicine.dosageForm}
        </span>
      </div>

      <p className={`text-xs text-[#64748b] leading-relaxed mb-3 flex-1 ${!expanded ? 'line-clamp-2' : ''}`}>
        {medicine.description}
      </p>
      {medicine.description?.length > 100 && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#059669] hover:underline mb-3 self-start font-medium">
          {expanded ? 'Show less ▲' : 'Read more ▼'}
        </button>
      )}

      <div className="mt-auto pt-3 border-t border-[#d1e7dd]/60 flex items-center justify-between">
        <div>
          <span className="text-base font-bold text-[#064e3b]">₹{medicine.price}</span>
          <span className="text-xs text-[#64748b] ml-1">/ strip</span>
        </div>
        <button
          onClick={() => navigate(`/medicines/${medicine.id}`)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:gap-2.5 transition-all btn-primary btn-sm"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ─── Medicine Card (List) ─────────────────────────────────────── */
const MedicineCardList = ({ medicine, onSave, saved }) => {
  const navigate = useNavigate();
  return (
    <div className="card p-4 border border-[#d1e7dd] hover:border-[#059669] hover:shadow-card-md transition-all group flex items-center gap-4 bg-white">
      <div className="w-11 h-11 bg-[#d1fae5] border border-[#a7f3d0] rounded-xl flex items-center justify-center shrink-0">
        <Pill className="w-5 h-5 text-[#059669]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-[#12352b] truncate">{medicine.name}</h3>
          {!medicine.prescription
            ? <span className="badge-available text-xs shrink-0">OTC</span>
            : <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200 shrink-0">Rx</span>
          }
        </div>
        <p className="text-xs text-[#64748b]">{medicine.genericName} · {medicine.category}</p>
        <p className="text-xs text-[#64748b]">{medicine.strength} {medicine.dosageForm}{medicine.brand ? ` · ${medicine.brand}` : ''}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#064e3b]">₹{medicine.price}</p>
        <p className="text-xs text-[#64748b]">/ strip</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onSave(medicine)}
          className={`p-2 rounded-lg transition-colors ${saved ? 'text-red-500 bg-red-50' : 'text-[#64748b] hover:text-red-500 hover:bg-red-50'}`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={() => navigate(`/medicines/${medicine.id}`)}
          className="btn-primary btn-sm"
        >
          View
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
const MedicineSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query,       setQuery]       = useState(searchParams.get('q') || '');
  const [category,   setCategory]    = useState(searchParams.get('cat') || '');
  const [dosageForm, setDosageForm]  = useState('');
  const [rxFilter,   setRxFilter]    = useState(''); // 'OTC' | 'Rx' | ''
  const [sortBy,     setSortBy]      = useState('name');
  const [view,       setView]        = useState('grid');
  const [page,       setPage]        = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMax,   setPriceMax]    = useState(1000);
  const [savedMeds,  setSavedMeds]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('medifind_saved_medicines') || '[]'); }
    catch { return []; }
  });

  // Sync URL param on mount
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) setQuery(qParam);
    const catParam = searchParams.get('cat');
    if (catParam) setCategory(catParam);
  }, []);

  /* Filter & sort medicines */
  const filtered = useMemo(() => {
    let list = [...MEDICINE_DATABASE];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q) ||
        m.brand?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.manufacturer?.toLowerCase().includes(q)
      );
    }

    // Category
    if (category) list = list.filter(m => m.category === category);

    // Dosage form
    if (dosageForm) list = list.filter(m => m.dosageForm === dosageForm);

    // OTC / Rx
    if (rxFilter === 'OTC') list = list.filter(m => !m.prescription);
    if (rxFilter === 'Rx')  list = list.filter(m =>  m.prescription);

    // Price
    list = list.filter(m => m.price <= priceMax);

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name':       return a.name.localeCompare(b.name);
        case 'name_desc':  return b.name.localeCompare(a.name);
        case 'price_asc':  return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'category':   return (a.category || '').localeCompare(b.category || '');
        default:           return 0;
      }
    });

    return list;
  }, [query, category, dosageForm, rxFilter, sortBy, priceMax]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(1), [query, category, dosageForm, rxFilter, sortBy, priceMax]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    setPage(1);
  };

  const handleSave = useCallback((med) => {
    setSavedMeds(prev => {
      const exists = prev.some(m => m.id === med.id && m.strength === med.strength);
      const next   = exists
        ? prev.filter(m => !(m.id === med.id && m.strength === med.strength))
        : [...prev, med];
      localStorage.setItem('medifind_saved_medicines', JSON.stringify(next));
      toast[exists ? 'info' : 'success'](exists ? 'Removed from favorites' : `${med.name} saved to favorites`);
      return next;
    });
  }, []);

  const isSaved = (med) => savedMeds.some(m => m.id === med.id && m.strength === med.strength);

  const clearFilters = () => {
    setQuery(''); setCategory(''); setDosageForm('');
    setRxFilter(''); setSortBy('name'); setPriceMax(1000);
    setSearchParams({});
  };

  const activeFilterCount = [category, dosageForm, rxFilter, priceMax < 1000].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#047857] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#a7f3d0] text-sm mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Medicine Search</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Find Your Medicine</h1>
          <p className="text-[#d1fae5]">{MEDICINE_DATABASE.length}+ medicines across {ALL_CATEGORIES.length} categories</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicine name, generic, brand, manufacturer..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-[#12352b] placeholder:text-[#64748b] text-sm font-medium focus:ring-2 focus:ring-[#059669] focus:outline-none shadow-md border border-[#d1e7dd]"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSearchParams({}); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#12352b]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="h-12 px-6 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-2 whitespace-nowrap">
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Quick category pills ─────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-[#059669] text-white' : 'bg-white text-[#12352b] border border-[#d1e7dd] hover:border-[#059669]'}`}
          >
            All ({MEDICINE_DATABASE.length})
          </button>
          {ALL_CATEGORIES.map(cat => {
            const count = MEDICINE_DATABASE.filter(m => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === category ? '' : cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat ? 'bg-[#059669] text-white' : 'bg-white text-[#12352b] border border-[#d1e7dd] hover:border-[#059669]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#059669] text-white border-[#059669]'
                : 'bg-white text-[#12352b] border-[#d1e7dd] hover:border-[#059669]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-xl border border-[#d1e7dd] bg-white text-sm font-medium text-[#12352b] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:outline-none appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>

          {/* OTC / Rx toggle */}
          <div className="flex items-center gap-1 bg-white border border-[#d1e7dd] rounded-xl p-1">
            {['', 'OTC', 'Rx'].map(opt => (
              <button
                key={opt}
                onClick={() => setRxFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  rxFilter === opt ? 'bg-[#059669] text-white' : 'text-[#64748b] hover:bg-[#d1fae5] hover:text-[#064e3b]'
                }`}
              >
                {opt || 'All'}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-1 bg-white border border-[#d1e7dd] rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-[#059669] text-white' : 'text-[#64748b] hover:bg-[#d1fae5]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-[#059669] text-white' : 'text-[#64748b] hover:bg-[#d1fae5]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Expanded filters panel ───────────────────────────── */}
        {showFilters && (
          <div className="card p-5 mb-6 border border-[#a7f3d0] bg-[#d1fae5]/30 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#12352b] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input text-sm py-2 bg-white"
                >
                  <option value="">All Categories</option>
                  {ALL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c} ({MEDICINE_DATABASE.filter(m => m.category === c).length})</option>
                  ))}
                </select>
              </div>
              {/* Dosage form */}
              <div>
                <label className="block text-xs font-semibold text-[#12352b] mb-1.5">Dosage Form</label>
                <select value={dosageForm} onChange={e => setDosageForm(e.target.value)} className="input text-sm py-2 bg-white">
                  <option value="">All Forms</option>
                  {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              {/* Price max */}
              <div>
                <label className="block text-xs font-semibold text-[#12352b] mb-1.5">Max Price: ₹{priceMax}</label>
                <input
                  type="range" min={10} max={1000} step={10}
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#059669]"
                />
                <div className="flex justify-between text-xs text-[#64748b] mt-1">
                  <span>₹10</span><span>₹1000</span>
                </div>
              </div>
              {/* Prescription */}
              <div>
                <label className="block text-xs font-semibold text-[#12352b] mb-1.5">Prescription</label>
                <div className="flex flex-col gap-1.5">
                  {[['', 'All Medicines'], ['OTC', 'Over-the-Counter (OTC)'], ['Rx', 'Prescription Only (Rx)']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="rx" value={val}
                        checked={rxFilter === val}
                        onChange={() => setRxFilter(val)}
                        className="accent-[#059669]"
                      />
                      <span className="text-sm text-[#12352b]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Results count ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-[#12352b]">
              {filtered.length > 0
                ? `${filtered.length} medicine${filtered.length !== 1 ? 's' : ''} found`
                : 'No medicines found'
              }
            </p>
            {query && (
              <p className="text-xs text-[#64748b]">for "{query}"</p>
            )}
          </div>
          {filtered.length > 0 && (
            <p className="text-xs text-[#64748b]">
              Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* ── Results grid / list ──────────────────────────────── */}
        {paginated.length === 0 ? (
          <div className="card p-16 text-center bg-white border border-[#d1e7dd]">
            <Pill className="w-12 h-12 text-[#a7f3d0] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#12352b] mb-2">No medicines found</h3>
            <p className="text-sm text-[#64748b] mb-6">
              {query ? `No results for "${query}". Try a different name, generic, or brand.` : 'No medicines match the selected filters.'}
            </p>
            <button onClick={clearFilters} className="btn-primary btn-md">Clear All Filters</button>
          </div>
        ) : (
          <>
            <div className={view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'space-y-3'
            }>
              {paginated.map((med) =>
                view === 'grid'
                  ? <MedicineCardGrid key={`${med.id}-${med.strength}`} medicine={med} onSave={handleSave} saved={isSaved(med)} />
                  : <MedicineCardList key={`${med.id}-${med.strength}`} medicine={med} onSave={handleSave} saved={isSaved(med)} />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-[#d1e7dd] bg-white text-[#12352b] hover:bg-[#d1fae5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-[#059669] text-white shadow-sm'
                          : 'bg-white text-[#12352b] border border-[#d1e7dd] hover:bg-[#d1fae5]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-[#d1e7dd] bg-white text-[#12352b] hover:bg-[#d1fae5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MedicineSearchPage;
