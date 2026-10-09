import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, ShoppingCart, AlertTriangle, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const PharmacyNotificationsPage = () => {
  const [items, setItems] = useState([
    { id: 1, title: 'New Medicine Hold Placed', msg: 'Customer reserved 2 units of Amoxicillin 250mg. Hold expires in 2.5 hours.', time: '12 mins ago', unread: true },
    { id: 2, title: 'Critical Stock Alert Triggered', msg: 'Cetirizine 10mg has reached 0 units. It is currently marked Out of Stock in search.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Pharmacy License Verification Approved', msg: 'Admin compliance team verified your updated Drug License document DL-2026-X.', time: 'Yesterday', unread: false },
    { id: 4, title: 'Customer Feedback Discrepancy Note', msg: 'A patient reported Paracetamol price variance of ₹2.50. Please audit listed unit pricing.', time: '2 days ago', unread: false },
  ]);

  const markAll = () => {
    setItems(prev => prev.map(i => ({ ...i, unread: false })));
    toast.success('Marked all as read');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Pharmacy Portal Notifications</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Operational alerts, customer reservation pings, and regulatory messages
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={markAll}>
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((n) => (
          <div
            key={n.id}
            className={`card p-4 border transition-colors flex items-start justify-between gap-4 ${
              n.unread ? 'bg-primary-50/40 border-primary-200' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-neutral-900">{n.title}</h3>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-primary-600"></span>}
                </div>
                <p className="text-xs text-neutral-600">{n.msg}</p>
                <span className="text-[11px] text-neutral-400 block pt-1">{n.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyNotificationsPage;
