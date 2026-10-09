import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import { reportService } from '../../api/reportService';
import { toast } from 'react-toastify';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = () => {
    setLoading(true);
    reportService.getAllReports()
      .then((response) => setReports(Array.isArray(response.data) ? response.data : []))
      .catch((error) => toast.error(error.message || 'Could not load availability reports.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const updateStatus = async (report, status) => {
    try {
      const response = await reportService.updateReportStatus(report.id, status, report.adminNotes || '');
      setReports((items) => items.map((item) => item.id === report.id ? response.data : item));
      toast.success(`Report marked ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error(error.message || 'Could not update this report.');
    }
  };

  const pendingCount = reports.filter((report) => report.status === 'PENDING' || report.status === 'REVIEWING').length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Availability Discrepancy Reports</h1>
          <p className="mt-1 text-sm text-neutral-500">Review user reports about medicine stock, prices, or pharmacy hours.</p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800"><AlertTriangle className="h-4 w-4" /> {pendingCount} open reports</span>
      </header>

      {loading ? <p className="py-8 text-sm text-neutral-500">Loading reports…</p>
        : reports.length === 0 ? <p className="border-y border-neutral-200 py-8 text-sm text-neutral-500">No reports have been submitted.</p>
          : <div className="divide-y divide-neutral-200">{reports.map((report) => (
            <article key={report.id} className="space-y-3 py-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-neutral-900">{report.pharmacyName}</h2>
                  <p className="mt-1 text-xs text-neutral-500">{report.issueType.replaceAll('_', ' ')}{report.medicineName ? ` · ${report.medicineName}` : ''}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700"><Clock className="h-3.5 w-3.5" /> {report.status.replaceAll('_', ' ')}</span>
              </div>
              <p className="text-sm text-neutral-700">{report.details}</p>
              <p className="text-xs text-neutral-500">Reported by {report.reporterName} · {new Date(report.createdAt).toLocaleString()}</p>
              {report.adminNotes && <p className="text-xs text-neutral-600">Admin note: {report.adminNotes}</p>}
              {report.status !== 'RESOLVED' && report.status !== 'REJECTED' && (
                <div className="flex flex-wrap gap-2">
                  {report.status === 'PENDING' && <Button variant="secondary" size="sm" onClick={() => updateStatus(report, 'REVIEWING')}>Start Review</Button>}
                  <Button variant="teal" size="sm" onClick={() => updateStatus(report, 'RESOLVED')}><CheckCircle className="mr-1.5 h-4 w-4" /> Resolve</Button>
                  <Button variant="secondary" size="sm" onClick={() => updateStatus(report, 'REJECTED')}>Reject</Button>
                </div>
              )}
            </article>
          ))}</div>}
    </div>
  );
};

export default AdminReportsPage;
