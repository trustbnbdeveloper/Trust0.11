import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Camera, Lock } from 'lucide-react';
import { Owner } from '../types';

interface OwnerProfileProps {
  owner: Owner;
  onSave: (updatedOwner: Owner) => void;
  onBack: () => void;
}

export const OwnerProfile: React.FC<OwnerProfileProps> = ({ owner, onSave, onBack }) => {
  const [formData, setFormData] = useState<Owner>(owner);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-trust-blue dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header / Banner */}
        <div className="h-32 bg-trust-blue relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-trust-gray dark:bg-gray-800 flex items-center justify-center text-2xl font-bold text-trust-blue dark:text-white border-2 border-white dark:border-trust-darkcard">
                  {formData.avatarInitials}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                <Camera className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-trust-blue dark:text-white">{formData.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${formData.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {formData.status} Member • Joined {formData.joinDate}
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm text-gray-400 uppercase font-semibold">Properties</div>
              <div className="text-2xl font-bold text-trust-blue dark:text-white">{formData.propertyCount}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Personal Info Group */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                  Personal Information
                </h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue text-sm dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue text-sm dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue text-sm dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Security Group */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                  Location & Security
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Primary Residence</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue text-sm dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                   <h4 className="text-sm font-medium text-trust-blue dark:text-white mb-2 flex items-center gap-2">
                     <Lock size={14} /> Security Settings
                   </h4>
                   <button type="button" className="text-xs text-trust-blue dark:text-blue-400 font-medium hover:underline block mb-1">
                     Change Password
                   </button>
                   <button type="button" className="text-xs text-trust-blue dark:text-blue-400 font-medium hover:underline block">
                     Manage Two-Factor Authentication
                   </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onBack}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-2.5 bg-trust-blue text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
                {!isSaving && <Save size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};