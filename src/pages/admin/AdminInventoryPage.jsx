import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AvailabilityBadge } from '../../components/common/Badges';
import { formatPrice, timeAgo } from '../../utils/helpers';
import Button from '../../components/common/Button';
import { adminService } from '../../api/adminService';

const AdminInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getInventory({ limit: 100 });
      const payload = response.data;
      setInventory(Array.isArray(payload) ? payload : payload?.content || payload?.items || []);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load inventory from the database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  const items = useMemo(() => inventory.map(item => ({
    ...item,
    pharmacyName: item.pharmacy?.name || 'Pharmacy unavailable',
    pharmacyCity: [item.pharmacy?.area, item.pharmacy?.city].filter(Boolean).join(', ') || 'Location unavailable',
    medicineName: item.medicine?.name || 'Medicine unavailable',
    genericName: item.medicine?.genericName || '',
    quantity: item.stockQuantity ?? 0,
    threshold: item.minimumStockLevel ?? 0,
    status: item.availabilityStatus === 'IN_STOCK' ? 'AVAILABLE' : item.availabilityStatus,
    lastUpdated: item.lastUpdatedAt,
  })), [inventory]);

  const filtered = items.filter(i => {
    const matchesSearch = !search ||
      i.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      i.pharmacyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Global Network Inventory Monitor</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Cross-pharmacy stock level telemetry, POS synchronization status, and stockout surveillance
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadInventory} disabled={loading} className="flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh inventory
        </Button>
      </div>

      <div className="card p-4 border border-neutral-200 shadow-sm bg-white flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by medicine or pharmacy store name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input sm:w-48 text-xs"
        >
          <option value="ALL">All Stock Statuses</option>
          <option value="AVAILABLE">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      <div className="card border border-neutral-200 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3 px-5 font-semibold">Store / Pharmacy</th>
                <th className="py-3 px-4 font-semibold">Medicine Formulation</th>
                <th className="py-3 px-4 font-semibold">Shelf Units</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Stock Status</th>
                <th className="py-3 px-5 text-right font-semibold">Last Synced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-neutral-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading inventory…</td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-red-700"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-neutral-500">No matching database inventory records.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-4 px-5">
                    <strong className="font-bold text-neutral-900 block">{item.pharmacyName}</strong>
                    <span className="text-xs text-neutral-400">{item.pharmacyCity}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-neutral-900 block">{item.medicineName}</span>
                    <span className="text-xs text-neutral-500">{item.genericName}</span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap font-semibold">
                    <span className={item.quantity === 0 ? 'text-red-600' : item.quantity <= item.threshold ? 'text-amber-600' : 'text-neutral-900'}>
                      {item.quantity} units
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap font-bold text-neutral-900">
                    {formatPrice(Number(item.price || 0))}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <AvailabilityBadge status={item.status} />
                  </td>

                  <td className="py-4 px-5 text-right whitespace-nowrap text-xs text-neutral-500">
                    {timeAgo(item.lastUpdated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
