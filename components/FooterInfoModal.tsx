import React from 'react';
import { X, Shield, FileText, Mail, Phone, MapPin, Globe } from 'lucide-react';

export type FooterModalType = 'PRIVACY' | 'TERMS' | 'CONTACT' | null;

interface FooterInfoModalProps {
  type: FooterModalType;
  onClose: () => void;
}

export const FooterInfoModal: React.FC<FooterInfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'PRIVACY':
        return (
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <div className="flex items-center gap-2 mb-4 text-trust-blue dark:text-white">
              <Shield size={24} className="text-trust-green" />
              <h3 className="text-xl font-serif font-bold">Privacy Policy & Data Protection</h3>
            </div>
            <p><strong>Effective Date:</strong> January 1, 2024</p>
            
            <h4 className="font-bold text-gray-900 dark:text-white mt-4">1. Data Sovereignty</h4>
            <p>
              TrustBnB operates with a "Swiss-First" data architecture. All sensitive financial and personal identification data is encrypted using AES-256-GCM standards and stored in ISO 27001 certified data centers located within the European Union and Switzerland.
            </p>

            <h4 className="font-bold text-gray-900 dark:text-white mt-4">2. Information Collection</h4>
            <p>
              We collect information necessary to facilitate property management and bookings, including:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Identity documents (Passport/ID) for tourist registration (compliance with Albanian Law Nr. 93/2015).</li>
                <li>Financial details for payout processing (IBAN/SWIFT).</li>
                <li>Contact information for emergency correspondence.</li>
              </ul>
            </p>

            <h4 className="font-bold text-gray-900 dark:text-white mt-4">3. GDPR & Compliance</h4>
            <p>
              We fully comply with the General Data Protection Regulation (GDPR). You have the right to access, correct, or request deletion of your personal data ("Right to be Forgotten") at any time by contacting our Data Protection Officer.
            </p>
          </div>
        );
      case 'TERMS':
        return (
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <div className="flex items-center gap-2 mb-4 text-trust-blue dark:text-white">
              <FileText size={24} className="text-trust-blue" />
              <h3 className="text-xl font-serif font-bold">Terms of Service</h3>
            </div>
            <p><strong>Last Updated:</strong> August 15, 2024</p>

            <h4 className="font-bold text-gray-900 dark:text-white mt-4">1. Scope of Services</h4>
            <p>
              TrustBnB provides full-stack property management services acting as an agent on behalf of the Property Owner. Services include listing management, guest communication, cleaning, maintenance coordination, and financial reporting.
            </p>

            <h4 className="font-bold text-gray-900 dark:text-white mt-4">2. Commission & Fees</h4>
            <p>
              TrustBnB retains a flat commission of <strong>20%</strong> on the Net Booking Revenue (Gross booking value minus platform fees and taxes). Cleaning fees paid by guests are passed directly to cleaning staff/providers.
            </p>

            <h4 className="font-bold text-gray-900 dark:text-white mt-4">3. Owner Obligations</h4>
            <p>
              Owners must ensure the property meets basic health and safety standards (electricity, water, structural integrity). TrustBnB reserves the right to suspend listings that receive repeated quality complaints (Quality Score &lt; 80/100).
            </p>

            <h4 className="font-bold text-gray-900 dark:text-white mt-4">4. Liability</h4>
            <p>
              While TrustBnB performs rigorous guest screening, we are not liable for unforeseeable damage caused by third parties. We strongly recommend Owners maintain comprehensive property insurance.
            </p>
          </div>
        );
      case 'CONTACT':
        return (
          <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 mb-6 text-trust-blue dark:text-white">
              <Globe size={24} className="text-trust-blue" />
              <h3 className="text-xl font-serif font-bold">Contact & Support</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-trust-blue dark:text-white mb-3 flex items-center gap-2">
                  <MapPin size={16} /> Operational HQ
                </h4>
                <p>Rruga e Barrikadave, Nd. 12</p>
                <p>Tirana, 1001</p>
                <p className="mt-1 font-semibold">Albania</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-trust-blue dark:text-white mb-3 flex items-center gap-2">
                  <MapPin size={16} /> Tech & Finance Hub
                </h4>
                <p>Bahnhofstrasse 10</p>
                <p>8001 Zurich</p>
                <p className="mt-1 font-semibold">Switzerland</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-trust-blue dark:text-blue-300 rounded-full flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">General Support</p>
                  <a href="mailto:support@trustbnb.com" className="font-medium hover:text-trust-blue dark:hover:text-white transition-colors">support@trustbnb.com</a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">24/7 Owner Line</p>
                  <a href="tel:+35542223333" className="font-medium hover:text-trust-blue dark:hover:text-white transition-colors">+355 4 222 3333</a>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-trust-blue/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          {renderContent()}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2024 TrustBnB Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};