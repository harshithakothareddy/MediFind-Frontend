import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { alertService } from '../../api/alertService';
import { notificationService } from '../../api/notificationService';
import { toast } from 'react-toastify';

const UserAlertsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => Promise.all([notificationService.getAll({ page: 0, size: 100 }), alertService.getAll()])
    .then(([notificationResponse, alertResponse]) => {
      setNotifications(Array.isArray(notificationResponse.data) ? notificationResponse.data : []);
      setStockAlerts(Array.isArray(alertResponse.data) ? alertResponse.data : []);
    })
    .catch((error) => toast.error(error.message || 'Could not load your alerts.'))
    .finally(() => setLoading(false));

  useEffect(() => {
    loadAlerts();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      toast.success('All notifications marked as read.');
    } catch (error) {
      toast.error(error.message || 'Could not update notifications.');
    }
  };

  const dismissNotification = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(error.message || 'Could not dismiss this notification.');
    }
  };

  const disableAlert = async (alert) => {
    try {
      const response = await alertService.disable(alert.id);
      setStockAlerts((items) => items.map((item) => item.id === alert.id ? response.data : item));
    } catch (error) {
      toast.error(error.message || 'Could not update this stock alert.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications & Stock Watch</h1>
          <p className="mt-1 text-sm text-neutral-500">Restock updates and medicine availability alerts for your account.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={markAllRead} disabled={!notifications.some((item) => !item.read)}>
          <Check className="mr-1.5 h-4 w-4" /> Mark All as Read
        </Button>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-neutral-900">Notifications</h2>
        {loading ? <p className="py-5 text-sm text-neutral-500">Loading notifications…</p>
          : notifications.length === 0 ? <p className="border-y border-neutral-200 py-5 text-sm text-neutral-500">No notifications yet.</p>
            : notifications.map((item) => (
              <article key={item.id} className={`flex items-start justify-between gap-4 border-y py-4 ${item.read ? 'border-neutral-200' : 'border-primary-200 bg-primary-50/40'}`}>
                <div className="flex gap-3">
                  <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{item.message}</p>
                    <time className="mt-2 block text-xs text-neutral-500">{new Date(item.createdAt).toLocaleString()}</time>
                  </div>
                </div>
                <button type="button" onClick={() => dismissNotification(item.id)} className="rounded p-2 text-neutral-500 hover:bg-red-50 hover:text-red-700" aria-label="Dismiss notification">
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-neutral-900">Watched Medicines</h2>
        {loading ? null : stockAlerts.length === 0 ? <p className="border-y border-neutral-200 py-5 text-sm text-neutral-500">You are not watching any medicines.</p>
          : stockAlerts.map((alert) => (
            <article key={alert.id} className="flex items-center justify-between gap-4 border-y border-neutral-200 py-4">
              <div>
                <strong className="text-sm text-neutral-900">{alert.medicineName}</strong>
                <p className="mt-1 text-xs text-neutral-500">{alert.active ? 'Watching for a verified restock' : 'Alert is inactive'}</p>
              </div>
              {alert.active && <Button variant="secondary" size="sm" onClick={() => disableAlert(alert)}>Turn Off</Button>}
            </article>
          ))}
      </section>
    </div>
  );
};

export default UserAlertsPage;
