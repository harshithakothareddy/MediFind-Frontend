import React, { useCallback, useEffect, useState } from 'react';
import { PlusCircle, Search, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { MEDICINE_CATEGORIES, DOSAGE_FORMS } from '../../constants/demoData';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import { adminService } from '../../api/adminService';

const AdminMedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    category: MEDICINE_CATEGORIES[0],
    manufacturer: '',
    strength: '',
    dosageForm: DOSAGE_FORMS[0],
    description: '',
  });

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getMedicines({ page: 0, size: 100 });
      const payload = response.data;
      setMedicines(Array.isArray(payload) ? payload : payload?.content || payload?.items || []);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load medicines from the database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMedicines(); }, [loadMedicines]);

  const filtered = medicines.filter(m => {
    const matchesSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.createMedicine(newMed);
      const item = response.data;
      setMedicines(previous => [item, ...previous]);
      toast.success(`${item.name} added to the database.`);
      setIsAddModalOpen(false);
      setNewMed({ name: '', genericName: '', category: MEDICINE_CATEGORIES[0], manufacturer: '', strength: '', dosageForm: DOSAGE_FORMS[0], description: '' });
    } catch (requestError) {
      toast.error(requestError?.message || 'Unable to add medicine.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name} from central catalog?`)) {
      try {
        await adminService.deleteMedicine(id);
        setMedicines(previous => previous.filter(m => m.id !== id));
        toast.info(`${name} deactivated`);
      } catch (requestError) {
        toast.error(requestError?.message || 'Unable to deactivate medicine.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Master Drug Database Registry</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Standard drug definitions, authorized generic names, strengths, and pharmacological categories
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Add Standard Formulation
        </Button>
        <Button variant="secondary" size="sm" onClick={loadMedicines} disabled={loading} aria-label="Refresh medicines">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="card p-4 border border-neutral-200 shadow-sm bg-white flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search standard catalog by brand name or salt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input sm:w-56 text-xs"
        >
          <option value="ALL">All Categories</option>
          {MEDICINE_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card border border-neutral-200 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3 px-5 font-semibold">Medicine Formulation</th>
                <th className="py-3 px-4 font-semibold">Active Generic Salt</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Dosage Form & Strength</th>
                <th className="py-3 px-4 font-semibold">Manufacturer</th>
                <th className="py-3 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-neutral-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading medicines…</td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-red-700"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-neutral-500">No matching database medicines.</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-4 px-5">
                    <strong className="font-bold text-neutral-900 block">{m.name}</strong>
                    <span className="text-xs text-neutral-400">ID: {m.id}{m.isActive === false ? ' · Inactive' : ''}</span>
                  </td>

                  <td className="py-4 px-4 text-xs text-neutral-700 font-medium">
                    {m.genericName}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-600">
                    {m.category}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-800">
                    {m.dosageForm} • <strong>{m.strength}</strong>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-600">
                    {m.manufacturer}
                  </td>

                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Drug to Central Registry"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Commercial / Brand Name"
            placeholder="e.g. Paracetamol"
            value={newMed.name}
            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            required
          />
          <Input
            label="Active Chemical Molecule / Generic"
            placeholder="e.g. Acetaminophen"
            value={newMed.genericName}
            onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">Category</label>
              <select
                className="input text-xs"
                value={newMed.category}
                onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
              >
                {MEDICINE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">Dosage Form</label>
              <select
                className="input text-xs"
                value={newMed.dosageForm}
                onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
              >
                {DOSAGE_FORMS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Standard Strength"
              placeholder="e.g. 500mg"
              value={newMed.strength}
              onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
              required
            />
            <Input
              label="Lead Manufacturer"
              placeholder="e.g. GSK"
              value={newMed.manufacturer}
              onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700">Clinical Indication Summary</label>
            <textarea
              className="input min-h-[70px] resize-none text-xs"
              placeholder="Clinical uses, precautions..."
              value={newMed.description}
              onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Formulation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMedicinesPage;
