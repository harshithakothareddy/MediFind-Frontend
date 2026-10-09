import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Scale, Search, Store, MapPin, Phone, Clock, ShieldCheck,
  CheckCircle, AlertCircle, ArrowRight, Star, Navigation,
  TrendingDown, Check, Sparkles, Filter, ChevronDown, RefreshCw
} from 'lucide-react';
import { MEDICINE_DATABASE } from '../../constants/medicineDatabase';
import { DEMO_PHARMACIES } from '../../constants/demoData';
import { OpenBadge, VerifiedBadge } from '../../components/common/Badges';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const POPULAR_COMPARE_MEDS = [
  'Paracetamol',
  'Amoxicillin',
  'Cetirizine',
  'Metformin',
  'Pantoprazole',
  'Azithromycin',
  'Ibuprofen',
  'Atorvastatin'
];

const MedicineComparisonPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMedQuery = searchParams.get('m') || 'Paracetamol';

  const [selectedMedName, setSelectedMedName] = useState(initialMedQuery);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('price_asc'); // 'price_asc' | 'distance' | 'stock'

  // Reservation modal state
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [confirmedCode, setConfirmedCode] = useState(null);

  // Find the selected medicine details from database
  const activeMedicine = useMemo(() => {
    return (
      MEDICINE_DATABASE.find(
        m => m.name.toLowerCase() === selectedMedName.toLowerCase() ||
             `${m.name} ${m.strength}`.toLowerCase() === selectedMedName.toLowerCase()
      ) || MEDICINE_DATABASE[0]
    );
  }, [selectedMedName]);

  // Autocomplete suggestions
  const medicineSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return MEDICINE_DATABASE.filter(
      m => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  // Build comparison data across all pharmacies for this medicine
  const comparisonList = useMemo(() => {
    const list = DEMO_PHARMACIES.map((pharmacy, idx) => {
      // Deterministic realistic variation per pharmacy
      const isLow = (idx + activeMedicine.id) % 5 === 0;
      const isOut = (idx + activeMedicine.id) % 9 === 0;
      const status = isOut ? 'OUT_OF_STOCK' : isLow ? 'LOW_STOCK' : 'AVAILABLE';
      const quantity = isOut ? 0 : isLow ? 4 + (idx % 5) : 35 + ((idx * 13 + activeMedicine.id * 7) % 85);
      
      const priceVariation = ((idx * 3 - 2) % 7);
      const price = Math.max(10, (activeMedicine.price || 30) + priceVariation);

      return {
        ...pharmacy,
        status,
        quantity,
        price,
        lastUpdated: `${(idx * 7) % 45 + 5} mins ago`,
      };
    });

    // Filter
    let filtered = list;
    if (filterInStockOnly) {
      filtered = filtered.filter(item => item.status !== 'OUT_OF_STOCK');
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'distance') {
        const distA = parseFloat(a.distance) || 99;
        const distB = parseFloat(b.distance) || 99;
        return distA - distB;
      }
      if (sortBy === 'stock') return b.quantity - a.quantity;
      return 0;
    });
  }, [activeMedicine, filterInStockOnly, sortBy]);

  // Key metrics
  const inStockList = comparisonList.filter(c => c.status !== 'OUT_OF_STOCK');
  const bestPriceItem = inStockList.reduce((min, curr) => curr.price < min.price ? curr : min, inStockList[0] || comparisonList[0]);
  const closestItem = inStockList[0] || comparisonList[0];
  const totalStockCount = comparisonList.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectMed = (med) => {
    setSelectedMedName(med.name);
    setSearchParams({ m: med.name });
    setSearchQuery('');
  };

  const openReserve = (ph) => {
    setSelectedPharmacy(ph);
    setConfirmedCode(null);
    setReserveQty(1);
    setReserveModalOpen(true);
  };

  const handleConfirmReservation = () => {
    const code = `MED-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedCode(code);
    toast.success(`Reserved at ${selectedPharmacy?.name}! Your pickup code is ${code}`);
  };

  return (
    <div className="bg-[#f0fdf4] min-h-screen pb-20">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#047857] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 shadow-md border-b border-[#a7f3d0]/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#022c22]/50 border border-[#a7f3d0]/30 text-[#d1fae5] text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-[#a7f3d0]" /> Medicine Stock & Price Comparison
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Compare Medicine Availability
              </h1>
              <p className="text-emerald-100/90 max-w-2xl text-sm sm:text-base mt-1">
                Compare real-time stock levels, strip prices, distance, and operating hours across verified pharmacies.
              </p>
            </div>

            {/* Selected med info card */}
            <div className="bg-[#022c22]/50 backdrop-blur-md border border-[#a7f3d0]/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#059669]/30 border border-[#a7f3d0]/30 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-[#a7f3d0]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#a7f3d0] font-bold">Currently Comparing</p>
                <p className="text-base font-bold text-white">{activeMedicine.name} ({activeMedicine.strength})</p>
                <p className="text-xs text-emerald-100/80">{activeMedicine.genericName}</p>
              </div>
            </div>
          </div>

          {/* Search / Selector */}
          <div className="bg-[#022c22]/40 backdrop-blur-md border border-[#a7f3d0]/20 rounded-2xl p-4 mt-4">
            <div className="relative max-w-xl">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any medicine to compare (e.g. Calpol, Azithromycin, Metformin)..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white text-neutral-900 placeholder:text-neutral-400 text-sm font-medium focus:ring-2 focus:ring-[#059669] focus:outline-none shadow-sm border border-[#d1e7dd]"
              />

              {/* Suggestions dropdown */}
              {medicineSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[#d1e7dd] py-1.5 z-30 max-h-64 overflow-y-auto">
                  {medicineSuggestions.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMed(m)}
                      className="w-full px-4 py-2 text-left hover:bg-[#d1fae5]/50 flex items-center justify-between text-xs text-neutral-900 transition-colors"
                    >
                      <div>
                        <strong className="text-sm font-semibold text-[#12352b]">{m.name}</strong>{' '}
                        <span className="text-neutral-500 font-normal">({m.strength} · {m.dosageForm})</span>
                        <p className="text-[11px] text-neutral-400">{m.genericName}</p>
                      </div>
                      <span className="font-bold text-[#059669]">₹{m.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Quick Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/10">
              <span className="text-[11px] text-[#d1fae5] mr-1 font-medium">Quick Compare:</span>
              {POPULAR_COMPARE_MEDS.map((medName) => {
                const isActive = activeMedicine.name.toLowerCase() === medName.toLowerCase();
                return (
                  <button
                    key={medName}
                    onClick={() => {
                      const found = MEDICINE_DATABASE.find(m => m.name.toLowerCase() === medName.toLowerCase());
                      if (found) handleSelectMed(found);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-[#a7f3d0] text-[#064e3b] font-bold shadow-xs'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 inline mr-1" />}
                    {medName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Overview ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-card-sm border border-[#d1e7dd] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d1fae5] border border-[#a7f3d0] flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold">Best Price</p>
              <p className="text-xl font-black text-[#12352b]">₹{bestPriceItem?.price || activeMedicine.price}</p>
              <p className="text-[11px] text-[#64748b] truncate max-w-[120px]">{bestPriceItem?.name}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card-sm border border-[#d1e7dd] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d1fae5] border border-[#a7f3d0] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#0f766e]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold">Nearest Stock</p>
              <p className="text-xl font-black text-[#12352b]">{closestItem?.distance || '0.6 km'}</p>
              <p className="text-[11px] text-[#64748b] truncate max-w-[120px]">{closestItem?.name}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card-sm border border-[#d1e7dd] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d1fae5] border border-[#a7f3d0] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold">In Stock Stores</p>
              <p className="text-xl font-black text-[#12352b]">{inStockList.length} / {comparisonList.length}</p>
              <p className="text-[11px] text-[#64748b]">Verified locations</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card-sm border border-[#d1e7dd] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d1fae5] border border-[#a7f3d0] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#064e3b]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold">Total Stock</p>
              <p className="text-xl font-black text-[#12352b]">{totalStockCount} units</p>
              <p className="text-[11px] text-[#64748b]">Across local network</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter / Control Bar ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 font-medium text-neutral-800 focus:outline-none"
            >
              <option value="price_asc">Price: Lowest to Highest</option>
              <option value="distance">Distance: Nearest First</option>
              <option value="stock">Stock: Highest Available</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 font-medium">
              <input
                type="checkbox"
                checked={filterInStockOnly}
                onChange={(e) => setFilterInStockOnly(e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              Show In-Stock Only
            </label>

            <span className="text-neutral-300">|</span>
            <span className="text-neutral-500">
              Showing <strong>{comparisonList.length}</strong> pharmacies
            </span>
          </div>
        </div>
      </div>

      {/* ── Comparison Table (Reference Page 7 style) ──────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="card border border-neutral-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50/80 border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Pharmacy</th>
                  <th className="py-3.5 px-4 font-bold">Stock Status</th>
                  <th className="py-3.5 px-4 font-bold">Price / Strip</th>
                  <th className="py-3.5 px-4 font-bold">Distance</th>
                  <th className="py-3.5 px-4 font-bold">Updated</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {comparisonList.map((ph) => {
                  const isBestPrice = ph.price === bestPriceItem?.price && ph.status !== 'OUT_OF_STOCK';

                  return (
                    <tr key={ph.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Pharmacy Info */}
                      <td className="py-4 px-4 min-w-[240px]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Store className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                to={`/pharmacies/${ph.id}`}
                                className="font-bold text-neutral-900 hover:text-primary-600 transition-colors"
                              >
                                {ph.name}
                              </Link>
                              {ph.verified && <VerifiedBadge />}
                              <OpenBadge isOpen={ph.open} />
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{ph.address}</p>
                            {ph.phone && (
                              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {ph.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {ph.status === 'AVAILABLE' && (
                          <div>
                            <span className="badge-available text-xs font-semibold">In Stock</span>
                            <p className="text-xs text-neutral-500 mt-0.5">{ph.quantity} units ready</p>
                          </div>
                        )}
                        {ph.status === 'LOW_STOCK' && (
                          <div>
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200">
                              Low Stock ({ph.quantity} left)
                            </span>
                            <p className="text-xs text-amber-600 mt-0.5">Hurry, limited</p>
                          </div>
                        )}
                        {ph.status === 'OUT_OF_STOCK' && (
                          <div>
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold ring-1 ring-red-200">
                              Out of Stock
                            </span>
                            <p className="text-xs text-neutral-400 mt-0.5">Restock expected soon</p>
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-extrabold text-neutral-900">₹{ph.price}</span>
                          {isBestPrice && (
                            <span className="text-[10px] uppercase font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                              Best
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400">incl. all taxes</span>
                      </td>

                      {/* Distance */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100">
                          📍 {ph.distance}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-400">
                        {ph.lastUpdated}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={ph.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${ph.lat},${ph.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
                            title="Directions"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </a>

                          {ph.phone && (
                            <a
                              href={`tel:${ph.phone}`}
                              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                              title="Call Pharmacy"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => openReserve(ph)}
                            disabled={ph.status === 'OUT_OF_STOCK'}
                            className={`btn-primary text-xs py-1.5 px-3 ${
                              ph.status === 'OUT_OF_STOCK' ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                          >
                            Reserve
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Reservation Modal ───────────────────────────────────────── */}
      {reserveModalOpen && selectedPharmacy && (
        <Modal
          isOpen={reserveModalOpen}
          onClose={() => setReserveModalOpen(false)}
          title={confirmedCode ? 'Reservation Confirmed!' : `Reserve at ${selectedPharmacy.name}`}
        >
          {confirmedCode ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Your Medicine is Held!</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Show this code to the pharmacist at {selectedPharmacy.name} within 2 hours.
                </p>
              </div>

              <div className="bg-neutral-50 border-2 border-dashed border-primary-300 rounded-2xl p-4 my-2">
                <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">Pickup Code</p>
                <p className="text-3xl font-black text-primary-600 tracking-widest">{confirmedCode}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {reserveQty}x {activeMedicine.name} ({activeMedicine.strength}) · Total: ₹{selectedPharmacy.price * reserveQty}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={selectedPharmacy.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 py-2.5 text-xs text-center flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get Directions
                </a>
                <Button variant="secondary" onClick={() => setReserveModalOpen(false)} className="flex-1 py-2.5 text-xs">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-neutral-900">{activeMedicine.name} {activeMedicine.strength}</p>
                  <p className="text-xs text-neutral-500">{activeMedicine.dosageForm} · {selectedPharmacy.name}</p>
                </div>
                <p className="text-base font-bold text-primary-600">₹{selectedPharmacy.price} / strip</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Select Quantity (Strips):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((q) => (
                    <button
                      key={q}
                      onClick={() => setReserveQty(q)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        reserveQty === q
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Total payable at counter:</span>
                <span className="text-lg font-black text-neutral-900">₹{selectedPharmacy.price * reserveQty}</span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Free hold for 2 hours. Pay directly at the pharmacy when picking up. No upfront payment required.
              </p>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={() => setReserveModalOpen(false)} className="flex-1 text-xs py-2">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmReservation} className="flex-1 text-xs py-2">
                  Confirm Hold
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
};

export default MedicineComparisonPage;
