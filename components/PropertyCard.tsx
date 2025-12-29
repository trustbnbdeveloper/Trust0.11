import React from 'react';
import { MapPin, Star, Users, Bed, Bath, Heart } from 'lucide-react';
import { Property } from '../types';
import { GlassCard } from './core/GlassCard';
import { TrustButton } from './core/TrustButton';

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
        <GlassCard
            variant="elevated"
            padding="none"
            className="hover:shadow-2xl transition-all duration-500 cursor-pointer group h-full flex flex-col"
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={property.imgUrl}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {superhost && (
                        <span className="bg-white/95 backdrop-blur-sm text-trust-blue px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-trust-blue/10">
                            SUPERHOST
                        </span>
                    )}
                    {instantBook && (
                        <span className="bg-trust-green text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
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
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 z-10"
                >
                    <Heart
                        size={18}
                        className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className="font-serif font-bold text-trust-blue dark:text-white text-lg line-clamp-1 group-hover:text-trust-green transition-colors">{property.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin size={14} className="text-trust-blue" />
                            {property.location}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-trust-blue/5 dark:bg-white/10 text-trust-blue dark:text-white px-2 py-1 rounded-lg border border-trust-blue/10">
                        <Star size={12} fill="currentColor" className="text-yellow-500" />
                        <span className="text-xs font-bold">{rating}</span>
                    </div>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-md">
                        <Users size={14} /> {maxGuests} Guests
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-md">
                        <Bed size={14} /> {bedrooms} BR
                    </span>
                </div>

                {/* Price */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <span className="text-2xl font-black text-trust-blue dark:text-white">€{property.pricePerNight}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400"> /night</span>
                    </div>
                    <TrustButton
                        size="sm"
                        variant="primary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        View Details
                    </TrustButton>
                </div>
            </div>
        </GlassCard>
    );
};
