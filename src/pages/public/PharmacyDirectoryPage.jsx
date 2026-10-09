import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, ChevronLeft, ChevronRight, Clock, Loader2, MapPin,
  Phone, Search, Star, Store
} from 'lucide-react';
import { pharmacyService } from '../../api/pharmacyService';
import { VerifiedBadge } from '../../components/common/Badges';

const PAGE_SIZE = 12;

const PharmacyDirectoryPage = () => {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPage = async (pageNumber = page) => {
    setLoading(true);
    setError('');
    try {
      const response = await pharmacyService.getAll({ page: pageNumber, size: PAGE_SIZE });
      const payload = response.data;
      const content = Array.isArray(payload) ? payload : payload?.content || payload?.items || [];
      setPharmacies(content);
      setTotalPages(payload?.totalPages || 0);
      setPage(payload?.page ?? pageNumber);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load pharmacies from the server.');
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(0);
  }, []);

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const query = searchQuery.trim().toLowerCase();
    return !query || [pharmacy.name, pharmacy.address, pharmacy.area, pharmacy.city]
      .some(value => value?.toLowerCase().includes(query));
  });

  return (
    <main className="min-h-screen bg-[#f0fdf4] pb-16">
      <header className="border-b border-[#d1e7dd] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#059669]">
                <Store className="h-4 w-4" /> MediFind directory
              </p>
              <h1 className="text-3xl font-bold text-[#12352b]">Pharmacies</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
                Browse registered pharmacies and open a profile for contact and availability details.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Filter this page by name or location"
                className="h-11 w-full rounded-lg border border-[#d1e7dd] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 text-[#12352b]"
                aria-label="Filter pharmacies on this page"
              />
            </label>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8" aria-live="polite">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-[#64748b]">
            {loading ? 'Loading pharmacies…' : `${filteredPharmacies.length} pharmacies on this page`}
          </p>
          {totalPages > 0 && <p className="text-sm text-[#64748b]">Page {page + 1} of {totalPages}</p>}
        </div>

        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span>
            <button onClick={() => loadPage(page)} className="font-semibold underline underline-offset-2">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-[#059669]">
            <Loader2 className="h-7 w-7 animate-spin" aria-label="Loading pharmacies" />
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="rounded-lg border border-[#d1e7dd] bg-white px-6 py-14 text-center">
            <Store className="mx-auto mb-3 h-9 w-9 text-neutral-300" />
            <h2 className="font-semibold text-[#12352b]">{searchQuery ? 'No pharmacies match this filter' : 'No pharmacies available'}</h2>
            <p className="mt-1 text-sm text-[#64748b]">{searchQuery ? 'Try another name or location.' : 'Pharmacy listings will appear here when available.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPharmacies.map(pharmacy => (
              <article key={pharmacy.id} className="rounded-lg border border-[#d1e7dd] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d1fae5] text-[#059669] border border-[#a7f3d0]">
                      <Store className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-[#12352b]">{pharmacy.name}</h2>
                      <p className="mt-1 text-sm text-[#64748b]">{[pharmacy.area, pharmacy.city].filter(Boolean).join(', ') || 'Location not listed'}</p>
                    </div>
                  </div>
                  {pharmacy.verified && <VerifiedBadge />}
                </div>

                <div className="mt-4 space-y-2 text-sm text-neutral-600">
                  <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" /><span>{pharmacy.address || 'Address not listed'}</span></p>
                  {pharmacy.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /><a className="hover:text-teal-700" href={`tel:${pharmacy.phone}`}>{pharmacy.phone}</a></p>}
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-neutral-400" />{pharmacy.open24Hours ? 'Open 24 hours' : 'Hours available in profile'}</p>
                  {pharmacy.rating != null && <p className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{pharmacy.rating}{pharmacy.totalReviews ? ` (${pharmacy.totalReviews} reviews)` : ''}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
                  className="mt-5 w-full rounded-lg border border-teal-700 px-3 py-2 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50"
                >
                  View pharmacy
                </button>
              </article>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pharmacy pages">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => loadPage(page - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-neutral-600">{page + 1} / {totalPages}</span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => loadPage(page + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </section>
    </main>
  );
};

export default PharmacyDirectoryPage;
