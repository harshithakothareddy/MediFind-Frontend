import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { reservationService } from '../../api/reservationService';
import { reviewService } from '../../api/reviewService';
import { toast } from 'react-toastify';

const PharmacyReviews = ({ pharmacyId, onReviewsChanged }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [eligibleReservations, setEligibleReservations] = useState([]);
  const [reservationId, setReservationId] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const loadReviews = () => reviewService.getByPharmacy(pharmacyId)
    .then((response) => {
      const rows = Array.isArray(response.data) ? response.data : [];
      setReviews(rows);
      onReviewsChanged?.(rows);
    })
    .catch((error) => toast.error(error.message || 'Could not load pharmacy reviews.'));

  useEffect(() => {
    let isCurrent = true;
    reviewService.getByPharmacy(pharmacyId)
      .then((response) => {
        const rows = Array.isArray(response.data) ? response.data : [];
        if (!isCurrent) return;
        setReviews(rows);
        onReviewsChanged?.(rows);
        if (isAuthenticated && user?.role === 'USER') {
          const reviewed = new Set(rows.map((review) => review.reservationId));
          reservationService.getMine()
            .then((reservationResponse) => {
              const reservations = Array.isArray(reservationResponse.data) ? reservationResponse.data : [];
              if (isCurrent) setEligibleReservations(reservations.filter((reservation) =>
                reservation.pharmacyId === Number(pharmacyId)
                && reservation.status === 'PICKED_UP'
                && !reviewed.has(reservation.id)));
            })
            .catch(() => {});
        }
      })
      .catch((error) => toast.error(error.message || 'Could not load pharmacy reviews.'));
    return () => { isCurrent = false; };
  }, [pharmacyId, isAuthenticated, user?.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await reviewService.submit(pharmacyId, {
        reservationId: Number(reservationId),
        rating: Number(rating),
        comment: comment.trim(),
      });
      setComment('');
      setReservationId('');
      toast.success('Thanks for sharing your pickup experience.');
      await loadReviews();
      setEligibleReservations((items) => items.filter((item) => item.id !== Number(reservationId)));
    } catch (error) {
      toast.error(error.message || 'Could not submit your review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5 border-t border-neutral-200 pt-8">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Customer Reviews</h2>
        <p className="mt-1 text-sm text-neutral-500">Reviews are available after a completed pickup.</p>
      </div>

      {eligibleReservations.length > 0 && (
        <form onSubmit={handleSubmit} className="grid gap-3 border-y border-neutral-200 py-4 sm:grid-cols-[1fr_120px_1fr_auto] sm:items-end">
          <label className="space-y-1 text-xs font-semibold text-neutral-700">
            Completed pickup
            <select className="input w-full" value={reservationId} onChange={(event) => setReservationId(event.target.value)} required>
              <option value="">Select reservation</option>
              {eligibleReservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>{reservation.reservationCode} · {reservation.medicineName}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold text-neutral-700">
            Rating
            <select className="input w-full" value={rating} onChange={(event) => setRating(event.target.value)}>
              <option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold text-neutral-700">
            Comment
            <input className="input w-full" maxLength="1000" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="How was your pickup?" />
          </label>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Sending…' : 'Submit'}</button>
        </form>
      )}

      {reviews.length === 0 ? <p className="py-4 text-sm text-neutral-500">No customer reviews yet.</p>
        : <div className="divide-y divide-neutral-100">{reviews.map((review) => (
          <article key={review.id} className="py-4">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm text-neutral-900">{review.customerName}</strong>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {review.rating}/5</span>
            </div>
            {review.comment && <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>}
            <time className="mt-2 block text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</time>
          </article>
        ))}</div>}
    </section>
  );
};

export default PharmacyReviews;