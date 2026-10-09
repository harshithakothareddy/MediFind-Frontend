import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store, MapPin, Phone, Clock, Star, Trash2,
  Navigation, ExternalLink, ShieldCheck
} from 'lucide-react';
import { DEMO_PHARMACIES } from '../../constants/demoData';
import { VerifiedBadge, OpenBadge } from '../../components/common/Badges';
import { toast } from 'react-toastify';

const SavedPharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState(DEMO_PHARMACIES.slice(0, 3));

  const handleRemove = (id, name) => {
    setPharmacies(prev => prev.filter(p => p.id !== id));
    toast.info(`${name} removed from favorites`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Preferred Pharmacies</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Your bookmarked neighborhood pharmacies for fast inventory queries and priority reservations
          </p>
        </div>

        <Link to="/pharmacies" className="btn-primary text-xs py-2 px-4">
          + Explore More Stores
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((pharmacy) => (
          <div key={pharmacy.id} className="card p-6 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4 bg-white">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  {pharmacy.verified && <VerifiedBadge />}
                  <OpenBadge isOpen={pharmacy.open} />
                </div>
              </div>

              <div>
                <Link
                  to={`/pharmacies/${pharmacy.id}`}
                  className="font-bold text-base text-neutral-900 hover:text-primary-600 transition-colors block"
                >
                  {pharmacy.name}
                </Link>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <strong>{pharmacy.rating}</strong> • {pharmacy.distance} away
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1.5 text-neutral-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> {pharmacy.address}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> Hours: {pharmacy.operatingHours}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> {pharmacy.phone}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => handleRemove(pharmacy.id, pharmacy.name)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${pharmacy.phone}`}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Call
                </a>
                <Link
                  to={`/pharmacies/${pharmacy.id}`}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Catalog
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPharmaciesPage;
