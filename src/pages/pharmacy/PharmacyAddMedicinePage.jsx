import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { medicineService } from '../../api/medicineService';
import { inventoryService } from '../../api/inventoryService';
import { toast } from 'react-toastify';

const PharmacyAddMedicinePage = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [medicineId, setMedicineId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minimumStockLevel, setMinimumStockLevel] = useState('10');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    medicineService.getAll({ page: 0, size: 100, sortBy: 'name' })
      .then((response) => {
        const page = response.data;
        const rows = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : [];
        setMedicines(rows);
      })
      .catch((error) => toast.error(error.message || 'Could not load the medicine catalog.'))
      .finally(() => setLoading(false));
  }, []);

  const selectedMedicine = medicines.find((medicine) => String(medicine.id) === medicineId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await inventoryService.addMedicine({
        medicineId: Number(medicineId),
        stockQuantity: Number(quantity),
        minimumStockLevel: Number(minimumStockLevel),
        price: Number(price),
        batchNumber: batchNumber.trim(),
        expiryDate,
      });
      toast.success(`${selectedMedicine?.name || 'Medicine'} stock saved.`);
      navigate('/pharmacy/inventory');
    } catch (error) {
      toast.error(error.message || 'Could not save medicine stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-700">
        <ArrowLeft className="h-4 w-4" /> Back to inventory
      </button>
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">Add Medicine Stock</h1>
        <p className="mt-1 text-sm text-neutral-500">Choose a catalog medicine and enter this pharmacy’s batch details.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 border-y border-neutral-200 bg-white py-6">
        <div className="space-y-1">
          <label htmlFor="medicine" className="block text-sm font-semibold text-neutral-800">Medicine</label>
          <select id="medicine" className="input w-full" value={medicineId} onChange={(event) => setMedicineId(event.target.value)} required disabled={loading}>
            <option value="">{loading ? 'Loading catalog…' : 'Select a medicine'}</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>{medicine.name} · {medicine.strength} · {medicine.dosageForm}</option>
            ))}
          </select>
          {!loading && medicines.length === 0 && <p className="text-xs text-red-600">The catalog is empty or unavailable. Contact an administrator to add medicines.</p>}
          {selectedMedicine?.genericName && <p className="text-xs text-neutral-500">Generic: {selectedMedicine.genericName}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Batch number" value={batchNumber} onChange={(event) => setBatchNumber(event.target.value)} required maxLength="80" />
          <Input label="Expiry date" type="date" min={new Date().toISOString().slice(0, 10)} value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} required />
          <Input label="Quantity on shelf" type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
          <Input label="Low-stock threshold" type="number" min="0" value={minimumStockLevel} onChange={(event) => setMinimumStockLevel(event.target.value)} required />
          <Input label="Price per unit" type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || loading || medicines.length === 0} className="inline-flex items-center gap-2">
            <PackagePlus className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Stock'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PharmacyAddMedicinePage;
