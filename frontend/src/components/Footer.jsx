import React from 'react';
import { Scale, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-on-surface text-inverse-on-surface py-xl px-xl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl mb-xl">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-sm mb-md">
              <Scale size={22} className="text-inverse-primary" />
              <span className="text-headline-sm font-bold text-inverse-on-surface">LawLink</span>
            </div>
            <p className="text-body-sm text-inverse-on-surface/60 leading-relaxed">
              Sri Lanka's trusted platform for accessible, affordable, and transparent legal services.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-label-md text-inverse-on-surface mb-md">Platform</h4>
            <ul className="space-y-sm">
              {['For Users', 'For Lawyers', 'Admin Panel', 'Pricing'].map(l => (
                <li key={l} className="text-body-sm text-inverse-on-surface/60 hover:text-inverse-on-surface cursor-pointer transition-colors">{l}</li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-label-md text-inverse-on-surface mb-md">Legal</h4>
            <ul className="space-y-sm">
              {['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Cookie Policy'].map(l => (
                <li key={l} className="text-body-sm text-inverse-on-surface/60 hover:text-inverse-on-surface cursor-pointer transition-colors">{l}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-label-md text-inverse-on-surface mb-md">Contact</h4>
            <ul className="space-y-sm">
              <li className="flex items-center gap-sm text-body-sm text-inverse-on-surface/60">
                <Mail size={14} /> help@lawlink.in
              </li>
              <li className="flex items-center gap-sm text-body-sm text-inverse-on-surface/60">
                <Phone size={14} /> +91-80-4567-8901
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-lg flex flex-col sm:flex-row items-center justify-between gap-sm">
          <p className="text-body-sm text-inverse-on-surface/40">© 2026 LawLink. All rights reserved.</p>
          <p className="text-body-sm text-inverse-on-surface/40">Making justice accessible for every Sri Lankan.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
