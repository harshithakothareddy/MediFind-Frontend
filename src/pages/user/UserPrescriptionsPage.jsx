import React, { useEffect, useState } from 'react';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import Button from '../../components/common/Button';
import { pharmacyService } from '../../api/pharmacyService';
import { prescriptionService } from '../../api/prescriptionService';
import { toast } from 'react-toastify';

const UserPrescriptionsPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pharmacyId, setPharmacyId] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadData = () => Promise.all([
    prescriptionService.getMine(),
    pharmacyService.getAll({ page: 0, size: 100 }),
  ]).then(([prescriptionResponse, pharmacyResponse]) => {
    setDocuments(Array.isArray(prescriptionResponse.data) ? prescriptionResponse.data : []);
    const page = pharmacyResponse.data;
    const rows = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : [];
    setPharmacies(rows.filter((pharmacy) => pharmacy.verified));
  }).catch((error) => toast.error(error.message || 'Could not load prescriptions or pharmacies.'))
    .finally(() => setLoading(false));

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file || !pharmacyId) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Choose a file smaller than 10 MB.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await prescriptionService.upload(Number(pharmacyId), formData);
      toast.success('Prescription sent to the selected pharmacy for review.');
      setFile(null);
      form.reset();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Could not upload this prescription.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (document) => {
    if (!window.confirm(`Delete ${document.originalFilename}?`)) return;
    try {
      await prescriptionService.delete(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      toast.success('Prescription deleted.');
    } catch (error) {
      toast.error(error.message || 'Could not delete this prescription.');
    }
  };

  const downloadDocument = async (document) => {
    try {
      const response = await prescriptionService.download(document.id);
      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalFilename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(error.message || 'Could not download this prescription.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">Prescriptions</h1>
        <p className="mt-1 text-sm text-neutral-500">Send a prescription privately to a verified pharmacy for review.</p>
      </header>

      <form onSubmit={handleUpload} className="grid gap-4 border-y border-neutral-200 py-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="space-y-1 text-sm font-semibold text-neutral-800">
          Pharmacy
          <select className="input w-full" value={pharmacyId} onChange={(event) => setPharmacyId(event.target.value)} required>
            <option value="">Select a verified pharmacy</option>
            {pharmacies.map((pharmacy) => <option key={pharmacy.id} value={pharmacy.id}>{pharmacy.name} · {pharmacy.area}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-semibold text-neutral-800">
          Prescription file
          <input className="input w-full text-sm" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
          <span className="block text-xs font-normal text-neutral-500">PDF, JPEG, or PNG · up to 10 MB</span>
        </label>
        <Button type="submit" variant="primary" disabled={uploading || !file || !pharmacyId} className="inline-flex items-center gap-2">
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Send for Review'}
        </Button>
      </form>

      <p className="text-xs text-neutral-500">Access is limited to you, the selected pharmacy, and authorized administrators. Delete pending files you no longer need.</p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-neutral-900">Uploaded Documents</h2>
        {loading ? <p className="py-5 text-sm text-neutral-500">Loading documents…</p>
          : documents.length === 0 ? <p className="border-y border-neutral-200 py-5 text-sm text-neutral-500">No prescriptions uploaded.</p>
            : <div className="divide-y divide-neutral-200">{documents.map((document) => (
              <article key={document.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                  <div>
                    <strong className="text-sm text-neutral-900">{document.originalFilename}</strong>
                    <p className="mt-1 text-xs text-neutral-500">{document.pharmacyName} · {new Date(document.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs font-semibold text-neutral-700">{document.status.replaceAll('_', ' ')}</p>
                    {document.reviewNotes && <p className="mt-1 text-xs text-neutral-600">Pharmacy note: {document.reviewNotes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start">
                  <button type="button" onClick={() => downloadDocument(document)} className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 hover:underline"><Download className="h-4 w-4" /> View file</button>
                  {document.status === 'PENDING' && <button type="button" onClick={() => deleteDocument(document)} className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 hover:underline"><Trash2 className="h-4 w-4" /> Delete</button>}
                </div>
              </article>
            ))}</div>}
      </section>
    </div>
  );
};

export default UserPrescriptionsPage;