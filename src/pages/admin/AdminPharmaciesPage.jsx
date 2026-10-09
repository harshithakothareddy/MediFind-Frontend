import React, { useCallback, useEffect, useState } from 'react';
import { Search, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import { adminService } from '../../api/adminService';

const AdminPharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPharmacies, setTotalPharmacies] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const loadPharmacies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getPharmacies({ page: 0, size: 100 });
      const payload = response.data;
      const records = Array.isArray(payload) ? payload : payload?.content || payload?.items || [];
      setPharmacies(records);
      setTotalPharmacies(payload?.totalElements ?? records.length);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load pharmacies from the database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPharmacies(); }, [loadPharmacies]);

  const filtered = pharmacies.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleVerification = async (pharmacy) => {
    const status = pharmacy.verificationStatus === 'VERIFIED' ? 'SUSPENDED' : 'VERIFIED';
    try {
      await adminService.verifyPharmacy(pharmacy.id, { status });
      const update = item => item.id === pharmacy.id
        ? { ...item, verificationStatus: status, verified: status === 'VERIFIED' }
        : item;
      setPharmacies(previous => previous.map(update));
      setSelectedPharmacy(previous => previous ? update(previous) : null);
      toast.success(`${pharmacy.name} ${status.toLowerCase()}`);
    } catch (requestError) {
      toast.error(requestError?.message || 'Unable to update pharmacy verification.');
    }
  };

  const formatHours = (hours) => {
    if (!Array.isArray(hours)) return hours || 'Not provided';
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toUpperCase();
    const todayHours = hours.find(item => item?.dayOfWeek === today);
    if (!todayHours) return 'Hours not provided';
    return todayHours.closed ? 'Closed today' : `${todayHours.openTime || '—'} - ${todayHours.closeTime || '—'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Pharmacies & Drug Stores</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Audit retail pharmacy licenses, manage verification credentials, and inspect inventory compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#d1fae5] text-[#064e3b] font-semibold border border-[#a7f3d0]">
            Total: {pharmacies.length} Stores
          </span>
          <Button variant="secondary" size="sm" onClick={loadPharmacies} disabled={loading} aria-label="Refresh pharmacies">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 border border-[#d1e7dd] shadow-sm bg-white flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pharmacies by name or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input sm:w-48 text-xs"
        >
          <option value="ALL">All Verification Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending Verification</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="card border border-[#d1e7dd] shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f0fdf4] border-b border-[#d1e7dd] text-xs uppercase tracking-wider text-[#12352b]">
              <tr>
                <th className="py-3 px-5 font-semibold">Store Information</th>
                <th className="py-3 px-4 font-semibold">Contact & Location</th>
                <th className="py-3 px-4 font-semibold">Rating</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Listed Drugs</th>
                <th className="py-3 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1e7dd]">
              {loading ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-[#64748b]"><Loader2 className="mr-2 inline h-4 w-4 animate-spin text-[#059669]" />Loading pharmacies…</td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-red-700"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-[#64748b]">No matching database pharmacies.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#f0fdf4]/50 transition-colors">
                  <td className="py-4 px-5">
                    <strong className="font-bold text-[#12352b] block">{item.name}</strong>
                    <span className="text-xs text-[#64748b]">ID: {item.id}</span>
                  </td>

                  <td className="py-4 px-4 text-xs text-[#64748b]">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#059669]" /> {item.address}
                    </p>
                    <p className="text-[#64748b] mt-0.5">{item.phone}</p>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-[#12352b]">
                    {item.rating == null ? '—' : `★ ${item.rating}`}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        item.verificationStatus === 'VERIFIED'
                          ? 'bg-[#d1fae5] text-[#064e3b] border-[#a7f3d0]'
                          : item.verificationStatus === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {item.verificationStatus}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-neutral-700">
                    —
                  </td>

                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedPharmacy(item)}
                        className="text-xs py-1 px-2.5"
                      >
                        Inspect
                      </Button>
                      <Button
                        variant={item.verificationStatus === 'VERIFIED' ? 'danger' : 'teal'}
                        size="sm"
                        onClick={() => handleToggleVerification(item)}
                        className="text-xs py-1 px-2.5"
                      >
                        {item.verificationStatus === 'VERIFIED' ? 'Suspend' : 'Verify'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedPharmacy && (
        <Modal
          isOpen={!!selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
          title={`Pharmacy Dossier: ${selectedPharmacy.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>License:</strong> {selectedPharmacy.licenseNumber || 'Not provided'}</p>
              <p><strong>Registered Address:</strong> {selectedPharmacy.address}</p>
              <p><strong>Operating Hours:</strong> {formatHours(selectedPharmacy.operatingHours)}</p>
              <p><strong>Contact:</strong> {selectedPharmacy.phone} • {selectedPharmacy.email}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedPharmacy(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPharmaciesPage;
