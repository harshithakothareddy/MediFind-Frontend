import React, { useState } from 'react';
import { Store, ShieldCheck, MapPin, Phone, Mail, Save, Award, Upload } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const PharmacyProfilePage = () => {
  const [profile, setProfile] = useState({
    name: 'Apollo Pharmacy — Demo Branch',
    pharmacistName: 'Dr. Suresh Mehta (Reg. Pharmacist #68192)',
    licenseNumber: 'DL-2024-00892B',
    phone: '+91 98000 00001',
    email: 'apollo.demo@medifind.com',
    address: '12, MG Road, Sector 5, New Delhi 110001',
    description: 'Premier authorized pharmacy providing genuine prescription medicines, patient counseling, and temperature-controlled cold chain vaccine storage.',
    homeDelivery: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Pharmacy profile information updated!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Pharmacy Business Profile</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Public credentials, verified license details, contact channels, and store address
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 border border-neutral-200 shadow-sm bg-white space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-teal-600" /> Commercial Details
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#064e3b] font-semibold border border-[#a7f3d0] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" /> Verified State Vendor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Public Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
            <Input
              label="Drug Retail License (Form 20/21)"
              value={profile.licenseNumber}
              onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
              required
            />
            <Input
              label="Chief Pharmacist in Charge"
              value={profile.pharmacistName}
              onChange={(e) => setProfile({ ...profile, pharmacistName: e.target.value })}
              required
            />
            <Input
              label="Support Phone (Visible in Search)"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              required
            />
            <Input
              label="Official Contact Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
            <Input
              label="Full Physical Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700">Store About / Description</label>
            <textarea
              className="input min-h-[90px] resize-none"
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Store Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PharmacyProfilePage;
