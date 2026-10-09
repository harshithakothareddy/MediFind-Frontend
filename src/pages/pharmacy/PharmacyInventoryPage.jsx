import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Package, PlusCircle, Search, Trash2 } from 'lucide-react';
import { AvailabilityBadge } from '../../components/common/Badges';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { inventoryService } from '../../api/inventoryService';

const mapInventory = (item) => ({
  ...item,
  medicineName: item.medicine?.name || 'Medicine',
  genericName: item.medicine?.genericName || '',
  category: item.medicine?.category || 'General',
  status: item.availabilityStatus === 'IN_STOCK' ? 'AVAILABLE' : item.availabilityStatus,
  quantity: item.stockQuantity ?? 0,
  threshold: item.minimumStockLevel ?? 0,
});

const PharmacyInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editThreshold, setEditThreshold] = useState(0);
  const [editBatch, setEditBatch] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInventory = () => {
    setLoading(true);
    inventoryService.getPharmacyInventory({ page: 0, size: 100 })
      .then((response) => {
        const page = response.data;
        const rows = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : [];
        setInventory(rows.map(mapInventory));
      })
      .catch((error) => toast.error(error.message || 'Could not load inventory.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || item.medicineName.toLowerCase().includes(query)
      || item.genericName.toLowerCase().includes(query);
    return matchesSearch && (selectedStatus === 'ALL' || item.status === selectedStatus);
  });

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditQty(item.quantity);
    setEditPrice(item.price);
    setEditThreshold(item.threshold);
    setEditBatch(item.batchNumber || '');
    setEditExpiry(item.expiryDate || '');
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await inventoryService.updateMedicine(editingItem.id, {
        stockQuantity: Number(editQty),
        price: Number(editPrice),
        minimumStockLevel: Number(editThreshold),
        batchNumber: editBatch.trim(),
        expiryDate: editExpiry || null,
      });
      toast.success(`Updated ${editingItem.medicineName}.`);
      setEditingItem(null);
      loadInventory();
    } catch (error) {
      toast.error(error.message || 'Could not update inventory.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove ${item.medicineName} from this pharmacy's inventory?`)) return;
    try {
      await inventoryService.deleteMedicine(item.id);
      setInventory((current) => current.filter((entry) => entry.id !== item.id));
      toast.success(`${item.medicineName} removed from inventory.`);
    } catch (error) {
      toast.error(error.message || 'Could not remove this item.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Store Medicine Inventory</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage quantities, batch details, expiry dates, and prices.</p>
        </div>
        <Link to="/pharmacy/inventory/add" className="btn-primary inline-flex items-center gap-2 text-sm">
          <PlusCircle className="h-4 w-4" /> Add Medicine Stock
        </Link>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input className="input w-full pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search medicines" />
        </label>
        <select className="input sm:w-52" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} aria-label="Filter by stock status">
          <option value="ALL">All stock statuses</option>
          <option value="AVAILABLE">In stock</option>
          <option value="LOW_STOCK">Low stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </select>
      </div>

      <div className="overflow-x-auto border-y border-neutral-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Medicine</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Batch / Expiry</th>
              <th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3"><strong className="block text-neutral-900">{item.medicineName}</strong><span className="text-xs text-neutral-500">{item.genericName}</span></td>
                <td className="px-4 py-3"><strong>{item.quantity}</strong><span className="block text-xs text-neutral-500">Minimum {item.threshold}</span></td>
                <td className="px-4 py-3 text-xs text-neutral-600"><span className="block">{item.batchNumber || 'No batch'}</span><span>{item.expiryDate ? new Date(`${item.expiryDate}T00:00:00`).toLocaleDateString() : 'No expiry set'}</span></td>
                <td className="px-4 py-3 font-semibold">{formatPrice(item.price)}</td>
                <td className="px-4 py-3"><AvailabilityBadge status={item.status} /></td>
                <td className="px-4 py-3 text-xs text-neutral-500">{timeAgo(item.lastUpdatedAt)}</td>
                <td className="px-4 py-3 text-right"><div className="inline-flex gap-2">
                  <button type="button" onClick={() => handleOpenEdit(item)} className="rounded p-2 text-neutral-500 hover:bg-neutral-100 hover:text-primary-700" title="Edit inventory"><Edit className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDelete(item)} className="rounded p-2 text-neutral-500 hover:bg-red-50 hover:text-red-700" title="Remove inventory item"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filteredInventory.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">No inventory items match this filter.</p>}
        {loading && <p className="py-10 text-center text-sm text-neutral-500">Loading inventory…</p>}
      </div>

      {editingItem && (
        <Modal isOpen onClose={() => setEditingItem(null)} title={`Edit ${editingItem.medicineName}`} size="md">
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input label="Stock quantity" type="number" min="0" value={editQty} onChange={(event) => setEditQty(event.target.value)} required />
            <Input label="Minimum stock level" type="number" min="0" value={editThreshold} onChange={(event) => setEditThreshold(event.target.value)} required />
            <Input label="Price per unit" type="number" min="0.01" step="0.01" value={editPrice} onChange={(event) => setEditPrice(event.target.value)} required />
            <Input label="Batch number" value={editBatch} onChange={(event) => setEditBatch(event.target.value)} />
            <Input label="Expiry date" type="date" value={editExpiry} onChange={(event) => setEditExpiry(event.target.value)} />
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PharmacyInventoryPage;
