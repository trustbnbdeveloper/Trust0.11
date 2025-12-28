import React from 'react';
import { MapPin, Star, Users, Bed, Bath, Heart } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
    property: Property;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    onClick: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isFavorite, onToggleFavorite, onClick }) => {
    // Safe defaults if extended data is missing (since we mix standard Property and extended types in views)
    const bedrooms = (property as any).bedrooms || 2;
    const bathrooms = (property as any).bathrooms || 1;
    const maxGuests = (property as any).maxGuests || 4;
    const rating = (property as any).rating || 4.8;
    const reviewCount = (property as any).reviewCount || 100;
    const superhost = (property as any).superhost || false;
    const instantBook = (property as any).instantBook || false;

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700 h-full flex flex-col"
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={property.imgUrl}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {superhost && (
                        <span className="bg-white/95 backdrop-blur-sm text-trust-blue px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                            SUPERHOST
                        </span>
                    )}
                    {instantBook && (
                        <span className="bg-green-600/95 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                            INSTANT BOOK
                        </span>
                    )}
                </div>

                {/* Favorite */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(property.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <Heart
                        size={18}
                        className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{property.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={14} />
                            {property.location}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-lg">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{rating}</span>
                    </div>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                        <Users size={14} /> {maxGuests}
                    </span>
                    <span className="flex items-center gap-1">
                        <Bed size={14} /> {bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                        <Bath size={14} /> {bathrooms}
                    </span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {property.amenities?.slice(0, 3).map(amenity => (
                        <span key={amenity} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[10px] font-medium">
                            {amenity}
                        </span>
                    ))}
                </div>

                {/* Spacer to push price to bottom */}
                <div className="flex-1"></div>

                {/* Price */}
                <div className="flex justify-between items-end pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        <span className="text-2xl font-black text-trust-blue dark:text-blue-400">€{property.pricePerNight}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400"> /night</span>
                    </div>
                    <span className="text-xs text-gray-400">{reviewCount} reviews</span>
                </div>
            </div>
        </div>
    );
};
