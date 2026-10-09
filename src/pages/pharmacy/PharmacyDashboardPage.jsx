import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Package, PlusCircle, RefreshCw } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { AvailabilityBadge } from '../../components/common/Badges';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { inventoryService } from '../../api/inventoryService';
import { reservationService } from '../../api/reservationService';

const PharmacyDashboardPage = () => {
  const [inventory, setInventory] = useState([]);
  const [pickupQueue, setPickupQueue] = useState([]);

  const loadDashboard = () => {
    inventoryService.getPharmacyInventory({ page: 0, size: 100 })
      .then((response) => {
        const page = response.data;
        const rows = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : [];
        setInventory(rows.map((item) => ({
          ...item,
          medicineName: item.medicine?.name || 'Medicine',
          status: item.availabilityStatus,
          quantity: item.stockQuantity || 0,
          threshold: item.minimumStockLevel || 0,
        })));
      })
      .catch((error) => toast.error(error.message || 'Could not load inventory.'));

    reservationService.getPharmacyQueue()
      .then((response) => setPickupQueue(Array.isArray(response.data) ? response.data : []))
      .catch((error) => toast.error(error.message || 'Could not load pickup reservations.'));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickRestock = async (item) => {
    try {
      await inventoryService.updateStock(item.id, { quantity: item.quantity + 100 });
      toast.success(`Added 100 units of ${item.medicineName}.`);
      loadDashboard();
    } catch (error) {
      toast.error(error.message || 'Could not update stock.');
    }
  };

  const handleReservationStatus = async (reservation, status) => {
    try {
      const response = await reservationService.updateStatus(reservation.id, status);
      setPickupQueue((current) => current.map((item) => item.id === reservation.id ? response.data : item));
      toast.success(status === 'READY_FOR_PICKUP' ? 'Customer notified that the order is ready.' : 'Pickup confirmed.');
    } catch (error) {
      toast.error(error.message || 'Could not update this reservation.');
    }
  };

  const lowStock = inventory.filter((item) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK');
  const activeReservations = pickupQueue.filter((item) =>
    item.status === 'CONFIRMED' || item.status === 'READY_FOR_PICKUP');

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pharmacy Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Current inventory and customer pickup holds</p>
        </div>
        <Link to="/pharmacy/inventory/add" className="btn-primary inline-flex items-center gap-2 text-sm">
          <PlusCircle className="h-4 w-4" /> Add Medicine Stock
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Inventory summary">
        <StatCard title="Inventory Items" value={inventory.length} subtitle="Medicine stock records" icon={Package} color="primary" />
        <StatCard title="Low or Out of Stock" value={lowStock.length} subtitle="Needs attention" icon={AlertTriangle} color="warning" />
        <StatCard title="Active Pickup Holds" value={activeReservations.length} subtitle="Waiting for pickup" icon={Clock} color="teal" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Pickup Queue</h2>
          <Link to="/pharmacy/stock-alerts" className="text-sm font-semibold text-primary-700 hover:underline">Stock alerts</Link>
        </div>
        {pickupQueue.length === 0 ? (
          <p className="border-y border-neutral-200 py-6 text-sm text-neutral-500">No pickup reservations yet.</p>
        ) : pickupQueue.map((item) => (
          <article key={item.id} className="flex flex-col gap-4 border-y border-neutral-200 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary-700">{item.reservationCode}</span>
                <strong className="text-sm text-neutral-900">{item.customerName}</strong>
                <span className="text-xs text-neutral-500">{item.status.replaceAll('_', ' ')}</span>
              </div>
              <p className="text-sm text-neutral-700">{item.medicineName} {item.strength} · Qty {item.quantity} · {formatPrice(item.totalPrice)}</p>
              <p className="text-xs text-neutral-500">Reserved {timeAgo(item.createdAt)} · Expires {new Date(item.expiresAt).toLocaleString()}</p>
            </div>
            {item.status === 'CONFIRMED' ? (
              <button onClick={() => handleReservationStatus(item, 'READY_FOR_PICKUP')} className="btn-primary text-sm">Mark Ready</button>
            ) : item.status === 'READY_FOR_PICKUP' ? (
              <button onClick={() => handleReservationStatus(item, 'PICKED_UP')} className="btn-secondary inline-flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" /> Confirm Pickup
              </button>
            ) : null}
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-neutral-900">Low Stock and Expiry Watch</h2>
        {lowStock.length === 0 ? (
          <p className="border-y border-neutral-200 py-6 text-sm text-neutral-500">No low-stock items.</p>
        ) : lowStock.map((item) => (
          <article key={item.id} className="flex flex-col gap-3 border-y border-neutral-200 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm text-neutral-900">{item.medicineName}</strong>
                <AvailabilityBadge status={item.status} />
              </div>
              <p className="mt-1 text-xs text-neutral-500">{item.quantity} units · reorder threshold {item.threshold} · updated {timeAgo(item.lastUpdatedAt)}</p>
            </div>
            <button onClick={() => handleQuickRestock(item)} className="btn-secondary inline-flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4" /> Add 100 units
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};

export default PharmacyDashboardPage;
