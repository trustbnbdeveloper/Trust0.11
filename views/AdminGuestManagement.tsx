import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, Calendar, User as UserIcon, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';
import { Guest, Booking, PropertyReview, GuestReview, Property } from '../types';
import { MOCK_GUESTS, MOCK_BOOKINGS } from '../mockBookingData';
import { MOCK_PROPERTY_REVIEWS, MOCK_GUEST_REVIEWS } from '../mockReviewData';
import { MOCK_PROPERTIES } from '../constants';

export const AdminGuestManagement: React.FC = () => {
    const [guests, setGuests] = useState<Guest[]>(MOCK_GUESTS);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVerified, setFilterVerified] = useState<string>('all');

    const getGuestBookings = (guestId: string): Booking[] => {
        return MOCK_BOOKINGS.filter(b => b.guestId === guestId);
    };

    const getGuestPropertyReviews = (guestId: string): PropertyReview[] => {
        return MOCK_PROPERTY_REVIEWS.filter(r => r.guestId === guestId);
    };

    const getGuestHostReviews = (guestId: string): GuestReview[] => {
        return MOCK_GUEST_REVIEWS.filter(r => r.guestId === guestId);
    };

    const getProperty = (propertyId: string): Property | undefined => {
        return MOCK_PROPERTIES.find(p => p.id === propertyId);
    };

    const filteredGuests = guests.filter(guest => {
        const matchesSearch = !searchQuery ||
            guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guest.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesVerified = filterVerified === 'all' ||
            (filterVerified === 'verified' && guest.verified) ||
            (filterVerified === 'unverified' && !guest.verified);

        return matchesSearch && matchesVerified;
    });

    const stats = {
        total: guests.length,
        verified: guests.filter(g => g.verified).length,
        totalBookings: MOCK_BOOKINGS.length,
        averageRating: (guests.reduce((sum, g) => sum + g.rating, 0) / guests.length).toFixed(1)
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Guest Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage guest profiles, verifications, and reviews</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <UserIcon size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Guests</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Shield size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Verified</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.verified}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Star size={20} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                        />
                    </div>

                    <select
                        value={filterVerified}
                        onChange={(e) => setFilterVerified(e.target.value)}
                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    >
                        <option value="all">All Guests</option>
                        <option value="verified">Verified Only</option>
                        <option value="unverified">Unverified Only</option>
                    </select>
                </div>
            </div>

            {/* Guest Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuests.map(guest => {
                    const bookings = getGuestBookings(guest.id);
                    const reviews = getGuestHostReviews(guest.id);
                    const avgHostRating = reviews.length > 0
                        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        : 'N/A';

                    return (
                        <div
                            key={guest.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => setSelectedGuest(guest)}
                        >
                            {/* Guest Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={guest.photo || 'https://i.pravatar.cc/150?img=1'}
                                        alt={guest.name}
                                        className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{guest.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={14} /> {guest.location}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {guest.verified && (
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded flex items-center gap-1">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                <Star size={12} fill="currentColor" className="text-yellow-500" />
                                                <span className="text-xs font-bold">{guest.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guest Stats */}
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Bookings</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{guest.bookingCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Reviews Given</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{guest.reviewCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Host Rating</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{avgHostRating}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {new Date(guest.memberSince).getFullYear()}
                                    </span>
                                </div>
                            </div>

                            {/* Verification Status */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className={`flex items-center gap-1 ${guest.emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
                                        {guest.emailVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        <span>Email</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${guest.phoneVerified ? 'text-green-600' : 'text-gray-400'}`}>
                                        {guest.phoneVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        <span>Phone</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${guest.idVerified ? 'text-green-600' : 'text-gray-400'}`}>
                                        {guest.idVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        <span>ID</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Guest Detail Modal */}
            {selectedGuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-trust-blue p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <img
                                    src={selectedGuest.photo || 'https://i.pravatar.cc/150?img=1'}
                                    alt={selectedGuest.name}
                                    className="w-16 h-16 rounded-full border-2 border-white"
                                />
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedGuest.name}</h3>
                                    <p className="text-sm opacity-80 mt-1">Member since {new Date(selectedGuest.memberSince).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedGuest(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                            {(() => {
                                const bookings = getGuestBookings(selectedGuest.id);
                                const propertyReviews = getGuestPropertyReviews(selectedGuest.id);
                                const hostReviews = getGuestHostReviews(selectedGuest.id);

                                return (
                                    <div className="space-y-6">
                                        {/* Contact Info */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Contact Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center gap-3">
                                                    <Mail size={20} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Email</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">{selectedGuest.email}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center gap-3">
                                                    <Phone size={20} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">{selectedGuest.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Verification Status */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Verification Status</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className={`p-4 rounded-lg border-2 ${selectedGuest.emailVerified ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {selectedGuest.emailVerified ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-gray-400" />}
                                                        <span className="font-bold text-sm">Email</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{selectedGuest.emailVerified ? 'Verified' : 'Not Verified'}</p>
                                                </div>
                                                <div className={`p-4 rounded-lg border-2 ${selectedGuest.phoneVerified ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {selectedGuest.phoneVerified ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-gray-400" />}
                                                        <span className="font-bold text-sm">Phone</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{selectedGuest.phoneVerified ? 'Verified' : 'Not Verified'}</p>
                                                </div>
                                                <div className={`p-4 rounded-lg border-2 ${selectedGuest.idVerified ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {selectedGuest.idVerified ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-gray-400" />}
                                                        <span className="font-bold text-sm">ID</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{selectedGuest.idVerified ? 'Verified' : 'Not Verified'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking History */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Booking History ({bookings.length})</h4>
                                            <div className="space-y-3">
                                                {bookings.map(booking => {
                                                    const property = getProperty(booking.propertyId);
                                                    return (
                                                        <div key={booking.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center">
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-white">{property?.name}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-gray-900 dark:text-white">€{booking.totalPrice}</p>
                                                                <span className={`text-xs px-2 py-1 rounded ${booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                                                    booking.status === 'Checked-out' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Reviews from Hosts */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Reviews from Hosts ({hostReviews.length})</h4>
                                            <div className="space-y-4">
                                                {hostReviews.map(review => {
                                                    const property = getProperty(review.propertyId);
                                                    return (
                                                        <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Star size={16} fill="currentColor" className="text-yellow-500" />
                                                                    <span className="font-bold">{review.rating.toFixed(1)}</span>
                                                                    <span className="text-sm text-gray-500">• {property?.name}</span>
                                                                </div>
                                                                <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                                                            <div className="mt-3 flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                                                                <span>Communication: {review.communication}/5</span>
                                                                <span>Cleanliness: {review.cleanliness}/5</span>
                                                                <span>House Rules: {review.houseRules}/5</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
