import React, { useState } from 'react';
import { Clock, Save, CheckCircle, ShieldAlert } from 'lucide-react';
import { OPERATING_DAYS } from '../../constants/demoData';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const PharmacyOperatingHoursPage = () => {
  const [is24x7, setIs24x7] = useState(false);
  const [schedule, setSchedule] = useState({
    monday: { open: '08:00', close: '22:00', isOpen: true },
    tuesday: { open: '08:00', close: '22:00', isOpen: true },
    wednesday: { open: '08:00', close: '22:00', isOpen: true },
    thursday: { open: '08:00', close: '22:00', isOpen: true },
    friday: { open: '08:00', close: '22:00', isOpen: true },
    saturday: { open: '09:00', close: '21:00', isOpen: true },
    sunday: { open: '10:00', close: '18:00', isOpen: true },
  });

  const handleToggleDay = (dayKey) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], isOpen: !prev[dayKey].isOpen }
    }));
  };

  const handleTimeChange = (dayKey, field, val) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: val }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Operating hours updated successfully in MediFind search!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Store Operating Hours</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Controls your live "Open Now" / "Closed" badge across medicine search results
        </p>
      </div>

      <form onSubmit={handleSave} className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-6">
        {/* 24/7 Toggle */}
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-teal-900">24/7 Emergency Pharmacy Service</h3>
            <p className="text-xs text-teal-700">Display as continuously open for urgent and night-time prescriptions</p>
          </div>
          <input
            type="checkbox"
            checked={is24x7}
            onChange={(e) => setIs24x7(e.target.checked)}
            className="w-5 h-5 text-teal-600 rounded border-teal-300 focus:ring-teal-500"
          />
        </div>

        {/* Day-by-Day Schedule */}
        <div className={`space-y-3 ${is24x7 ? 'opacity-40 pointer-events-none' : ''}`}>
          {OPERATING_DAYS.map((day) => {
            const dayData = schedule[day.key];
            return (
              <div key={day.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dayData.isOpen}
                    onChange={() => handleToggleDay(day.key)}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300"
                  />
                  <span className="font-semibold text-sm text-neutral-900 w-28">{day.label}</span>
                </div>

                {dayData.isOpen ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span>Opens:</span>
                    <input
                      type="time"
                      value={dayData.open}
                      onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                      className="input py-1 px-2 text-xs w-28"
                    />
                    <span>Closes:</span>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                      className="input py-1 px-2 text-xs w-28"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-red-500 font-semibold py-1">Closed for business</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button type="submit" variant="primary" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Store Schedule
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PharmacyOperatingHoursPage;
