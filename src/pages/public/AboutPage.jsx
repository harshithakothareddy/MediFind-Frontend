import React from 'react';
import { ShieldCheck, Heart, Users, MapPin, Award, CheckCircle, Sparkles, Stethoscope } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-neutral-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Healthcare Infrastructure Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Bridging Patients with Verified Neighborhood Pharmacies
          </h1>
          <p className="text-base text-neutral-600 max-w-2xl mx-auto">
            MediFind was created to solve critical drug unavailability by providing real-time inventory visibility across community pharmacies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border border-neutral-200 bg-white space-y-2">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
            <h3 className="font-bold text-base text-neutral-900">100% Licensed Stores</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every participating chemist is verified through Form 20/21 drug retail credentials issued by State Drug Controllers.
            </p>
          </div>

          <div className="card p-6 border border-neutral-200 bg-white space-y-2">
            <Award className="w-8 h-8 text-primary-600" />
            <h3 className="font-bold text-base text-neutral-900">Price Transparency</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Compare retail prices across licensed stores and discover affordable generic equivalents with identical bio-efficacy.
            </p>
          </div>

          <div className="card p-6 border border-neutral-200 bg-white space-y-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h3 className="font-bold text-base text-neutral-900">No Advance Payment</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Reserve emergency stock online with a free 3-hour hold pass. Pay only at the counter upon physical inspection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
