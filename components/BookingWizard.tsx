import React, { useState } from 'react';
import { Calendar, Users, CreditCard, CheckCircle, ChevronRight, ChevronLeft, ShieldCheck, Lock, X, Wallet } from 'lucide-react';
import { Property } from '../types';

interface BookingWizardProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'DATES' | 'REVIEW' | 'PAYMENT' | 'SUCCESS';

export const BookingWizard: React.FC<BookingWizardProps> = ({ property, isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('DATES');
  
  // Form State
  const [guests, setGuests] = useState(2);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const [isProcessing, setIsProcessing] = useState(false);

  // Constants
  const cleaningFee = 45;
  const serviceFeePercent = 0.12;
  const taxesPercent = 0.08;

  // Derived State
  const nights = startDate && endDate 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  
  const pricePerNight = property.pricePerNight || 100;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * serviceFeePercent);
  const taxes = Math.round(subtotal * taxesPercent);
  const total = subtotal + cleaningFee + serviceFee + taxes;

  const handleNext = () => {
    if (step === 'DATES') setStep('REVIEW');
    else if (step === 'REVIEW') setStep('PAYMENT');
  };

  const handleBack = () => {
    if (step === 'REVIEW') setStep('DATES');
    else if (step === 'PAYMENT') setStep('REVIEW');
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API Payment Delay
    setTimeout(() => {
      setIsProcessing(false);
      setStep('SUCCESS');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-trust-blue/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white dark:bg-trust-darkcard border-b border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center z-10">
           <div>
             <h2 className="text-lg font-serif font-bold text-trust-blue dark:text-white">Request to Book</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400">{property.name}</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
             <X size={20} />
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: DATES & GUESTS */}
          {step === 'DATES' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="space-y-4">
                 <h3 className="font-semibold text-trust-blue dark:text-white flex items-center gap-2">
                   <Calendar size={18} /> Select Dates
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Check-in</label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-trust-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Check-out</label>
                      <input 
                        type="date" 
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-trust-blue outline-none"
                      />
                    </div>
                 </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                 <h3 className="font-semibold text-trust-blue dark:text-white flex items-center gap-2">
                   <Users size={18} /> Guests
                 </h3>
                 <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-200">{guests} Guest{guests > 1 ? 's' : ''}</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600"
                      >-</button>
                      <button 
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600"
                      >+</button>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* STEP 2: REVIEW PRICE */}
          {step === 'REVIEW' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-4">
                  <img src={property.imgUrl} alt="Thumbnail" className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-bold text-trust-blue dark:text-white text-sm">{property.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{property.location}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar size={12} /> {nights} Night{nights > 1 ? 's' : ''} • {guests} Guest{guests > 1 ? 's' : ''}
                    </div>
                  </div>
               </div>

               <div className="space-y-3 pt-2">
                 <h3 className="font-semibold text-sm text-trust-blue dark:text-white">Price Details</h3>
                 <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                   <span>€{pricePerNight} x {nights} nights</span>
                   <span>€{subtotal}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                   <span>Cleaning Fee</span>
                   <span>€{cleaningFee}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                   <span>TrustBnB Service Fee</span>
                   <span>€{serviceFee}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 pb-3 border-b border-gray-200 dark:border-gray-700">
                   <span>Taxes</span>
                   <span>€{taxes}</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-trust-blue dark:text-white pt-1">
                   <span>Total (EUR)</span>
                   <span>€{total}</span>
                 </div>
               </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'PAYMENT' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                 <h3 className="font-semibold text-trust-blue dark:text-white">Select Payment Method</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => setPaymentMethod('STRIPE')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'STRIPE' 
                        ? 'border-trust-blue bg-blue-50 text-trust-blue ring-1 ring-trust-blue dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-300' 
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                   >
                     <CreditCard size={24} />
                     <span className="text-sm font-bold">Card</span>
                   </button>
                   <button 
                    onClick={() => setPaymentMethod('PAYPAL')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'PAYPAL' 
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 dark:bg-blue-900/20 dark:text-blue-300' 
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                   >
                     <Wallet size={24} />
                     <span className="text-sm font-bold">PayPal</span>
                   </button>
                 </div>
              </div>

              {paymentMethod === 'STRIPE' ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Card Details</span>
                    <div className="flex gap-2 opacity-50">
                       <div className="w-8 h-5 bg-gray-300 rounded"></div>
                       <div className="w-8 h-5 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <input type="text" placeholder="Card number" className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-trust-blue" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM / YY" className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-trust-blue" />
                    <input type="text" placeholder="CVC" className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-trust-blue" />
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFC439] p-4 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                   <span className="font-bold text-blue-900 italic text-lg">Pay with PayPal</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-center">
                 <Lock size={12} /> Payments are secure and encrypted.
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-10 animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={40} />
               </div>
               <h2 className="text-2xl font-serif font-bold text-trust-blue dark:text-white mb-2">Booking Requested!</h2>
               <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                 Your request for <strong>{property.name}</strong> has been sent. The host will confirm shortly.
               </p>
               <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                 Close Window
               </button>
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        {step !== 'SUCCESS' && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-trust-darkcard flex justify-between items-center">
             {step !== 'DATES' ? (
               <button onClick={handleBack} className="text-gray-500 hover:text-trust-blue dark:text-gray-400 dark:hover:text-white text-sm font-medium flex items-center gap-1">
                 <ChevronLeft size={16} /> Back
               </button>
             ) : (
               <div></div> // Spacer
             )}

             {step === 'PAYMENT' ? (
                <button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="bg-trust-green text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Pay €${total}`}
                  {!isProcessing && <ShieldCheck size={16} />}
                </button>
             ) : (
                <button 
                  onClick={handleNext}
                  disabled={step === 'DATES' && (!startDate || !endDate)}
                  className="bg-trust-blue text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step === 'REVIEW' ? 'Continue to Payment' : 'Check Availability'} 
                  <ChevronRight size={16} />
                </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};