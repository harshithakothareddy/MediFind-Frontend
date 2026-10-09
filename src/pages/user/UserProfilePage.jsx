import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Mail, Phone, MapPin, Shield, Bell,
  Save, CheckCircle, Upload, FileText
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const UserProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Aryan Sharma',
    email: user?.email || 'user@medifind.com',
    phone: user?.phone || '+91 98111 22233',
    address: '42, Green Avenue, New Delhi, India',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Sulfa drugs',
    emergencyContact: '+91 98111 44455',
  });

  const [notifications, setNotifications] = useState({
    smsAlerts: true,
    emailAlerts: true,
    restockPush: true,
    reservationReminders: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile preferences successfully saved!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Account & Healthcare Profile</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage your personal information, emergency health notes, and restock notification channels
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-5">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Primary Delivery/Location Area"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* Medical Notes for Fast Dispensary Checkout */}
        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-5">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" /> Patient Health Notes (Counter Check)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Known Drug Allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              helperText="Pharmacists will cross-check for contraindications"
            />
            <Input
              label="Emergency Contact Number"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-4">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" /> Notification Channels
          </h2>

          <div className="space-y-3">
            {[
              { key: 'smsAlerts', label: 'SMS Stock Alert Notifications', desc: 'Receive immediate text messages when a tracked drug is restocked' },
              { key: 'emailAlerts', label: 'Email Confirmations & Hold Summaries', desc: 'Receive pickup tokens, directions, and pharmacy invoices' },
              { key: 'reservationReminders', label: 'Reservation Expiration Reminders', desc: 'Alerts 30 minutes before your 3-hour medicine pickup window expires' },
            ].map((pref) => (
              <label key={pref.key} className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notifications[pref.key]}
                  onChange={(e) => setNotifications({ ...notifications, [pref.key]: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 mt-1"
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
            <Save className="w-4 h-4" /> Save Profile Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
