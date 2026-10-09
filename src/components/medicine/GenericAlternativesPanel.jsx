import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingDown, Sparkles, ChevronDown, ChevronUp, ExternalLink,
  CheckCircle, Store, AlertCircle, Loader2
} from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import { medicineService } from '../../api/medicineService';
import { toast } from 'react-toastify';

const GenericAlternativesPanel = ({ medicineId, medicineName }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const loadAlternatives = () => {
    if (hasFetched) {
      setIsExpanded(prev => !prev);
      return;
    }
    setIsLoading(true);
    setIsExpanded(true);
    medicineService.getAlternatives(medicineId)
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setAlternatives(data);
        setHasFetched(true);
        if (data.length === 0) toast.info('No generic alternatives found for this medicine in the catalog.');
      })
      .catch(() => {
        toast.error('Could not load alternatives.');
        setIsExpanded(false);
      })
      .finally(() => setIsLoading(false));
  };

  const top = alternatives[0];
  const maxSavings = top ? top.savingsPercentage : 0;

  return (
    <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden shadow-sm">
      {/* Header trigger */}
      <button
        onClick={loadAlternatives}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-green-100/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600/10 border border-green-200 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h3 className="font-bold text-green-900 text-sm flex items-center gap-2">
              Generic Alternatives & Price Savings
              {maxSavings > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-600 text-white">
                  Save up to {maxSavings}%
                </span>
              )}
            </h3>
            <p className="text-xs text-green-700 mt-0.5">
              Find the same active salt at lower cost from nearby pharmacies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && !isLoading && (
        <div className="px-5 pb-5 space-y-3 border-t border-green-100">
          {alternatives.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-green-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              No cheaper generic alternatives found in the current catalog.
            </div>
          ) : (
            <>
              <div className="pt-3 text-xs text-green-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                {alternatives.length} alternatives found with the same active composition
              </div>

              <div className="space-y-2.5">
                {alternatives.map((alt) => {
                  const hasSavings = alt.savingsPercentage > 0;
                  return (
                    <div
                      key={alt.medicineId}
                      className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 bg-white/80 hover:bg-white transition-colors ${
                        hasSavings ? 'border-green-200' : 'border-neutral-200'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-neutral-900 truncate">{alt.name}</h4>
                          {hasSavings && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                              {alt.savingsPercentage}% cheaper
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                          {alt.manufacturer} · {alt.dosageForm} {alt.strength}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Generic: <span className="font-medium text-neutral-700">{alt.genericName}</span>
                        </p>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                          <Store className="w-3 h-3" />
                          <span>{alt.availablePharmaciesCount} pharmacies stocked</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="text-right">
                          {alt.alternativeMinPrice != null && (
                            <span className="block text-base font-bold text-green-700">
                              from {formatPrice(alt.alternativeMinPrice)}
                            </span>
                          )}
                          {alt.originalMinPrice && alt.savingsAmount > 0 && (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-[11px] text-neutral-400 line-through">
                                {formatPrice(alt.originalMinPrice)}
                              </span>
                              <span className="text-[11px] text-green-600 font-semibold">
                                Save {formatPrice(alt.savingsAmount)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/medicines/${alt.medicineId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100 transition-colors"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-green-600/70 italic pt-1">
                * Prices shown are minimum available at stocked pharmacies. Consult your doctor before switching brands.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericAlternativesPanel;
