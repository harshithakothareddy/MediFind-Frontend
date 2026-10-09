import React, { useEffect, useState } from 'react';
import { Download, FileCheck2 } from 'lucide-react';
import { prescriptionService } from '../../api/prescriptionService';
import { toast } from 'react-toastify';

const PharmacyPrescriptionsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);

  const loadDocuments = () => prescriptionService.getPharmacyQueue()
    .then((response) => setDocuments(Array.isArray(response.data) ? response.data : []))
    .catch((error) => toast.error(error.message || 'Could not load prescriptions.'))
    .finally(() => setLoading(false));

  useEffect(() => {
    loadDocuments();
  }, []);

  const download = async (prescription) => {
    try {
      const response = await prescriptionService.download(prescription.id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = prescription.originalFilename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(error.message || 'Could not download this prescription.');
    }
  };

  const review = async (document, status) => {
    try {
      const response = await prescriptionService.review(document.id, status, notes[document.id] || '');
      setDocuments((items) => items.map((item) => item.id === document.id ? response.data : item));
      toast.success(`Prescription ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error(error.message || 'Could not save the review.');
    }
  };

  const pendingCount = documents.filter((document) => document.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">Prescription Reviews</h1>
        <p className="mt-1 text-sm text-neutral-500">{pendingCount} pending documents sent to this pharmacy.</p>
      </header>
      {loading ? <p className="py-6 text-sm text-neutral-500">Loading prescriptions…</p>
        : documents.length === 0 ? <p className="border-y border-neutral-200 py-6 text-sm text-neutral-500">No prescriptions have been sent here.</p>
          : <div className="divide-y divide-neutral-200">{documents.map((document) => (
            <article key={document.id} className="space-y-3 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <strong className="text-sm text-neutral-900">{document.patientName}</strong>
                  <p className="mt-1 text-sm text-neutral-700">{document.originalFilename}</p>
                  <p className="mt-1 text-xs text-neutral-500">Received {new Date(document.createdAt).toLocaleString()} · {Math.ceil(document.fileSize / 1024)} KB</p>
                </div>
                <button type="button" onClick={() => download(document)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline">
                  <Download className="h-4 w-4" /> View document
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-neutral-700">{document.status}</span>
                {document.status === 'PENDING' && <>
                  <input className="input min-w-56 flex-1" maxLength="1000" value={notes[document.id] || ''} onChange={(event) => setNotes((values) => ({ ...values, [document.id]: event.target.value }))} placeholder="Optional note for the patient" />
                  <button type="button" onClick={() => review(document, 'APPROVED')} className="btn-primary inline-flex items-center gap-2 text-sm"><FileCheck2 className="h-4 w-4" /> Approve</button>
                  <button type="button" onClick={() => review(document, 'REJECTED')} className="btn-secondary text-sm">Reject</button>
                </>}
              </div>
              {document.reviewNotes && <p className="text-xs text-neutral-600">Review note: {document.reviewNotes}</p>}
            </article>
          ))}</div>}
    </div>
  );
};

export default PharmacyPrescriptionsPage;