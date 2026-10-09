import React, { useState } from 'react';
import { ClipboardList, Shield, User, Store, Key, Filter, Search } from 'lucide-react';

const AdminAuditLogsPage = () => {
  const [logs] = useState([
    { id: 'LOG-7721', timestamp: '2026-10-03 10:14:22', user: 'admin@medifind.com', action: 'PHARMACY_APPROVED', target: 'Apollo Pharmacy — Demo Branch', ip: '192.168.1.42', status: 'SUCCESS' },
    { id: 'LOG-7720', timestamp: '2026-10-03 09:45:10', user: 'system_cron', action: 'GLOBAL_POS_SYNC', target: '134 Store Nodes', ip: '10.0.0.1', status: 'SUCCESS' },
    { id: 'LOG-7719', timestamp: '2026-10-03 08:30:15', user: 'admin@medifind.com', action: 'DRUG_CATALOG_UPDATED', target: 'Paracetamol 500mg (GSK)', ip: '192.168.1.42', status: 'SUCCESS' },
    { id: 'LOG-7718', timestamp: '2026-10-02 18:22:40', user: 'security_daemon', action: 'FAILED_ADMIN_LOGIN', target: 'admin@medifind.com', ip: '203.0.113.195', status: 'BLOCKED' },
    { id: 'LOG-7717', timestamp: '2026-10-02 14:10:05', user: 'admin@medifind.com', action: 'DISCREPANCY_RESOLVED', target: 'REP-902 (HealthKart)', ip: '192.168.1.42', status: 'SUCCESS' },
    { id: 'LOG-7716', timestamp: '2026-10-01 11:05:30', user: 'admin@medifind.com', action: 'ROLE_MODIFIED', target: 'User #8210 promoted to Pharmacist', ip: '192.168.1.42', status: 'SUCCESS' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    !search ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">System Audit & Security Logs</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Immutable regulatory audit log of administrative operations, verification events, and data changes
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-600" /> Tamper-evident Audit Vault Active
        </span>
      </div>

      <div className="card p-4 border border-neutral-200 shadow-sm bg-white">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by action, operator, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>
      </div>

      <div className="card border border-neutral-200 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-sans">
              <tr>
                <th className="py-3 px-5 font-semibold">Event ID</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Operator</th>
                <th className="py-3 px-4 font-semibold">Action Trigger</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-5 font-bold text-primary-700">
                    {log.id}
                  </td>
                  <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-neutral-800 font-sans font-medium">
                    {log.user}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-600 font-sans">
                    {log.target}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {log.ip}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;
