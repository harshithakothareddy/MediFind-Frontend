import React, { useState } from 'react';
import { Settings, RefreshCw, Key, Shield, Bell, Save } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const PharmacySettingsPage = () => {
  const [apiKey, setApiKey] = useState('mdf_live_8910482049102840192840');
  const [posSyncInterval, setPosSyncInterval] = useState('15');
  const [autoHoldDuration, setAutoHoldDuration] = useState('3');
  const [notifications, setNotifications] = useState({
    smsHolds: true,
    emailDailyReport: true,
    lowStockPings: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Pharmacy system settings successfully saved!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Portal Configuration & Integrations</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Automated inventory sync API keys, pickup hold timeout rules, and system alert hooks
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* POS Sync & Webhooks */}
        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-4">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary-600" /> POS & ERP Inventory Synchronization
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">MediFind Store API Sync Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="input font-mono text-xs bg-neutral-50 flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    toast.info('API Key copied to clipboard!');
                  }}
                >
                  Copy Key
                </Button>
              </div>
              <span className="text-[11px] text-neutral-500 block">Use this key in your local pharmacy ERP / Marg / MedPlus POS software for hourly sync.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700">Sync Frequency (Minutes)</label>
                <select
                  value={posSyncInterval}
                  onChange={(e) => setPosSyncInterval(e.target.value)}
                  className="input text-xs"
                >
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes (Recommended)</option>
                  <option value="60">Every 1 hour</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700">Customer Pickup Hold Duration</label>
                <select
                  value={autoHoldDuration}
                  onChange={(e) => setAutoHoldDuration(e.target.value)}
                  className="input text-xs"
                >
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="3">3 Hours (Standard)</option>
                  <option value="6">6 Hours</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-4">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" /> Operational Alerts
          </h2>

          <div className="space-y-3">
            {[
              { key: 'smsHolds', label: 'Instant SMS alert for new counter holds', desc: 'Pharmacist is alerted the second a patient reserves medication online' },
              { key: 'lowStockPings', label: 'Safety stock warning pings', desc: 'Trigger alert when any SKU breaches the safety threshold' },
              { key: 'emailDailyReport', label: 'Daily closing summary email', desc: 'Summary of inventory updates, holds dispensed, and canceled requests' },
            ].map(pref => (
              <label key={pref.key} className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[pref.key]}
                  onChange={(e) => setNotifications({ ...notifications, [pref.key]: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 mt-1"
                />
                <div>
                  <span className="text-sm font-semibold text-neutral-900 block">{pref.label}</span>
                  <span className="text-xs text-neutral-500">{pref.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PharmacySettingsPage;
