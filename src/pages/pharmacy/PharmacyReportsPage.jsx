import React from 'react';
import { FileText, Download, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const PharmacyReportsPage = () => {
  const reports = [
    { title: 'Monthly Inventory Valuation Report', date: 'September 2026', size: '2.4 MB', type: 'PDF' },
    { title: 'Controlled Substance / Schedule H Dispensary Audit', date: 'Q3 2026', size: '1.1 MB', type: 'PDF' },
    { title: 'Stock Expiry Forecast (Next 90 Days)', date: 'Current', size: '840 KB', type: 'XLSX' },
    { title: 'Pickup Hold Fulfillment & Revenue Statement', date: 'September 2026', size: '520 KB', type: 'PDF' },
    { title: 'Discrepancy Resolution & Audit Log', date: 'August 2026', size: '310 KB', type: 'CSV' },
  ];

  const handleDownload = (title) => {
    toast.info(`Downloading ${title}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Compliance & Inventory Reports</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Download certified audit records, regulatory compliance statements, and stock movement reports
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => toast.success('Generated custom on-demand audit report!')}
          className="flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" /> Generate New Report
        </Button>
      </div>

      <div className="card border border-neutral-200 shadow-sm bg-white divide-y divide-neutral-200 overflow-hidden">
        {reports.map((rep, idx) => (
          <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">{rep.title}</h3>
                <p className="text-xs text-neutral-500">Period: {rep.date} • Format: {rep.type} • File size: {rep.size}</p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(rep.title)}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyReportsPage;
