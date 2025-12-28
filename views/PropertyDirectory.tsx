import React, { useState } from 'react';
import { Search, MapPin, Users, Bed, Bath, Wifi, Car, Waves, Star, Heart, ChevronLeft, ChevronRight, SlidersHorizontal, X, Map, Grid3x3 } from 'lucide-react';
import { Property } from '../types';
import { MOCK_PROPERTIES } from '../constants';
import { PropertyMap } from '../components/PropertyMap';
import { BookingWidget } from '../components/BookingWidget';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { GuestAuthModal } from '../components/GuestAuthModal';
import { PartyPopper } from 'lucide-react';

export const PropertyDirectory: React.FC = () => {
    const { t } = useAppContext();
    const { user, isAuthenticated, toggleWishlist } = useAuth();
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [searchLocation, setSearchLocation] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [propertyType, setPropertyType] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [bookingProperty, setBookingProperty] = useState<typeof enhancedProperties[0] | null>(null);

    // Enhance properties with directory data
    const enhancedProperties: (Property & {
        bedrooms: number;
        bathrooms: number;
        maxGuests: number;
        rating: number;
        reviewCount: number;
        instantBook: boolean;
        superhost: boolean;
        propertyType: string;
        description: string;
    })[] = MOCK_PROPERTIES.map((prop, idx) => ({
        ...prop,
        bedrooms: [3, 2, 4, 1, 3, 2, 5, 2][idx % 8] || 2,
        bathrooms: [2, 1, 3, 1, 2, 1, 4, 2][idx % 8] || 1,
        maxGuests: [6, 4, 8, 2, 6, 4, 10, 4][idx % 8] || 4,
        rating: [4.9, 4.7, 4.8, 4.6, 4.9, 4.5, 4.8, 4.7][idx % 8] || 4.7,
        reviewCount: [127, 89, 156, 45, 203, 67, 178, 92][idx % 8] || 100,
        instantBook: [true, false, true, true, false, true, true, false][idx % 8] || false,
        superhost: [true, false, true, false, true, false, true, true][idx % 8] || false,
        propertyType: prop.category === 'Coastal' ? 'Villa' : prop.category === 'Urban' ? 'Apartment' : 'House',
        description: `Beautiful ${prop.category.toLowerCase()} property in ${prop.location}. Perfect for families and groups looking for an authentic Albanian experience.`
    }));

    const filteredProperties = enhancedProperties.filter(prop => {
        if (searchLocation && !prop.location.toLowerCase().includes(searchLocation.toLowerCase())) return false;
        if (prop.pricePerNight && (prop.pricePerNight < priceRange[0] || prop.pricePerNight > priceRange[1])) return false;
        if (propertyType && prop.propertyType !== propertyType) return false;
        if (selectedAmenities.length > 0 && !selectedAmenities.every(a => prop.amenities?.includes(a))) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-trust-darkbg">
            {/* Header Section */}
            {/* Header Section */}
            <div className="py-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-trust-blue/10 dark:bg-white/10 text-trust-blue dark:text-white rounded-full text-sm font-medium mb-6">
                    <Waves size={16} />
                    <span>{t('prop_premium')}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-trust-blue dark:text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {t('prop_hero_title')}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 leading-relaxed">
                    {t('prop_hero_subtitle')}
                </p>

                {/* Guest Discount CTA - Fixed Bottom Right */}
                {!isAuthenticated && (
                    <div
                        onClick={() => setShowGuestModal(true)}
                        className="fixed bottom-6 right-6 z-50 group cursor-pointer animate-in slide-in-from-right duration-700"
                    >
                        <div className="relative inline-flex items-center gap-3 bg-trust-green text-white pl-6 pr-8 py-4 rounded-full shadow-2xl hover:shadow-xl hover:scale-105 transition-all border border-white/20">
                            <div className="text-left">
                                <p className="text-xs font-medium text-white/90 uppercase tracking-wider">Limited Offer</p>
                                <p className="font-bold text-lg">Register & Save 10%</p>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        </div>
                    </div>
                )}
                {/* Search Bar */}
                <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{t('search_location')}</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('search_where')}
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                                />
                            </div>
                        </div>

                        <div>
                            <CustomDatePicker
                                label={t('search_checkin')}
                                value={checkIn}
                                onChange={setCheckIn}
                                placeholder={t('search_checkin')}
                            />
                        </div>

                        <div>
                            <CustomDatePicker
                                label={t('search_checkout')}
                                value={checkOut}
                                onChange={setCheckOut}
                                placeholder={t('search_checkout')}
                                minDate={checkIn}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{t('search_guests')}</label>
                            <div className="relative">
                                <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 appearance-none"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                        <option key={n} value={n}>{n} {n === 1 ? (t('search_guests').endsWith('s') ? t('search_guests').slice(0, -1) : 'Guest') : t('search_guests')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <SlidersHorizontal size={18} />
                            <span className="text-sm font-medium">{t('prop_filters')}</span>
                        </button>
                        <button className="flex-1 bg-trust-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <Search size={20} />
                            {t('prop_search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {
                showFilters && (
                    <div className="max-w-7xl mx-auto px-4 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('filter_title')}</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('filter_price')}</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                                        placeholder={t('filter_min')}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                                        placeholder={t('filter_max')}
                                    />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('filter_type')}</label>
                                <select
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                                >
                                    <option value="">{t('filter_all_types')}</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="House">House</option>
                                    <option value="Studio">Studio</option>
                                </select>
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('filter_amenities')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {['WiFi', 'Pool', 'Sea View', 'Parking', 'Smart Lock'].map(amenity => (
                                        <button
                                            key={amenity}
                                            onClick={() => {
                                                if (selectedAmenities.includes(amenity)) {
                                                    setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                                } else {
                                                    setSelectedAmenities([...selectedAmenities, amenity]);
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedAmenities.includes(amenity)
                                                ? 'bg-trust-blue text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Property Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {filteredProperties.length} {t('prop_available')}
                    </h2>
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'grid'
                                    ? 'bg-white dark:bg-gray-700 text-trust-blue dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Grid3x3 size={16} />
                                {t('prop_grid')}
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'map'
                                    ? 'bg-white dark:bg-gray-700 text-trust-blue dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Map size={16} />
                                {t('prop_map')}
                            </button>
                        </div>
                        <select className="px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm">
                            <option>{t('prop_sort_recommended')}</option>
                            <option>{t('prop_sort_low')}</option>
                            <option>{t('prop_sort_high')}</option>
                            <option>{t('prop_sort_rated')}</option>
                        </select>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProperties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isFavorite={user?.wishlist?.includes(property.id) || false}
                                onToggleFavorite={(id) => {
                                    if (isAuthenticated) {
                                        toggleWishlist(id);
                                    } else {
                                        alert("Please log in to save favorites.");
                                    }
                                }}
                                onClick={() => setSelectedProperty(property)}
                            />
                        ))}
                    </div>
                )}

                {/* Map View */}
                {viewMode === 'map' && (
                    <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                        <PropertyMap properties={filteredProperties} />
                    </div>
                )}
            </div>

            {/* Property Detail Modal */}
            {
                selectedProperty && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProperty.name}</h2>
                                <button
                                    onClick={() => setSelectedProperty(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                                {/* Image Gallery */}
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    {selectedProperty.images?.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`${selectedProperty.name} ${idx + 1}`}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-8">
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Star size={20} fill="currentColor" className="text-yellow-500" />
                                            <span className="text-xl font-bold">{selectedProperty.rating}</span>
                                            <span className="text-gray-500">({selectedProperty.reviewCount} reviews)</span>
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 mb-6">{selectedProperty.description}</p>

                                        <h3 className="font-bold text-lg mb-3">Amenities</h3>
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {selectedProperty.amenities?.map(amenity => (
                                                <div key={amenity} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <div className="w-6 h-6 bg-trust-blue/10 rounded flex items-center justify-center">
                                                        <Wifi size={14} className="text-trust-blue" />
                                                    </div>
                                                    {amenity}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Booking Widget */}
                                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-fit sticky top-0">
                                        <div className="text-center mb-4">
                                            <span className="text-3xl font-black text-trust-blue dark:text-white">€{selectedProperty.pricePerNight}</span>
                                            <span className="text-gray-500"> /night</span>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg"
                                                placeholder="Check-in"
                                            />
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg"
                                                placeholder="Check-out"
                                            />
                                            <select className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg">
                                                <option>2 Guests</option>
                                                <option>4 Guests</option>
                                                <option>6 Guests</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProperty(null);
                                                setBookingProperty(selectedProperty);
                                            }}
                                            className="w-full bg-trust-blue text-white py-4 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95 shadow-lg"
                                        >
                                            Reserve Now
                                        </button>

                                        <p className="text-xs text-center text-gray-500 mt-3">You won't be charged yet</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Booking Widget */}
            {
                bookingProperty && (
                    <BookingWidget
                        property={bookingProperty}
                        onClose={() => setBookingProperty(null)}
                        onBookingComplete={(booking) => {
                            console.log('Booking created:', booking);
                            // In a real app, this would save to backend
                        }}
                    />
                )
            }
            <GuestAuthModal
                isOpen={showGuestModal}
                onClose={() => setShowGuestModal(false)}
            />
        </div >
    );
};
