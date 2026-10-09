import React, { useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, RefreshCw } from 'lucide-react';
import { AvailabilityBadge } from '../../components/common/Badges';
import { inventoryService } from '../../api/inventoryService';
import { timeAgo } from '../../utils/helpers';
import { toast } from 'react-toastify';

const PharmacyStockAlertsPage = () => {
  const [stockAlerts, setStockAlerts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => {
    setLoading(true);
    Promise.all([
      inventoryService.getLowStock(),
      inventoryService.getOutOfStock(),
      inventoryService.getExpiryWatch(90),
    ])
      .then(([lowStock, outOfStock, expiring]) => {
        const lowRows = Array.isArray(lowStock.data) ? lowStock.data : [];
        const outRows = Array.isArray(outOfStock.data) ? outOfStock.data : [];
        setStockAlerts([...lowRows, ...outRows]);
        setExpiryAlerts(Array.isArray(expiring.data) ? expiring.data : []);
      })
      .catch((error) => toast.error(error.message || 'Could not load pharmacy stock alerts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const restock = async (item) => {
    try {
      await inventoryService.updateStock(item.id, { quantity: item.stockQuantity + 100 });
      toast.success(`${item.medicine?.name || 'Medicine'} stock updated.`);
      loadAlerts();
    } catch (error) {
      toast.error(error.message || 'Could not update stock.');
    }
  };

  const renderRows = (items, expiryView = false) => items.map((item) => (
    <article key={item.id} className="flex flex-col gap-3 border-y border-neutral-200 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm text-neutral-900">{item.medicine?.name || 'Medicine'}</strong>
          {!expiryView && <AvailabilityBadge status={item.availabilityStatus} />}
          {expiryView && <span className="text-xs font-semibold text-amber-700">Expires {new Date(item.expiryDate).toLocaleDateString()}</span>}
        </div>
        <p className="text-xs text-neutral-600">
          {item.stockQuantity} units · threshold {item.minimumStockLevel}
          {item.batchNumber ? ` · Batch ${item.batchNumber}` : ''}
        </p>
        <p className="text-xs text-neutral-500">Last stock update {timeAgo(item.lastUpdatedAt)}</p>
      </div>
      {!expiryView && item.stockQuantity > 0 && (
        <button onClick={() => restock(item)} className="btn-secondary inline-flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Add 100 units
        </button>
      )}
    </article>
  ));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">Stock Alerts</h1>
        <p className="mt-1 text-sm text-neutral-500">Low quantities and batches expiring within 90 days</p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-bold text-neutral-900">Low or Out of Stock</h2>
        </div>
        {loading ? <p className="py-5 text-sm text-neutral-500">Loading stock alerts…</p>
          : stockAlerts.length ? renderRows(stockAlerts)
            : <p className="border-y border-neutral-200 py-5 text-sm text-neutral-500">No low-stock items right now.</p>}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-rose-600" />
          <h2 className="text-lg font-bold text-neutral-900">Expiry Watch</h2>
        </div>
        {!loading && expiryAlerts.length ? renderRows(expiryAlerts, true)
          : !loading && <p className="border-y border-neutral-200 py-5 text-sm text-neutral-500">No batches are near expiry.</p>}
      </section>
    </div>
  );
};

export default PharmacyStockAlertsPage;
