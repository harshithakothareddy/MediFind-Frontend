import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Globe, Share2, Mail, Phone } from 'lucide-react';

const Footer = () => (
  <footer className="bg-[#064e3b] text-neutral-200 border-t border-[#0f766e]/40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Medi<span className="text-[#a7f3d0]">Find</span>
            </span>
          </Link>
          <p className="text-sm text-emerald-100/80 leading-relaxed mb-4 max-w-xs">
            MediFind helps you discover medicine availability and find pharmacies near you. A platform for informed healthcare decisions.
          </p>
          <div className="p-3 bg-[#022c22]/60 rounded-xl border border-emerald-700/40 mb-4">
            <p className="text-xs text-[#d1fae5] leading-relaxed">
              <strong>Disclaimer:</strong> MediFind provides medicine availability and pharmacy information. It does not provide personalized medical diagnosis, dosage, or treatment advice. Always consult a qualified healthcare professional.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { icon: Globe, label: 'Website' },
              { icon: Share2, label: 'Network' },
              { icon: Mail, label: 'Email' },
              { icon: Phone, label: 'Phone' },
            ].map(({ icon: Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="w-8 h-8 bg-[#022c22] rounded-lg flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Platform</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Find Medicine', to: '/medicines' },
              { label: 'Scan / Upload Rx', to: '/scan-prescription' },
              { label: 'Pharmacies', to: '/pharmacies' },
              { label: 'Compare', to: '/compare' },
              { label: 'Nearby', to: '/nearby' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-emerald-100/70 hover:text-white hover:underline transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Account</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Login', to: '/login' },
              { label: 'Register', to: '/register' },
              { label: 'Help', to: '/help' },
              { label: 'Contact', to: '/help#contact' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-emerald-100/70 hover:text-white hover:underline transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Legal</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Service', to: '/terms' },
              { label: 'Disclaimer', to: '/disclaimer' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-emerald-100/70 hover:text-white hover:underline transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-1.5">
            <a href="mailto:hello@medifind.demo" className="flex items-center gap-2 text-xs text-emerald-200/70 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5" /> hello@medifind.demo
            </a>
            <a href="tel:+1800MEDIFIND" className="flex items-center gap-2 text-xs text-emerald-200/70 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" /> 1800-MEDIFIND
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-emerald-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-emerald-200/70">
          © 2026 MediFind. All rights reserved. Built for demonstration purposes.
        </p>
        <p className="text-xs text-emerald-300/60">
          Forest Green & Soft Mint Clinical Theme
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
