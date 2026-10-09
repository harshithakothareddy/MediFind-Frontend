import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Store, MapPin, Phone, Mail, Clock, ShieldCheck, Star,
  Search, Pill, CheckCircle, Navigation, ExternalLink,
  Calendar, FileText, AlertCircle, ArrowLeft, Heart, Share2,
  Truck, Award, ShieldAlert
} from 'lucide-react';
import { DEMO_PHARMACIES, OPERATING_DAYS } from '../../constants/demoData';
import { AvailabilityBadge, VerifiedBadge, OpenBadge } from '../../components/common/Badges';
import RealMap from '../../components/common/RealMap';
import MapPlaceholder from '../../components/common/MapPlaceholder';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { pharmacyService } from '../../api/pharmacyService';
import { alertService } from '../../api/alertService';
import { reservationService } from '../../api/reservationService';
import PharmacyReviews from '../../components/common/PharmacyReviews';

const PharmacyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pharmacyId = parseInt(id, 10);

  const initialPh = DEMO_PHARMACIES.find(p => p.id === pharmacyId) || DEMO_PHARMACIES[0];
  const [pharmacy, setPharmacy] = useState(initialPh);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isSaved, setIsSaved] = useState(false);

  // Reservation modal state
  const [reserveMed, setReserveMed] = useState(null);
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [reservationCode, setReservationCode] = useState('');

  const [pharmacyInventory, setPharmacyInventory] = useState([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);

  React.useEffect(() => {
    pharmacyService.getById(pharmacyId)
      .then(res => {
        const d = res.data?.data || res.data;
        if (d && d.name) {
          setPharmacy(prev => ({
            ...prev,
            ...d,
            rating: d.rating || prev.rating,
            totalReviews: d.totalReviews || prev.totalReviews,
            verified: d.verified ?? prev.verified,
            open: d.open24Hours ?? prev.open,
            phone: d.phone || prev.phone,
            address: d.address || prev.address,
            area: d.area || prev.area,
          }));
        }
      })
      .catch(() => {});

    pharmacyService.getInventory(pharmacyId)
      .then(res => {
        const payload = res.data?.content || res.data?.items || res.data?.data || res.data;
        const mapped = Array.isArray(payload) ? payload.map((inv, index) => {
          const expired = inv.expiryDate && inv.expiryDate < new Date().toISOString().slice(0, 10);
          return {
            id: inv.medicine?.id || inv.id,
            medicineId: inv.medicine?.id || inv.id,
            inventoryId: inv.id,
            name: inv.medicine?.name || 'Medicine',
            genericName: inv.medicine?.genericName || '',
            category: inv.medicine?.category || 'General',
            strength: inv.medicine?.strength || '',
            dosageForm: inv.medicine?.dosageForm || 'Tablet',
            status: expired ? 'OUT_OF_STOCK' : inv.availabilityStatus === 'IN_STOCK' ? 'AVAILABLE' : (inv.availabilityStatus || 'AVAILABLE'),
            quantity: expired ? 0 : inv.stockQuantity ?? 50,
            price: inv.price ? Number(inv.price) : 25 + index * 5,
            lastUpdated: inv.lastUpdatedAt || new Date().toISOString(),
          };
        }) : [];
        setPharmacyInventory(mapped);
      })
      .catch(() => setPharmacyInventory([]))
      .finally(() => setIsInventoryLoading(false));
  }, [pharmacyId]);

  const filteredInventory = pharmacyInventory.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...new Set(pharmacyInventory.map(item => item.category))];

  const handleStartReserve = (med) => {
    setReserveMed(med);
    setIsConfirmed(false);
    setReserveQuantity(1);
    setIsReserveModalOpen(true);
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    try {
      const response = await reservationService.create({
        inventoryId: reserveMed.inventoryId,
        quantity: reserveQuantity,
      });
      setReservationCode(response.data?.reservationCode);
      setIsConfirmed(true);
      toast.success('Pickup hold confirmed.');
    } catch (error) {
      toast.error(error.message || 'Could not reserve this medicine.');
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 font-medium transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span>/</span>
            <Link to="/pharmacies" className="hover:text-primary-600 transition-colors">Pharmacies</Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">{pharmacy.name}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setIsSaved(!isSaved);
                toast.success(!isSaved ? 'Pharmacy added to favorites' : 'Removed from favorites');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                isSaved
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Favorited' : 'Favorite'}
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.info('Pharmacy link copied!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Pharmacy Profile Header */}
        <div className="card p-6 sm:p-8 border border-neutral-200 shadow-sm bg-white">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <Store className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                    {pharmacy.name}
                  </h1>
                  {pharmacy.verified && <VerifiedBadge />}
                  <OpenBadge isOpen={pharmacy.open} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <strong>{Number(pharmacy.rating || 0).toFixed(1)}</strong> ({pharmacy.totalReviews || 0} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-neutral-400" /> {pharmacy.address} ({pharmacy.distance})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-500 pt-1">
                  <span className="flex items-center gap-1 text-primary-600 font-medium">
                    <Phone className="w-4 h-4" /> {pharmacy.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-neutral-600">
                    <Clock className="w-4 h-4" /> Hours: {pharmacy.operatingHours}
                  </span>
                  <span>•</span>
                  <span className="text-neutral-500">License: DL-DL2024-00892B</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href={`tel:${pharmacy.phone}`}
                className="btn-secondary flex-1 sm:flex-initial py-2.5 px-4 text-sm"
              >
                <Phone className="w-4 h-4" /> Call Pharmacy
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' ' + pharmacy.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 sm:flex-initial py-2.5 px-4 text-sm"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
            </div>
          </div>

          {/* Value Badges */}
          <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <ShieldCheck className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <span className="text-xs font-semibold text-neutral-900 block">Licensed Vendor</span>
              <span className="text-[11px] text-neutral-500">Verified by Govt. Health Dept</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <Clock className="w-5 h-5 text-primary-600 mx-auto mb-1" />
              <span className="text-xs font-semibold text-neutral-900 block">Fast 3-Hr Hold</span>
              <span className="text-[11px] text-neutral-500">Instant pickup reservation</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <Truck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <span className="text-xs font-semibold text-neutral-900 block">Local Delivery</span>
              <span className="text-[11px] text-neutral-500">Available within 5 km radius</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <span className="text-xs font-semibold text-neutral-900 block">99.4% Stock Sync</span>
              <span className="text-[11px] text-neutral-500">Hourly automated POS sync</span>
            </div>
          </div>
        </div>

        {/* Operating Hours & Location Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Operating Hours Card */}
          <div className="card p-6 border border-neutral-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" /> Weekly Operating Hours
            </h3>
            <div className="divide-y divide-neutral-100 text-sm">
              {OPERATING_DAYS.map((day) => (
                <div key={day.key} className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-neutral-700">{day.label}</span>
                  <span className="text-neutral-500 font-mono text-xs">
                    {pharmacy.operatingHours.includes('24 Hours') ? 'Open 24 Hours' : pharmacy.operatingHours}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Emergency medicine dispensary assistance available.</span>
            </div>
          </div>

          {/* Interactive Map Box */}
          <div className="lg:col-span-2 card p-6 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" /> Geographic Location & Map
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">{pharmacy.address}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((pharmacy.name || '') + ' ' + (pharmacy.address || ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-teal-600" /> Open in Google Maps
              </a>
            </div>
            <div className="h-72 rounded-xl overflow-hidden border border-neutral-200 relative shadow-inner bg-neutral-100">
              <RealMap
                pharmacies={[{
                  ...pharmacy,
                  id: pharmacy.id,
                  name: pharmacy.name,
                  address: pharmacy.address,
                  lat: Number(pharmacy.latitude || 17.4435),
                  lng: Number(pharmacy.longitude || 78.3772),
                  latitude: Number(pharmacy.latitude || 17.4435),
                  longitude: Number(pharmacy.longitude || 78.3772),
                  open: pharmacy.open ?? true,
                }]}
                selectedId={pharmacy.id}
                height="100%"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Live GPS Pin ({Number(pharmacy.latitude || 17.4435).toFixed(4)}, {Number(pharmacy.longitude || 78.3772).toFixed(4)})
              </span>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${Number(pharmacy.latitude || 17.4435)},${Number(pharmacy.longitude || 78.3772)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
              >
                Get Turn-by-Turn Directions <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Pharmacy In-Stock Inventory Section */}
        <div className="card border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-neutral-200 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary-600" /> In-Store Medicine Catalog
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Browse and reserve available medicines directly from {pharmacy.name}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-semibold">
                {filteredInventory.length} Medicines Listed
              </span>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search medicines in this pharmacy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 text-sm"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input sm:w-60 text-sm"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="py-3 px-5 font-semibold">Medicine</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Unit Price</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold">Updated</th>
                  <th className="py-3 px-5 text-right font-semibold">Reserve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <Link
                        to={`/medicines/${item.id}`}
                        className="font-bold text-neutral-900 hover:text-primary-600 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-neutral-500 block">
                        {item.genericName} • {item.strength} ({item.dosageForm})
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-600">
                      {item.category}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <AvailabilityBadge status={item.status} />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap font-bold text-neutral-900">
                      {formatPrice(item.price)}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-500">
                      {item.quantity > 0 ? `${item.quantity} available` : 'Out of Stock'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-500">
                      {item.lastUpdated ? timeAgo(item.lastUpdated) : 'Not confirmed'}
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      {item.status !== 'OUT_OF_STOCK' ? (
                        <button
                          onClick={() => handleStartReserve(item)}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          Reserve
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await alertService.create({ medicineId: item.medicineId });
                              toast.success('Restock alert created.');
                            } catch (error) {
                              toast.error(error.message || 'Sign in to create a restock alert.');
                            }
                          }}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Notify Me
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {isInventoryLoading && <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-500">Loading pharmacy inventory…</td></tr>}
                {!isInventoryLoading && filteredInventory.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-500">No pharmacy stock matches this search.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <PharmacyReviews
          pharmacyId={pharmacyId}
          onReviewsChanged={(reviews) => setPharmacy((current) => ({
            ...current,
            totalReviews: reviews.length,
            rating: reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0,
          }))}
        />
      </div>

      {/* Reservation Modal */}
      {reserveMed && (
        <Modal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          title={isConfirmed ? "Reservation Confirmed!" : `Reserve ${reserveMed.name}`}
          size="md"
        >
          {isConfirmed ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Held for 3 Hours!</h3>
              <p className="text-sm text-neutral-600">
                Your reservation at <strong>{pharmacy.name}</strong> is active.
              </p>

              <div className="p-4 bg-neutral-100 rounded-xl border border-dashed border-neutral-300">
                <span className="text-xs text-neutral-500 block uppercase font-medium">Pickup Token</span>
                <span className="text-2xl font-mono font-bold tracking-widest text-primary-700">{reservationCode}</span>
                <span className="text-xs text-neutral-500 block mt-1">Present this code at pickup desk</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setIsReserveModalOpen(false)}>
                  Close
                </Button>
                <Button variant="primary" className="flex-1" onClick={() => navigate('/user/reservations')}>
                  View My Reservations
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmReservation} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-sm">
                <h4 className="font-bold text-teal-900">{reserveMed.name} ({reserveMed.strength})</h4>
                <p className="text-xs text-teal-700">{reserveMed.dosageForm} • Unit Price: {formatPrice(reserveMed.price)}</p>
              </div>

              <Input
                label="Quantity Needed"
                type="number"
                min="1"
                max={Math.min(reserveMed.quantity, 10)}
                value={reserveQuantity}
                onChange={(e) => setReserveQuantity(parseInt(e.target.value, 10) || 1)}
                helperText={`Available in store: ${reserveMed.quantity} units`}
                required
              />

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
                <strong className="block text-neutral-900 font-semibold">Store Address:</strong>
                <p>{pharmacy.address}</p>
                <p><strong>Phone:</strong> {pharmacy.phone}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsReserveModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm Reservation ({formatPrice(reserveMed.price * reserveQuantity)})
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PharmacyDetailPage;
