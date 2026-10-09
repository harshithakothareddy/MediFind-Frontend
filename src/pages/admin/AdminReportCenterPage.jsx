import React from 'react';
import { FileText, Download, ShieldCheck, Database, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const AdminReportCenterPage = () => {
  const reports = [
    { title: 'National Medicine Availability Index Report', desc: 'Aggregated quarterly report on essential medicine availability percentages across municipal districts.', date: 'Q3 2026', size: '4.8 MB', format: 'PDF' },
    { title: 'Retail Pharmacy Regulatory Verification Audit', desc: 'Comprehensive log of all Form 20/21 license verifications, renewals, and regulatory suspensions.', date: 'October 2026', size: '1.9 MB', format: 'PDF' },
    { title: 'Drug Shortage Early Warning & Anomaly Log', desc: 'Critical supply chain indicators showing items with rapid inventory drop across 100+ stores.', date: 'Live Snapshot', size: '890 KB', format: 'XLSX' },
    { title: 'User Availability Discrepancy & Dispute History', desc: 'Complete breakdown of all discrepancy submissions, resolution times, and merchant corrections.', date: 'September 2026', size: '640 KB', format: 'CSV' },
  ];

  const handleDownload = (title) => {
    toast.info(`Preparing ${title} for export...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Executive Report Center</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Download regulatory healthcare reports, supply chain shortage alerts, and nationwide audit files
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => toast.success('Generated custom government health department export')}
          className="flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" /> Generate Custom Export
        </Button>
      </div>

      <div className="card border border-neutral-200 shadow-sm bg-white divide-y divide-neutral-200 overflow-hidden">
        {reports.map((r, i) => (
          <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-neutral-900">{r.title}</h3>
                <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">{r.desc}</p>
                <div className="text-[11px] text-neutral-400 flex items-center gap-3 pt-1">
                  <span>Period: {r.date}</span>
                  <span>•</span>
                  <span>Format: {r.format}</span>
                  <span>•</span>
                  <span>Size: {r.size}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(r.title)}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Download className="w-4 h-4" /> Download Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReportCenterPage;
