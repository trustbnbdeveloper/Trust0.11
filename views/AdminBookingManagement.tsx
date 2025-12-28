import React, { useState } from 'react';
import { Calendar, Users, DollarSign, CheckCircle, XCircle, Clock, Search, Filter, Download, Eye, Check, X, Phone, Mail, MessageSquare } from 'lucide-react';
import { Booking, Guest, Property } from '../types';
import { MOCK_BOOKINGS, MOCK_GUESTS } from '../mockBookingData';
import { MOCK_PROPERTIES } from '../constants';

export const AdminBookingManagement: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const getGuest = (guestId: string): Guest | undefined => {
        return MOCK_GUESTS.find(g => g.id === guestId);
    };

    const getProperty = (propertyId: string): Property | undefined => {
        return MOCK_PROPERTIES.find(p => p.id === propertyId);
    };

    const filteredBookings = bookings.filter(booking => {
        const guest = getGuest(booking.guestId);
        const property = getProperty(booking.propertyId);

        const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
        const matchesSearch = !searchQuery ||
            guest?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        confirmed: bookings.filter(b => b.status === 'Confirmed').length,
        checkedIn: bookings.filter(b => b.status === 'Checked-in').length,
        revenue: bookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + b.totalPrice, 0)
    };

    const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
        setBookings(prev => prev.map(b =>
            b.id === bookingId ? { ...b, status: newStatus } : b
        ));
    };

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Checked-in': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Checked-out': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all property bookings and reservations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <CheckCircle size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Confirmed</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.confirmed}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Users size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Checked-in</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.checkedIn}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">€{stats.revenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by guest, property, or booking ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="Checked-out">Checked-out</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <button className="px-6 py-3 bg-trust-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center gap-2">
                        <Download size={20} />
                        Export
                    </button>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Property</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Guests</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredBookings.map(booking => {
                                const guest = getGuest(booking.guestId);
                                const property = getProperty(booking.propertyId);

                                return (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-trust-blue dark:text-blue-400">{booking.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={guest?.photo || 'https://i.pravatar.cc/150?img=1'}
                                                    alt={guest?.name}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{guest?.name}</p>
                                                    <p className="text-xs text-gray-500">{guest?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{property?.name}</p>
                                            <p className="text-xs text-gray-500">{property?.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">to {new Date(booking.checkOut).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900 dark:text-white">{booking.guests} guests</p>
                                            <p className="text-xs text-gray-500">{booking.adults}A, {booking.children}C</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">€{booking.totalPrice}</p>
                                            <p className={`text-xs ${booking.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {booking.paymentStatus}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} className="text-gray-600 dark:text-gray-400" />
                                                </button>
                                                {booking.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                                                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} className="text-green-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={18} className="text-red-600" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredBookings.length === 0 && (
                    <div className="py-16 text-center">
                        <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
                    </div>
                )}
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-trust-blue p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold">Booking Details</h3>
                                <p className="text-sm opacity-80 mt-1">{selectedBooking.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {(() => {
                                const guest = getGuest(selectedBooking.guestId);
                                const property = getProperty(selectedBooking.propertyId);

                                return (
                                    <div className="space-y-6">
                                        {/* Guest Info */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Guest Information</h4>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <img
                                                    src={guest?.photo || 'https://i.pravatar.cc/150?img=1'}
                                                    alt={guest?.name}
                                                    className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{guest?.name}</p>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Mail size={14} /> {guest?.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={14} /> {guest?.phone}
                                                        </span>
                                                    </div>
                                                    {guest?.verified && (
                                                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                                            ✓ Verified Guest
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property Info */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Property</h4>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <p className="font-bold text-gray-900 dark:text-white">{property?.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{property?.location}</p>
                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Booking Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-in</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{new Date(selectedBooking.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-out</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{new Date(selectedBooking.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Guests</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{selectedBooking.guests} ({selectedBooking.adults} adults, {selectedBooking.children} children)</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Status</p>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.status)}`}>
                                                        {selectedBooking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price Breakdown */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Price Breakdown</h4>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Nightly rate</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">€{selectedBooking.nightlyRate}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Cleaning fee</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">€{selectedBooking.cleaningFee}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">€{selectedBooking.serviceFee}</span>
                                                </div>
                                                <div className="pt-2 border-t border-gray-300 dark:border-gray-700 flex justify-between">
                                                    <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
                                                    <span className="font-bold text-lg text-trust-blue dark:text-blue-400">€{selectedBooking.totalPrice}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Special Requests */}
                                        {selectedBooking.specialRequests && (
                                            <div>
                                                <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Special Requests</h4>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-gray-700 dark:text-gray-300">{selectedBooking.specialRequests}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                            {selectedBooking.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedBooking.id, 'Confirmed');
                                            setSelectedBooking(null);
                                        }}
                                        className="px-6 py-3 bg-trust-green text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                    >
                                        Approve Booking
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedBooking.id, 'Cancelled');
                                            setSelectedBooking(null);
                                        }}
                                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
