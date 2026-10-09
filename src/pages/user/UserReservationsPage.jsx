import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, KeyRound, MapPin, XCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { reservationService } from '../../api/reservationService';

const FILTERS = ['ALL', 'CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP', 'CANCELLED', 'EXPIRED'];
const formatDate = (value) => value ? new Date(value).toLocaleString() : 'Not available';

const UserReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    reservationService.getMine()
      .then((response) => setReservations(Array.isArray(response.data) ? response.data : []))
      .catch((error) => toast.error(error.message || 'Could not load your reservations.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = reservations.filter((item) => filterStatus === 'ALL' || item.status === filterStatus);

  const handleCancel = async (reservation) => {
    try {
      const response = await reservationService.cancel(reservation.id);
      setReservations((items) => items.map((item) => item.id === reservation.id ? response.data : item));
      if (selectedPass?.id === reservation.id) setSelectedPass(response.data);
      toast.success('Reservation cancelled. Stock has been released.');
    } catch (error) {
      toast.error(error.message || 'Could not cancel this reservation.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Medicine Pickup Holds</h1>
          <p className="mt-1 text-sm text-neutral-500">Track your reservation status and show the pickup code at the pharmacy.</p>
        </div>
        <Link to="/medicines" className="btn-primary text-sm">Reserve Medicine</Link>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200" aria-label="Filter reservations">
        {FILTERS.map((status) => (
          <button key={status} type="button" onClick={() => setFilterStatus(status)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold ${filterStatus === status ? 'border-primary-600 text-primary-700' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}>
            {status === 'ALL' ? 'All' : status.replaceAll('_', ' ')}
            <span className="ml-1.5 rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600">{status === 'ALL' ? reservations.length : reservations.filter((item) => item.status === status).length}</span>
          </button>
        ))}
      </nav>

      {isLoading ? <p className="py-8 text-sm text-neutral-500">Loading reservations…</p>
        : filtered.length === 0 ? <p className="border-y border-neutral-200 py-8 text-sm text-neutral-500">No reservations in this category.</p>
          : <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{filtered.map((item) => {
            const isActive = item.status === 'CONFIRMED' || item.status === 'READY_FOR_PICKUP';
            const canShowCode = isActive || item.status === 'PICKED_UP';
            return (
              <article key={item.id} className="flex flex-col justify-between gap-4 border-y border-neutral-200 bg-white py-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary-700">{item.reservationCode}</span>
                      <h2 className="mt-1 text-lg font-bold text-neutral-900">{item.medicineName} {item.strength}</h2>
                      <p className="text-xs text-neutral-500">{item.dosageForm} · Quantity {item.quantity}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${item.status === 'PICKED_UP' ? 'text-green-700' : item.status === 'CANCELLED' || item.status === 'EXPIRED' ? 'text-neutral-500' : 'text-amber-700'}`}>
                      {item.status === 'PICKED_UP' ? <CheckCircle className="h-4 w-4" /> : item.status === 'CANCELLED' || item.status === 'EXPIRED' ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      {item.status.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 border-l-2 border-neutral-200 pl-3 text-xs text-neutral-600">
                    <strong className="block text-sm text-neutral-900">{item.pharmacyName}</strong>
                    <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {item.pharmacyAddress}</p>
                    <p>Phone: {item.pharmacyPhone}</p>
                    <p>Reserved: {formatDate(item.createdAt)}</p>
                    <p>Pickup hold expires: {formatDate(item.expiresAt)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                  <div><span className="block text-xs text-neutral-500">Total due at pickup</span><strong className="text-lg text-neutral-900">{formatPrice(item.totalPrice)}</strong></div>
                  <div className="flex gap-2">
                    {isActive && <button type="button" onClick={() => handleCancel(item)} className="btn-secondary text-xs text-red-700">Cancel hold</button>}
                    {canShowCode && <Button variant="primary" size="sm" onClick={() => setSelectedPass(item)} className="inline-flex items-center gap-1.5 text-xs"><KeyRound className="h-3.5 w-3.5" /> Pickup Code</Button>}
                  </div>
                </div>
              </article>
            );
          })}</div>}

      {selectedPass && (
        <Modal isOpen onClose={() => setSelectedPass(null)} title="Pharmacy Pickup Code" size="sm">
          <div className="space-y-4 py-2 text-center">
            <p className="text-sm text-neutral-600">Show this code to the pharmacist at <strong>{selectedPass.pharmacyName}</strong>.</p>
            <div className="border-y border-neutral-200 py-6">
              <span className="block text-xs font-semibold uppercase text-neutral-500">Reservation code</span>
              <strong className="mt-2 block break-all font-mono text-3xl font-bold text-primary-700">{selectedPass.reservationCode}</strong>
            </div>
            <p className="text-xs text-neutral-500">{selectedPass.medicineName} · Qty {selectedPass.quantity} · Expires {formatDate(selectedPass.expiresAt)}</p>
            <Button variant="secondary" onClick={() => setSelectedPass(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserReservationsPage;
