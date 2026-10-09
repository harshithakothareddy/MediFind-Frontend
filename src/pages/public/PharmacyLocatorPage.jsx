import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store, MapPin, Phone, Clock, Star, Search, Navigation,
  LayoutGrid, List, Map as MapIcon, Loader2, AlertCircle, LocateFixed,
  Globe, Check, X, Compass
} from 'lucide-react';
import { VerifiedBadge, OpenBadge } from '../../components/common/Badges';
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchNearbyPharmacies, reverseGeocode, geocodeAddress } from '../../api/osmService';
import { pharmacyService } from '../../api/pharmacyService';

// Lazy-load Leaflet map
const RealMap = lazy(() => import('../../components/common/RealMap'));

const POPULAR_LOCATIONS = [
  { name: 'Hyderabad (Hitech City)', short: 'Hitech City', lat: 17.4435, lng: 78.3772 },
  { name: 'Hyderabad (Madhapur)', short: 'Madhapur', lat: 17.4483, lng: 78.3915 },
  { name: 'Hyderabad (Banjara Hills)', short: 'Banjara Hills', lat: 17.4156, lng: 78.4350 },
  { name: 'Bengaluru (Koramangala)', short: 'Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'Mumbai (Bandra)', short: 'Mumbai', lat: 19.0596, lng: 72.8295 },
  { name: 'Delhi (Connaught Place)', short: 'Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Chennai (T. Nagar)', short: 'Chennai', lat: 13.0418, lng: 80.2341 },
];

function calcDistance(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDist(d) {
  if (d < 1) return `${Math.round(d * 1000)} m`;
  return `${d.toFixed(1)} km`;
}

function normalizePharmacyName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isDuplicatePharmacy(first, second) {
  const firstName = normalizePharmacyName(first.name);
  const secondName = normalizePharmacyName(second.name);
  if (!firstName || !secondName) return false;

  const namesMatch = firstName === secondName || firstName.includes(secondName) || secondName.includes(firstName);
  return namesMatch && calcDistance(first.lat, first.lng, second.lat, second.lng) <= 0.1;
}

function mapBackendPharmacies(records, lat, lng, radiusKm) {
  return records.map(pharmacy => {
    const rawLat = pharmacy.latitude ?? pharmacy.lat;
    const rawLng = pharmacy.longitude ?? pharmacy.lng;
    const pharmacyLat = rawLat == null ? NaN : Number(rawLat);
    const pharmacyLng = rawLng == null ? NaN : Number(rawLng);
    const distanceVal = calcDistance(lat, lng, pharmacyLat, pharmacyLng);

    return {
      ...pharmacy,
      lat: pharmacyLat,
      lng: pharmacyLng,
      distance: distanceVal,
      distanceVal,
      distanceText: Number.isFinite(distanceVal) ? formatDist(distanceVal) : 'Distance unavailable',
      open: getPharmacyOpenStatus(pharmacy),
      source: 'MediFind',
      directionsUrl: Number.isFinite(pharmacyLat) && Number.isFinite(pharmacyLng)
        ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacyLat},${pharmacyLng}`
        : undefined,
    };
  }).filter(pharmacy => pharmacy.distanceVal <= radiusKm);
}

function mergePharmacyListings(backendPharmacies, mapPharmacies) {
  const merged = [...backendPharmacies];
  mapPharmacies.forEach(pharmacy => {
    if (!merged.some(existing => isDuplicatePharmacy(existing, pharmacy))) {
      merged.push({
        ...pharmacy,
        operatingHours: pharmacy.openingHours,
        source: 'OpenStreetMap',
        externalListing: true,
        verified: false,
        rating: null,
      });
    }
  });
  return merged.sort((a, b) => a.distanceVal - b.distanceVal);
}

function formatOperatingHours(pharmacy) {
  if (pharmacy.open24Hours) return 'Open 24 Hours';
  if (typeof pharmacy.operatingHours === 'string' && pharmacy.operatingHours.trim()) {
    return pharmacy.operatingHours;
  }

  if (Array.isArray(pharmacy.operatingHours)) {
    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toUpperCase();
    const todayHours = pharmacy.operatingHours.find(entry => entry?.dayOfWeek?.toUpperCase() === todayName);
    if (todayHours?.closed) return 'Closed today';
    if (todayHours?.openTime && todayHours?.closeTime) {
      return `${todayHours.openTime.slice(0, 5)} - ${todayHours.closeTime.slice(0, 5)}`;
    }
    if (pharmacy.operatingHours.length > 0) return "Today's hours not listed";
  }

  return pharmacy.externalListing ? 'Hours not listed by map source' : 'Hours not listed';
}

function getPharmacyOpenStatus(pharmacy) {
  if (pharmacy.open24Hours) return true;
  if (typeof pharmacy.open === 'boolean') return pharmacy.open;
  if (!Array.isArray(pharmacy.operatingHours)) return null;

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toUpperCase();
  const todayHours = pharmacy.operatingHours.find(entry => entry?.dayOfWeek?.toUpperCase() === today);
  if (!todayHours) return null;
  if (todayHours.closed) return false;
  if (!todayHours.openTime || !todayHours.closeTime) return null;

  const [openHour, openMinute] = todayHours.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openingMinutes = openHour * 60 + openMinute;
  const closingMinutes = closeHour * 60 + closeMinute;
  return closingMinutes < openingMinutes
    ? currentMinutes >= openingMinutes || currentMinutes < closingMinutes
    : currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
}

// ── Pharmacy Card (Grid / Map Panel) ──────────────────────────────────────────
const PharmacyCard = ({ pharmacy, selected, onClick }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => onClick(pharmacy)}
      className={`card p-5 cursor-pointer transition-all border ${
        selected
          ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md bg-primary-50/20'
          : 'border-neutral-200 hover:border-primary-300 hover:shadow-card-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div style={{background:'linear-gradient(135deg,#d1fae5,#f0fdf4)',border:'1px solid #a7f3d0'}} className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" style={{color:'#059669'}} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-neutral-900 leading-tight truncate">{pharmacy.name}</h3>
            {pharmacy.brand && <p className="text-xs font-medium" style={{color:'#059669'}}>{pharmacy.brand}</p>}
            {pharmacy.externalListing && <p className="text-[10px] text-neutral-400">Local map listing</p>}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          {pharmacy.verified && <VerifiedBadge />}
          <OpenBadge isOpen={pharmacy.open} />
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-neutral-500 mb-3">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{pharmacy.address}</span>
        </div>
        {pharmacy.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <a
              href={`tel:${pharmacy.phone}`}
              className="hover:text-primary-600 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {pharmacy.phone}
            </a>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate">{formatOperatingHours(pharmacy)}</span>
        </div>
      </div>

      {pharmacy.services && pharmacy.services.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {pharmacy.services.slice(0, 2).map((srv, i) => (
            <span key={i} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-medium">
              {srv}
            </span>
          ))}
          {pharmacy.services.length > 2 && (
            <span className="text-[10px] bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded-md">
              +{pharmacy.services.length - 2}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{color:'#059669',background:'#f0fdf4',border:'1px solid #d1fae5'}}>
            📍 {pharmacy.distanceText || (pharmacy.distance ? `${pharmacy.distance}` : 'Nearby')}
          </span>
          {pharmacy.rating != null ? (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-neutral-700">{pharmacy.rating}</span>
            </div>
          ) : <span className="text-xs text-neutral-400">Unrated</span>}
        </div>

        <div className="flex items-center gap-1.5">
          {!pharmacy.externalListing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/pharmacies/${pharmacy.id}`);
              }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors" style={{color:'#059669'}}
            >
              Details
            </button>
          )}
          <a
            href={pharmacy.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
            title="Directions"
          >
            <Navigation className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ── List Row ──────────────────────────────────────────────────────────────────
const PharmacyRow = ({ pharmacy, selected, onClick }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => onClick(pharmacy)}
      className={`p-4 hover:bg-neutral-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        selected ? 'bg-primary-50/40 border-l-4 border-primary-500' : ''
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{background:'#d1fae5',border:'1px solid #a7f3d0'}}>
          <Store className="w-5 h-5" style={{color:'#059669'}} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-neutral-900 text-sm">{pharmacy.name}</span>
            {pharmacy.verified && <VerifiedBadge />}
            {pharmacy.externalListing && <span className="text-[10px] text-neutral-400">Local listing</span>}
            <OpenBadge isOpen={pharmacy.open} />
            <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{color:'#059669',background:'#f0fdf4'}}>
              📍 {pharmacy.distanceText || (pharmacy.distance ? `${pharmacy.distance}` : 'Nearby')}
            </span>
          </div>
          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{pharmacy.address}</span>
          </p>
          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatOperatingHours(pharmacy)}
            </span>
            <span>•</span>
            {pharmacy.rating != null && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <strong className="text-neutral-700">{pharmacy.rating}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/pharmacies/${pharmacy.id}`);
          }}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          View Store
        </button>
        <a
          href={pharmacy.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
        >
          <Navigation className="w-3.5 h-3.5" /> Directions
        </a>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const PharmacyLocatorPage = () => {
  const navigate = useNavigate();

  // Active user location coordinates (default to Hitech City, Hyderabad)
  const [activeCoords, setActiveCoords] = useState({ lat: 17.4435, lng: 78.3772 });
  const [locationName, setLocationName] = useState('Hyderabad (Hitech City)');
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'OPEN' | '24_HOURS' | 'VERIFIED'
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'grid' | 'list'
  const [radiusKm, setRadiusKm] = useState(10);

  // Pharmacy items state
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [pharmacyError, setPharmacyError] = useState(null);
  const [sourceWarning, setSourceWarning] = useState(null);
  const pharmacyRequestId = useRef(0);

  // GPS hook
  const { coords: gpsCoords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  // Combine registered records with nearby local pharmacy listings.
  const loadPharmaciesForCoords = useCallback(async (lat, lng, requestedRadius = radiusKm) => {
    const requestId = pharmacyRequestId.current + 1;
    pharmacyRequestId.current = requestId;
    setLoadingPharmacies(true);
    setPharmacyError(null);
    setSourceWarning(null);

    try {
      const fetchBackendPharmacies = async () => {
        const results = [];
        const pageSize = 100;
        let page = 0;
        let totalPages = 1;

        while (page < totalPages) {
          const response = await pharmacyService.getAll({ page, size: pageSize });
          const payload = response.data;
          const pageItems = Array.isArray(payload) ? payload : payload?.content || payload?.items || [];
          results.push(...pageItems);
          totalPages = Array.isArray(payload) ? 1 : Number(payload?.totalPages) || 1;
          page += 1;
        }

        return results;
      };

      const mapPromise = fetchNearbyPharmacies(lat, lng, requestedRadius * 1000)
        .then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason }));
      const backendResult = await fetchBackendPharmacies()
        .then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason }));
      if (requestId !== pharmacyRequestId.current) return;

      const backendPharmacies = backendResult.status === 'fulfilled'
        ? mapBackendPharmacies(backendResult.value, lat, lng, requestedRadius)
        : [];
      setPharmacies(backendPharmacies);
      setSelectedPharmacy(null);

      if (backendResult.status === 'rejected') {
        setSourceWarning('MediFind listings are unavailable; searching nearby map listings.');
      }

      const mapResult = await mapPromise;
      if (requestId !== pharmacyRequestId.current) return;
      if (backendResult.status === 'rejected' && mapResult.status === 'rejected') {
        throw new Error('Could not load pharmacy listings. Check your connection and retry.');
      }

      if (mapResult.status === 'rejected') {
        setSourceWarning('Nearby map listings are unavailable; showing registered MediFind pharmacies.');
      } else {
        setSourceWarning(backendResult.status === 'rejected' ? 'MediFind listings are unavailable; showing nearby map listings.' : null);
        setPharmacies(mergePharmacyListings(backendPharmacies, mapResult.value));
      }
    } catch (error) {
      if (requestId !== pharmacyRequestId.current) return;
      setPharmacies([]);
      setSelectedPharmacy(null);
      setPharmacyError(error?.message || 'Unable to load nearby pharmacies from the server.');
    } finally {
      if (requestId === pharmacyRequestId.current) setLoadingPharmacies(false);
    }
  }, [radiusKm]);

  // Initial load
  useEffect(() => {
    loadPharmaciesForCoords(activeCoords.lat, activeCoords.lng);
  }, []);

  // React to GPS coordinate detection
  useEffect(() => {
    if (gpsCoords) {
      setActiveCoords(gpsCoords);
      reverseGeocode(gpsCoords.lat, gpsCoords.lng).then(name => {
        const readable = name ? name.split(',').slice(0, 2).join(', ') : 'Your Current Location';
        setLocationName(readable);
        loadPharmaciesForCoords(gpsCoords.lat, gpsCoords.lng);
      });
    }
  }, [gpsCoords, loadPharmaciesForCoords]);

  // Handle custom location search submission
  const handleCustomLocationSubmit = async (e) => {
    e?.preventDefault();
    if (!customLocationInput.trim()) return;

    setIsSearchingLocation(true);
    setLocationError(null);

    // Check if matches preset
    const match = POPULAR_LOCATIONS.find(
      p => p.name.toLowerCase().includes(customLocationInput.toLowerCase()) ||
           p.short.toLowerCase().includes(customLocationInput.toLowerCase())
    );

    if (match) {
      setActiveCoords({ lat: match.lat, lng: match.lng });
      setLocationName(match.name);
      loadPharmaciesForCoords(match.lat, match.lng);
      setCustomLocationInput('');
      setIsSearchingLocation(false);
      return;
    }

    try {
      const geocoded = await geocodeAddress(customLocationInput.trim());
      if (geocoded && geocoded.length > 0) {
        const top = geocoded[0];
        const newCoords = { lat: top.lat, lng: top.lng };
        const label = top.displayName.split(',').slice(0, 2).join(', ');

        setActiveCoords(newCoords);
        setLocationName(label);
        loadPharmaciesForCoords(top.lat, top.lng);
        setCustomLocationInput('');
      } else {
        setLocationError(`Could not find "${customLocationInput}". Showing default location.`);
      }
    } catch {
      setLocationError('Error finding location. Please try another area or city.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectPreset = (loc) => {
    setActiveCoords({ lat: loc.lat, lng: loc.lng });
    setLocationName(loc.name);
    loadPharmaciesForCoords(loc.lat, loc.lng);
  };

  const handleMapLocationSelect = useCallback(({ lat, lng }) => {
    setActiveCoords({ lat, lng });
    setLocationName(`Map location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    setSelectedPharmacy(null);
    setLocationError(null);
    loadPharmaciesForCoords(lat, lng);
  }, [loadPharmaciesForCoords]);

  // Filtered pharmacies list
  const filteredPharmacies = pharmacies.filter(ph => {
    const matchesSearch = !searchQuery ||
      ph.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ph.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ph.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ph.area?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'OPEN') return ph.open;
    if (filterType === '24_HOURS') return ph.open24Hours;
    if (filterType === 'VERIFIED') return ph.verified;

    return true;
  });

  return (
    <div className="bg-[#f0fdf4] min-h-screen pb-20">

      {/* ── Top Header ───────────────────────── */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#047857] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#022c22]/40 border border-[#a7f3d0]/30 text-[#d1fae5] text-xs font-semibold">
              <Store className="w-3.5 h-3.5 text-[#a7f3d0]" /> MediFind Pharmacy Network & Locator
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#022c22]/40 border border-[#a7f3d0]/30 text-xs text-[#d1fae5] font-medium">
              <Store className="w-3 h-3 text-[#a7f3d0]" /> MediFind + local map listings
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Pharmacies & Availability Locator
              </h1>
              <p className="text-[#d1fae5] max-w-2xl text-sm sm:text-base mt-1">
                Explore verified pharmacies, check real-time stock, get driving directions, and view operating hours.
              </p>
            </div>

            {/* Current Active Location Pill */}
            <div className="bg-[#022c22]/40 backdrop-blur-md border border-[#a7f3d0]/30 rounded-2xl p-3 px-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#059669]/30 border border-[#a7f3d0]/40 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#a7f3d0]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#a7f3d0] font-bold">Active Location</p>
                <p className="text-sm font-bold text-white truncate max-w-[200px]">{locationName}</p>
              </div>
            </div>
          </div>

          {/* ── Location Input & Quick Select Bar ─────────────────── */}
          <div className="bg-[#022c22]/30 backdrop-blur-md border border-[#a7f3d0]/20 rounded-2xl p-4 mt-4">
            <p className="text-xs font-semibold text-primary-200 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#a7f3d0]" /> Set or Change Your Location to See Nearby Pharmacies:
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Custom Location Search */}
              <form onSubmit={handleCustomLocationSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customLocationInput}
                    onChange={(e) => setCustomLocationInput(e.target.value)}
                    placeholder="Enter area, locality, or city (e.g. Madhapur, Mumbai, Bengaluru)..."
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white text-neutral-900 placeholder:text-neutral-400 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingLocation}
                  style={{ background: '#059669' }}
                  onMouseOver={e => e.currentTarget.style.background='#047857'}
                  onMouseOut={e => e.currentTarget.style.background='#059669'}
                  className="h-11 px-5 text-white font-bold rounded-xl transition-all shadow text-xs sm:text-sm flex items-center gap-1.5 shrink-0"
                >
                  {isSearchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Location'}
                </button>
              </form>

              {/* GPS Button */}
              <button
                onClick={requestLocation}
                disabled={geoLoading}
                className="h-11 px-4 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shrink-0"
                title="Detect GPS Location"
              >
                {geoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#a7f3d0]" />
                ) : (
                  <LocateFixed className="w-4 h-4 text-[#a7f3d0]" />
                )}
                <span>Use My GPS</span>
              </button>
            </div>

            {(locationError || geoError) && (
              <p className="mt-2 text-xs text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {locationError || geoError}
              </p>
            )}

            {/* Quick Location Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/10">
              <span className="text-[11px] text-primary-200 mr-1 font-medium">Quick Select:</span>
              {POPULAR_LOCATIONS.map((loc) => {
                const isCurrent = locationName.includes(loc.short);
                return (
                  <button
                    key={loc.name}
                    onClick={() => handleSelectPreset(loc)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-[#a7f3d0] text-neutral-900 font-bold shadow-xs'
                        : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {isCurrent && <Check className="w-3 h-3 text-neutral-900" />}
                    {loc.short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Control Bar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">

          {/* Left: Search input inside control bar */}
          <div className="flex-1 min-w-[220px] max-w-md relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharmacies by name, brand, or area..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-100 rounded-lg border border-neutral-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Center: Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'OPEN', label: 'Open Now' },
              { id: '24_HOURS', label: '24/7 Service' },
              { id: 'VERIFIED', label: 'Verified' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === f.id
                    ? 'text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                style={filterType === f.id ? { background: '#059669' } : {}}
              >
                {f.label}
              </button>
            ))}

            <label className="flex items-center gap-2 text-neutral-600">
              Within
              <select
                value={radiusKm}
                onChange={(event) => {
                  const nextRadius = Number(event.target.value);
                  setRadiusKm(nextRadius);
                  loadPharmaciesForCoords(activeCoords.lat, activeCoords.lng, nextRadius);
                }}
                className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium"
                aria-label="Nearby search radius"
              >
                {[5, 10, 20, 50].map(radius => <option key={radius} value={radius}>{radius} km</option>)}
              </select>
            </label>
            <span className="text-neutral-500">Pharmacies and chemists, sorted by distance</span>
            <span className="text-neutral-400 mx-1">|</span>
            <span className="text-neutral-500 font-medium inline-flex items-center">
              {loadingPharmacies ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" /> Searching…
                </>
              ) : (
                <><strong>{filteredPharmacies.length}</strong>&nbsp;pharmacies found</>
              )}
            </span>
          </div>

          {/* Right: View Switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            {[
              { key: 'map',  label: 'Map View',  Icon: MapIcon  },
              { key: 'grid', label: 'Grid',      Icon: LayoutGrid },
              { key: 'list', label: 'List',      Icon: List },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === key ? 'bg-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
                style={viewMode === key ? {color:'#047857'} : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {pharmacyError && (
          <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{pharmacyError}</span>
            <button
              onClick={() => loadPharmaciesForCoords(activeCoords.lat, activeCoords.lng)}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {sourceWarning && (
          <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {sourceWarning}
          </div>
        )}

        {/* MAP VIEW (Reference Page 6 style) */}
        {viewMode === 'map' && (
          <div className="flex flex-col lg:flex-row gap-5 h-auto lg:h-[700px]">
            {/* List panel */}
            <div className="lg:w-80 xl:w-96 overflow-y-auto space-y-3.5 pr-1 lg:h-full shrink-0">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Nearby List ({filteredPharmacies.length})
                </span>
                <span className="text-xs text-neutral-400">Sorted by distance</span>
              </div>

              {filteredPharmacies.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200">
                  <Store className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-700">No pharmacies found</p>
                  <p className="text-xs text-neutral-400 mt-1">Try resetting the filter or search term</p>
                </div>
              ) : (
                filteredPharmacies.map(ph => (
                  <PharmacyCard
                    key={ph.id}
                    pharmacy={ph}
                    selected={selectedPharmacy?.id === ph.id}
                    onClick={setSelectedPharmacy}
                  />
                ))
              )}
            </div>

            {/* Interactive Leaflet Map */}
            <div className="flex-1 h-[480px] lg:h-full rounded-2xl overflow-hidden border border-neutral-200 shadow-card-sm relative">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center bg-neutral-100">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              }>
                <RealMap
                  userCoords={activeCoords}
                  pharmacies={filteredPharmacies}
                  selectedId={selectedPharmacy?.id}
                  onSelect={setSelectedPharmacy}
                  onMapClick={handleMapLocationSelect}
                  height="100%"
                />
              </Suspense>

              {/* Selected pharmacy popup overlay */}
              {selectedPharmacy && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-neutral-200 shadow-xl max-w-sm z-[1000]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm leading-tight">{selectedPharmacy.name}</h4>
                      <p className="text-xs font-semibold text-primary-600 mt-0.5">
                        📍 {selectedPharmacy.distanceText || 'Nearby'} away
                      </p>
                    </div>
                    <OpenBadge isOpen={selectedPharmacy.open} />
                  </div>
                  <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{selectedPharmacy.address}</p>
                  <div className="flex items-center gap-2">
                    {!selectedPharmacy.externalListing && (
                      <button
                        onClick={() => navigate(`/pharmacies/${selectedPharmacy.id}`)}
                        className="btn-primary text-xs py-1.5 px-3 flex-1 text-center"
                      >
                        Store Profile
                      </button>
                    )}
                    <a
                      href={selectedPharmacy.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Map
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GRID VIEW (Reference Page 4 style) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPharmacies.map(ph => (
              <PharmacyCard
                key={ph.id}
                pharmacy={ph}
                selected={selectedPharmacy?.id === ph.id}
                onClick={setSelectedPharmacy}
              />
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="card border border-neutral-200 shadow-sm divide-y divide-neutral-100 overflow-hidden">
            {filteredPharmacies.map(ph => (
              <PharmacyRow
                key={ph.id}
                pharmacy={ph}
                selected={selectedPharmacy?.id === ph.id}
                onClick={setSelectedPharmacy}
              />
            ))}
          </div>
        )}

        {/* Map / OSM Attribution */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-400 flex flex-wrap items-center justify-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary-600" />
          <span>Listings combine MediFind registrations with OpenStreetMap pharmacy and chemist data.</span>
        </div>

      </div>
    </div>
  );
};

export default PharmacyLocatorPage;
