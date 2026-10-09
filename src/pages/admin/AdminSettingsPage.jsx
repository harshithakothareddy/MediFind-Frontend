import React, { useState } from 'react';
import { Settings, Shield, Database, Bell, Save, RefreshCw, Key } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    platformName: 'MediFind Health Network',
    searchRadiusKm: '15',
    maxHoldHours: '3',
    requireLicenseVerification: true,
    autoDiscrepancyThreshold: '3',
    systemEmail: 'system@medifind.com',
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Platform-wide system configuration saved!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Platform Global System Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Configure search radius parameters, merchant verification constraints, and global system thresholds
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-4">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600" /> Search & Marketplace Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Legal Name"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              required
            />
            <Input
              label="Default Patient Search Radius (km)"
              type="number"
              value={settings.searchRadiusKm}
              onChange={(e) => setSettings({ ...settings, searchRadiusKm: e.target.value })}
              required
            />
            <Input
              label="Standard Pickup Hold Expiration (Hours)"
              type="number"
              value={settings.maxHoldHours}
              onChange={(e) => setSettings({ ...settings, maxHoldHours: e.target.value })}
              required
            />
            <Input
              label="Discrepancy Auto-Investigation Trigger (Reports)"
              type="number"
              value={settings.autoDiscrepancyThreshold}
              onChange={(e) => setSettings({ ...settings, autoDiscrepancyThreshold: e.target.value })}
              helperText="Flags pharmacy for audit if multiple patients report issues"
              required
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireLicenseVerification}
                onChange={(e) => setSettings({ ...settings, requireLicenseVerification: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-neutral-300"
              />
              <span className="text-xs font-semibold text-neutral-800">
                Mandatory Drug License verification before any pharmacy can list live inventory
              </span>
            </label>
          </div>
        </div>

        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-4">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600" /> Database Cache & POS Maintenance
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <strong className="block text-neutral-900">Purge Distributed Query Cache</strong>
              <span className="text-neutral-500">Flush edge Redis clusters and re-index active medicines</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => toast.success('Edge Redis cache cleared and re-warmed')}
            >
              Flush Cache
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Master Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
