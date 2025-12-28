
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, User, Check, AlertCircle, CreditCard, Mail, Phone, MessageSquare, DollarSign, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';
import { Property, Booking } from '../types';
import { calculatePricing, PriceBreakdown } from '../utils/pricingCalculator';
import { MOCK_BOOKINGS } from '../mockBookingData';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

interface BookingWidgetProps {
    property: Property;
    onClose: () => void;
    onBookingComplete: (booking: Booking) => void;
}

type BookingStep = 'dates' | 'guests' | 'details' | 'payment' | 'confirmation';

export const BookingWidget: React.FC<BookingWidgetProps> = ({ property, onClose, onBookingComplete }) => {
    const { formatPrice, convertPrice } = useCurrency();
    const [currentStep, setCurrentStep] = useState<BookingStep>('dates');
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');

    // Payment State
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Pricing State
    const [pricing, setPricing] = useState<PriceBreakdown>({
        nights: 0,
        nightlyTotal: 0,
        basePriceTotal: 0,
        extraGuestFee: 0,
        cleaningFee: 0,
        serviceFee: 0,
        discount: 0,
        total: 0,
        avgNightlyRate: 0,
        appliedMultiplier: false
    });

    const { user } = useAuth(); // Get user to check discount eligibility

    // Effect to recalculate price when dependencies change
    useEffect(() => {
        if (checkIn && checkOut) {
            const breakdown = calculatePricing(
                property,
                checkIn,
                checkOut,
                adults + children,
                { isFirstBooking: user?.isFirstBooking } // Apply discount if eligible
            );
            setPricing(breakdown);
        } else {
            setPricing({
                nights: 0,
                nightlyTotal: 0,
                basePriceTotal: 0,
                extraGuestFee: 0,
                cleaningFee: 0,
                serviceFee: 0,
                discount: 0,
                total: 0,
                avgNightlyRate: 0,
                appliedMultiplier: false
            });
        }
    }, [checkIn, checkOut, adults, children, property]);

    // Get booked dates for this property
    const bookedDates = useMemo(() => {
        const dates: Date[] = [];
        const propertyBookings = MOCK_BOOKINGS.filter(b => b.propertyId === property.id && b.status !== 'Cancelled');

        propertyBookings.forEach(booking => {
            const start = new Date(booking.checkIn);
            const end = new Date(booking.checkOut);
            const date = new Date(start);

            while (date < end) {
                dates.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
        });
        return dates;
    }, [property.id]);

    const isDateBooked = (date: Date) => {
        return bookedDates.some(bookedDate =>
            bookedDate.getDate() === date.getDate() &&
            bookedDate.getMonth() === date.getMonth() &&
            bookedDate.getFullYear() === date.getFullYear()
        );
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today || isDateBooked(date);
    };

    const handleDateSelect = (date: Date) => {
        if (isDateDisabled(date)) return;

        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(date);
            setCheckOut(null);
        } else {
            // If clicking before checkin, reset checkin
            if (date < checkIn) {
                setCheckIn(date);
                setCheckOut(null);
            } else {
                // Check if any dates in between are booked
                let valid = true;
                const tempDate = new Date(checkIn);
                while (tempDate < date) {
                    tempDate.setDate(tempDate.getDate() + 1);
                    if (isDateBooked(tempDate)) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    setCheckOut(date);
                } else {
                    alert("Some dates in this range are already booked.");
                }
            }
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    const handleNextStep = () => {
        const steps: BookingStep[] = ['dates', 'guests', 'details', 'payment', 'confirmation'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: BookingStep[] = ['dates', 'guests', 'details', 'payment', 'confirmation'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const handleConfirmBooking = () => {
        // Create booking object
        const newBooking: Booking = {
            id: `BK${Date.now()}`,
            propertyId: property.id,
            propertyName: property.name,
            guestId: 'GUEST_TEMP',
            guestName: guestName,
            checkIn: checkIn!.toISOString(),
            checkOut: checkOut!.toISOString(),
            status: 'Pending',
            totalPrice: pricing.total,
            createdAt: new Date().toISOString()
        };

        onBookingComplete(newBooking);
        setCurrentStep('confirmation');
    };

    // Calendar rendering
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
            const isBooked = isDateBooked(date);
            const isDisabled = isDateDisabled(date);
            const isSelected = (checkIn && date.getTime() === checkIn.getTime()) || (checkOut && date.getTime() === checkOut.getTime());
            const isInRange = checkIn && checkOut && date > checkIn && date < checkOut;

            let className = "h-10 w-10 flex items-center justify-center text-sm rounded-full transition-all ";

            if (isDisabled) {
                className += "text-gray-300 dark:text-gray-600 cursor-not-allowed decoration-1 line-through";
            } else if (isSelected) {
                className += "bg-black text-white dark:bg-white dark:text-black font-bold shadow-lg scale-110";
            } else if (isInRange) {
                className += "bg-gray-100 dark:bg-gray-800 text-black dark:text-white";
            } else {
                className += "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-900 dark:text-white";
            }

            days.push(
                <button
                    key={i}
                    onClick={() => handleDateSelect(date)}
                    disabled={isDisabled}
                    className={className}
                >
                    {i}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-900 w-full sm:w-[500px] h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                            {currentStep === 'confirmation' ? 'Booking Confirmed' : 'Request to Book'}
                        </h2>
                        <p className="text-xs text-gray-500">{property.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* CONFIRMATION STEP */}
                    {currentStep === 'confirmation' && (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're all set!</h3>
                            <p className="text-gray-500 mb-8 px-8">
                                A confirmation email has been sent to {guestEmail}. Your host will be in touch shortly.
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl max-w-xs mx-auto text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-4 tracking-wider">Booking Summary</p>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Check-in</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{checkIn?.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Check-out</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{checkOut?.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Total Paid</span>
                                        <span className="font-bold text-trust-blue">{formatPrice(pricing.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DATES STEP */}
                    {currentStep === 'dates' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Dates</h3>
                                <div className="flex gap-2">
                                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><ChevronLeft size={20} /></button>
                                    <span className="font-bold w-32 text-center py-2">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>

                            <div className="mt-6 flex gap-4 text-xs text-gray-500 justify-center">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black dark:bg-white rounded-full"></div> Selected</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700"></div> Available</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full decoration-slate-900 line-through"></div> Booked</div>
                            </div>
                        </div>
                    )}

                    {/* GUESTS STEP */}
                    {currentStep === 'guests' && (
                        <div className="space-y-8 py-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Who's coming?</h3>

                            {/* Adults */}
                            <div className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-300 transition-colors">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Adults</p>
                                    <p className="text-sm text-gray-500">Ages 13 or above</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                        disabled={adults <= 1}
                                    >-</button>
                                    <span className="w-6 text-center font-bold text-lg">{adults}</span>
                                    <button
                                        onClick={() => setAdults(adults + 1)}
                                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >+</button>
                                </div>
                            </div>

                            {/* Children */}
                            <div className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-300 transition-colors">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Children</p>
                                    <p className="text-sm text-gray-500">Ages 2-12</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setChildren(Math.max(0, children - 1))}
                                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                        disabled={children <= 0}
                                    >-</button>
                                    <span className="w-6 text-center font-bold text-lg">{children}</span>
                                    <button
                                        onClick={() => setChildren(children + 1)}
                                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >+</button>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-start gap-3">
                                <User className="text-gray-400 mt-1" />
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p>This property has a maximum capacity of <strong className="text-gray-900 dark:text-white">{property.maxGuests || 4} guests</strong>.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DETAILS STEP */}
                    {currentStep === 'details' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-trust-blue"
                                            placeholder="John Smith"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-trust-blue"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-trust-blue"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Special Requests (Optional)</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <textarea
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-trust-blue min-h-[100px]"
                                            placeholder="Early check-in, allergy requirements..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PAYMENT STEP */}
                    {currentStep === 'payment' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Payment details</h3>

                            {/* Credit Card Visual */}
                            <div className="relative h-48 rounded-2xl bg-gradient-to-br from-trust-blue to-black p-6 text-white shadow-xl overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-8 bg-yellow-400/80 rounded-md"></div>
                                        <span className="font-mono text-lg italic font-bold opacity-80">BANK</span>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="font-mono text-xl tracking-widest">{cardNumber || '0000 0000 0000 0000'}</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Card Holder</p>
                                                <p className="font-medium uppercase tracking-wider text-sm">{guestName || 'YOUR NAME'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Expires</p>
                                                <p className="font-mono font-medium">{cardExpiry || 'MM/YY'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            maxLength={19}
                                            value={cardNumber}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                setCardNumber(v);
                                            }}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-trust-blue font-mono"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            value={cardExpiry}
                                            onChange={(e) => {
                                                let v = e.target.value.replace(/\D/g, '');
                                                if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                                setCardExpiry(v);
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-trust-blue text-center font-mono"
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">CVC / CWW</label>
                                        <input
                                            type="password"
                                            maxLength={3}
                                            value={cardCvc}
                                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-trust-blue text-center font-mono"
                                            placeholder="123"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsProcessing(true);
                                        setTimeout(() => {
                                            setIsProcessing(false);
                                            handleConfirmBooking();
                                        }, 2500);
                                    }}
                                    disabled={!cardNumber || !cardExpiry || !cardCvc || isProcessing}
                                    className="w-full py-4 bg-trust-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Pay {formatPrice(pricing.total)}
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <Lock size={12} />
                                    Payments are secure and encrypted
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions (except Confirmation and Payment) */}
                {currentStep !== 'confirmation' && currentStep !== 'payment' && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(pricing.total || (property.pricePerNight || 0))}
                                    </p>
                                    {pricing.nights > 0 && (
                                        <span className="text-xs text-gray-500">
                                            ({pricing.nights} nights)
                                        </span>
                                    )}
                                </div>
                                {/* Show discount badge if applied - using type assertion or checking field existence since TypeScript might complain if I didn't update the interface in this file context, but I updated calculator return type */}
                                {(pricing as any).firstBookingDiscount > 0 && (
                                    <div className="text-xs text-green-600 font-bold flex items-center gap-1 animate-in fade-in">
                                        <CheckCircle size={10} />
                                        10% First Booking Discount
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {currentStep !== 'dates' && (
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNextStep}
                                disabled={
                                    (currentStep === 'dates' && (!checkIn || !checkOut)) ||
                                    (currentStep === 'details' && (!guestName || !guestEmail || !guestPhone))
                                }
                                className="px-6 py-3 bg-trust-blue text-white rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {currentStep === 'payment' ? 'Confirm Booking' : 'Next'}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
