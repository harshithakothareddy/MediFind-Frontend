import React, { useState } from 'react';
import { Bell, ShieldAlert, CheckCircle, AlertTriangle, Store } from 'lucide-react';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const AdminNotificationsPage = () => {
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'New Pharmacy Verification Application', desc: 'LifeCare Meds (Noida) submitted Form 20/21 license documents for onboarding review.', time: '35 mins ago', unread: true },
    { id: 2, title: 'National Critical Drug Shortage Detected', desc: 'Metformin 500mg availability has dropped below 15% across North Zone pharmacies.', time: '2 hours ago', unread: true },
    { id: 3, title: 'POS Ingestion Sync Lag Alert', desc: 'CityCare Pharmacy POS webhook encountered a 4-minute delay during inventory push.', time: '5 hours ago', unread: false },
    { id: 4, title: 'Discrepancy Dispute Escalation', desc: 'Patient #9914 submitted receipt photo regarding price variance at HealthKart branch.', time: 'Yesterday', unread: false },
  ]);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All administrator notices marked as read');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">System & Regulatory Notifications</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Platform-wide health alerts, compliance verification submissions, and critical supply shortage warnings
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={markAllRead}>
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`card p-4 border transition-colors flex items-start justify-between gap-4 ${
              n.unread ? 'bg-purple-50/40 border-purple-200' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-neutral-900">{n.title}</h3>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
                </div>
                <p className="text-xs text-neutral-600">{n.desc}</p>
                <span className="text-[11px] text-neutral-400 block pt-1">{n.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
