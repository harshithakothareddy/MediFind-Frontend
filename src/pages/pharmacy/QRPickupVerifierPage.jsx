import React, { useState } from 'react';
import {
  QrCode, Search, CheckCircle, XCircle, Clock, MapPin,
  Phone, Pill, User, Hash, Loader2, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { reservationService } from '../../api/reservationService';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';

const formatDate = (v) => v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const statusConfig = {
  CONFIRMED: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock className="w-4 h-4" /> },
  READY_FOR_PICKUP: { color: 'text-[#064e3b]', bg: 'bg-[#d1fae5] border-[#a7f3d0]', icon: <ShieldCheck className="w-4 h-4" /> },
  PICKED_UP: { color: 'text-[#059669]', bg: 'bg-[#d1fae5] border-[#a7f3d0]', icon: <CheckCircle className="w-4 h-4" /> },
  CANCELLED: { color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200', icon: <XCircle className="w-4 h-4" /> },
  EXPIRED: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: <AlertTriangle className="w-4 h-4" /> },
};

const QRPickupVerifierPage = () => {
  const [codeInput, setCodeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [reservation, setReservation] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setIsSearching(true);
    setReservation(null);
    try {
      const res = await reservationService.getByCode(code);
      const data = res.data?.data || res.data;
      setReservation(data);
    } catch (err) {
      toast.error(err.message || `No reservation found with code "${code}".`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyPickup = async () => {
    if (!reservation) return;
    const ok = window.confirm(`Confirm pickup of "${reservation.medicineName}" by ${reservation.customerName}? This will mark the reservation as PICKED UP.`);
    if (!ok) return;

    setIsVerifying(true);
    try {
      const res = await reservationService.verifyPickup(reservation.reservationCode);
      const updated = res.data?.data || res.data;
      setReservation(updated);
      toast.success('✅ Pickup confirmed! Stock has been dispensed.');
    } catch (err) {
      toast.error(err.message || 'Could not verify pickup. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const cfg = reservation ? (statusConfig[reservation.status] || statusConfig.CONFIRMED) : null;
  const canVerify = reservation?.status === 'CONFIRMED' || reservation?.status === 'READY_FOR_PICKUP';
  const isExpired = reservation?.expiresAt && new Date(reservation.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-primary-600" />
          QR Pickup Verifier
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter or scan the customer's reservation code to look up and confirm their medicine pickup.
        </p>
      </header>

      {/* Code entry */}
      <form onSubmit={handleLookup} className="card p-5 space-y-4">
        <label className="block text-sm font-semibold text-neutral-700">
          Enter Reservation Code
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              placeholder="MF-XXXXXXXXXX"
              className="input pl-9 font-mono tracking-widest text-lg uppercase w-full"
              maxLength={15}
              autoFocus
            />
          </div>
          <Button type="submit" variant="primary" disabled={isSearching || !codeInput.trim()}>
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isSearching ? 'Searching…' : 'Look Up'}
          </Button>
        </div>
        <p className="text-xs text-neutral-400">
          The customer's code starts with <span className="font-mono font-bold">MF-</span> and is 12 characters long.
        </p>
      </form>

      {/* Reservation card */}
      {reservation && (
        <div className={`card p-0 overflow-hidden border-2 ${reservation.status === 'PICKED_UP' ? 'border-green-300' : reservation.status === 'EXPIRED' || reservation.status === 'CANCELLED' ? 'border-neutral-300' : 'border-primary-300'}`}>
          {/* Status banner */}
          <div className={`px-5 py-3 flex items-center justify-between gap-2 border-b ${cfg.bg}`}>
            <span className={`flex items-center gap-1.5 text-sm font-bold ${cfg.color}`}>
              {cfg.icon}
              {reservation.status.replaceAll('_', ' ')}
            </span>
            <span className="font-mono text-sm font-bold text-neutral-700">{reservation.reservationCode}</span>
          </div>

          <div className="p-5 space-y-5">
            {/* Medicine info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center shrink-0">
                <Pill className="w-7 h-7 text-primary-600" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-neutral-900">
                  {reservation.medicineName}
                  {reservation.strength ? <span className="text-neutral-500 font-normal text-base ml-2">{reservation.strength}</span> : null}
                </h2>
                <p className="text-sm text-neutral-500">{reservation.dosageForm}</p>
                <p className="text-xs text-neutral-400">Generic: {reservation.genericName}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <User className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-xs text-neutral-500">Customer</span>
                  <span className="font-semibold text-neutral-900">{reservation.customerName || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <Hash className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-xs text-neutral-500">Quantity × Unit Price</span>
                  <span className="font-semibold text-neutral-900">
                    {reservation.quantity} × {formatPrice(reservation.unitPrice)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-xs text-neutral-500">Reserved at</span>
                  <span className="font-semibold text-neutral-900">{formatDate(reservation.createdAt)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-xl border ${isExpired && reservation.status !== 'PICKED_UP' ? 'bg-red-50 border-red-200' : 'bg-neutral-50 border-neutral-100'}`}>
                <AlertTriangle className={`w-4 h-4 shrink-0 ${isExpired && reservation.status !== 'PICKED_UP' ? 'text-red-500' : 'text-neutral-400'}`} />
                <div>
                  <span className={`block text-xs ${isExpired && reservation.status !== 'PICKED_UP' ? 'text-red-600 font-semibold' : 'text-neutral-500'}`}>
                    {isExpired && reservation.status !== 'PICKED_UP' ? 'Hold EXPIRED at' : 'Hold expires at'}
                  </span>
                  <span className={`font-semibold ${isExpired && reservation.status !== 'PICKED_UP' ? 'text-red-700' : 'text-neutral-900'}`}>
                    {formatDate(reservation.expiresAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {reservation.notes && (
              <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <strong>Customer Note:</strong> {reservation.notes}
              </div>
            )}

            {/* Total & action */}
            <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${reservation.status === 'PICKED_UP' ? 'border-green-100' : 'border-neutral-100'}`}>
              <div>
                <span className="block text-xs text-neutral-500">Total Amount Due at Counter</span>
                <span className="text-2xl font-bold text-neutral-900">{formatPrice(reservation.totalPrice)}</span>
              </div>

              {reservation.status === 'PICKED_UP' && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 border border-green-300 text-green-800 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  Pickup Already Confirmed
                </div>
              )}

              {reservation.status === 'CANCELLED' && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 font-semibold text-sm">
                  <XCircle className="w-4 h-4" />
                  Reservation Cancelled
                </div>
              )}

              {reservation.status === 'EXPIRED' && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Hold Expired — Cannot Dispense
                </div>
              )}

              {canVerify && !isExpired && (
                <Button
                  variant="primary"
                  onClick={handleVerifyPickup}
                  disabled={isVerifying}
                  className="flex items-center gap-2"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isVerifying ? 'Confirming…' : 'Confirm Pickup & Dispense'}
                </Button>
              )}

              {canVerify && isExpired && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Hold Expired — Reject
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRPickupVerifierPage;
