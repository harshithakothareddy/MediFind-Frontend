import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill, Bell, Trash2, ExternalLink, Search, Plus, CheckCircle,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { DEMO_MEDICINES } from '../../constants/demoData';
import { AvailabilityBadge } from '../../components/common/Badges';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const SavedMedicinesPage = () => {
  const [savedList, setSavedList] = useState([
    {
      id: 1,
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      category: 'Analgesic',
      strength: '500mg',
      dosageForm: 'Tablet',
      status: 'AVAILABLE',
      notifyOnRestock: true,
      lastChecked: '10 mins ago',
      availablePharmacies: 10,
    },
    {
      id: 2,
      name: 'Amoxicillin',
      genericName: 'Amoxicillin Trihydrate',
      category: 'Antibiotic',
      strength: '250mg',
      dosageForm: 'Capsule',
      status: 'LOW_STOCK',
      notifyOnRestock: true,
      lastChecked: '1 hour ago',
      availablePharmacies: 6,
    },
    {
      id: 3,
      name: 'Cetirizine',
      genericName: 'Cetirizine HCl',
      category: 'Antihistamine',
      strength: '10mg',
      dosageForm: 'Tablet',
      status: 'AVAILABLE',
      notifyOnRestock: false,
      lastChecked: 'Yesterday',
      availablePharmacies: 8,
    },
    {
      id: 5,
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      category: 'NSAID',
      strength: '400mg',
      dosageForm: 'Tablet',
      status: 'AVAILABLE',
      notifyOnRestock: true,
      lastChecked: '2 hours ago',
      availablePharmacies: 9,
    },
  ]);

  const handleRemove = (id, name) => {
    setSavedList(prev => prev.filter(m => m.id !== id));
    toast.info(`${name} removed from your saved list`);
  };

  const toggleNotify = (id) => {
    setSavedList(prev => prev.map(m =>
      m.id === id ? { ...m, notifyOnRestock: !m.notifyOnRestock } : m
    ));
    toast.success('Notification preference updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Saved Medications</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Monitor real-time stock and receive instant restock alerts for your essential drugs
          </p>
        </div>

        <Link to="/search" className="btn-primary text-xs py-2 px-4">
          <Search className="w-3.5 h-3.5" /> Find More Medicines
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savedList.map((item) => (
          <div key={item.id} className="card p-6 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4 bg-white">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <Link
                      to={`/medicines/${item.id}`}
                      className="font-bold text-base text-neutral-900 hover:text-primary-600 transition-colors"
                    >
                      {item.name} ({item.strength})
                    </Link>
                    <p className="text-xs text-neutral-500">Generic: {item.genericName}</p>
                  </div>
                </div>

                <AvailabilityBadge status={item.status} />
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs flex items-center justify-between">
                <div>
                  <span className="text-neutral-500 block">Nearby Pharmacies</span>
                  <span className="font-bold text-neutral-900">{item.availablePharmacies} stores in stock</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block">Last checked</span>
                  <span className="text-neutral-700 font-medium">{item.lastChecked}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => toggleNotify(item.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                  item.notifyOnRestock
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${item.notifyOnRestock ? 'fill-current' : ''}`} />
                {item.notifyOnRestock ? 'Alerts On' : 'Alerts Off'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemove(item.id, item.name)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/medicines/${item.id}`}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  View Stock
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedMedicinesPage;
