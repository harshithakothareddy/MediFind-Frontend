import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does medicine reservation work?',
      a: 'When you find a pharmacy with your required medicine in stock, click "Hold / Reserve". You receive an instant 6-digit pickup code. The chemist holds the medicine behind the counter for 3 hours. Simply present the code and doctor prescription at the store to purchase.'
    },
    {
      q: 'Do I have to pay online in advance?',
      a: 'No. MediFind holds are 100% free of charge. You inspect the medicine packaging, batch, and expiry date at the pharmacy counter before paying the chemist directly.'
    },
    {
      q: 'How accurate is the inventory data?',
      a: 'Pharmacies sync their electronic point-of-sale (POS) systems every 15 minutes. In the rare event of an unexpected stockout, users can submit a 1-click Discrepancy Report from the medicine page.'
    },
    {
      q: 'How do community pharmacies register?',
      a: 'Chemist owners can register by clicking "Register" and selecting the "Pharmacy" account type. Once you upload your valid Drug License (Form 20/21), our compliance team verifies it within 24 hours.'
    },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-neutral-500 text-sm">Everything you need to know about searching, reserving, and verifying medicines</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card border border-neutral-200 bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-4 text-left font-bold text-sm text-neutral-900 flex items-center justify-between hover:bg-neutral-50"
              >
                <span>{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card p-6 border border-neutral-200 bg-primary-50/50 text-center space-y-3">
          <h3 className="font-bold text-base text-neutral-900">Still have questions?</h3>
          <p className="text-xs text-neutral-600">Our patient assistance support desk is operational 24/7 for emergency drug queries.</p>
          <div className="flex justify-center gap-3 pt-1">
            <a href="mailto:support@medifind.com" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> support@medifind.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
