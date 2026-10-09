import React, { useCallback, useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import { adminService } from '../../api/adminService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getUsers({ page: 0, size: 100 });
      const payload = response.data;
      const content = Array.isArray(payload) ? payload : payload?.content || payload?.items || [];
      setUsers(content);
      setTotalUsers(payload?.totalElements ?? content.length);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load users from the database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleBan = async (user) => {
    try {
      if (user.enabled) await adminService.deactivateUser(user.id);
      else await adminService.activateUser(user.id);
      setUsers(previous => previous.map(item => item.id === user.id ? { ...item, enabled: !user.enabled } : item));
      toast.success(`${user.email} ${user.enabled ? 'deactivated' : 'activated'}`);
    } catch (requestError) {
      toast.error(requestError?.message || 'Unable to update this account.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Platform Users & Access Roles</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Audit registered database accounts and their access status
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-semibold border border-purple-200">
          Total Registered: {totalUsers}
        </span>
        <Button variant="secondary" size="sm" onClick={loadUsers} disabled={loading} aria-label="Refresh users">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="card p-4 border border-neutral-200 shadow-sm bg-white flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input sm:w-48 text-xs"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">General Patients / Users</option>
          <option value="PHARMACY">Pharmacy Managers</option>
          <option value="ADMIN">System Admins</option>
        </select>
      </div>

      <div className="card border border-neutral-200 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3 px-5 font-semibold">User Profile</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Joined</th>
                <th className="py-3 px-4 font-semibold">Last Login</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-neutral-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading database users…</td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-red-700"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-neutral-500">No matching database users.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-4 px-5">
                    <strong className="font-bold text-neutral-900 block">{[u.firstName, u.lastName].filter(Boolean).join(' ')}</strong>
                    <span className="text-xs text-neutral-500">{u.email}</span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : u.role === 'PHARMACY'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-600 font-mono">
                    {u.phone}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs text-neutral-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        u.enabled
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {u.enabled ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    {u.role !== 'ADMIN' && (
                      <Button
                        variant={u.enabled ? 'secondary' : 'teal'}
                        size="sm"
                        onClick={() => handleToggleBan(u)}
                        className="text-xs py-1 px-2.5"
                      >
                        {u.enabled ? 'Suspend' : 'Activate'}
                      </Button>
                    )}
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

export default AdminUsersPage;
