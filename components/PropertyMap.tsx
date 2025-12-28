import React, { useState, useMemo } from 'react';
import { MapPin, X, Star, Wifi, Wind, Coffee, ArrowRight, Search, Filter, Home, Waves, Mountain } from 'lucide-react';
import { Property } from '../types';
import { PropertyGallery } from './PropertyGallery';
import { BookingWizard } from './BookingWizard';

interface PropertyMapProps {
  properties: Property[];
}

type CategoryFilter = 'All' | 'Coastal' | 'Urban' | 'Mountain';

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  // Filter properties based on search and category
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || prop.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [properties, searchTerm, activeCategory]);

  // Helper to render amenity icon
  const getAmenityIcon = (amenity: string) => {
    if (amenity.includes('WiFi')) return <Wifi size={12} />;
    if (amenity.includes('AC') || amenity.includes('Wind')) return <Wind size={12} />;
    if (amenity.includes('Pool') || amenity.includes('Jacuzzi')) return <Coffee size={12} />;
    return <Star size={12} />;
  };

  const handleBookNow = () => {
    setIsBookingOpen(true);
  };

  const categories: { name: CategoryFilter; icon: React.ElementType }[] = [
    { name: 'All', icon: Home },
    { name: 'Coastal', icon: Waves },
    { name: 'Urban', icon: Home }, // Urban icon could be different but Home works
    { name: 'Mountain', icon: Mountain },
  ];

  return (
    <div className="relative w-full h-[700px] bg-[#F8FAFC] dark:bg-[#08121C] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col group transition-all duration-500">

      {/* Top Filter Bar */}
      <div className="absolute top-6 left-6 right-6 z-30 flex flex-col md:flex-row gap-4 pointer-events-none">
        <div className="flex bg-white/90 dark:bg-trust-darkcard/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 pointer-events-auto">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.name
                  ? 'bg-trust-blue text-white shadow-lg'
                  : 'text-gray-500 hover:text-trust-blue dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              <cat.icon size={16} />
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md pointer-events-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search city or property name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/90 dark:bg-trust-darkcard/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-trust-blue text-sm dark:text-white transition-all"
          />
        </div>
      </div>

      <div className="flex flex-1 relative flex-col md:flex-row overflow-hidden">
        {/* Map Area */}
        <div
          className={`flex-1 relative bg-[#E2E8F0] dark:bg-[#0B1622] overflow-hidden transition-all duration-700 ${selectedProperty ? 'md:flex-[0.6]' : 'md:flex-1'
            }`}
          onClick={() => setSelectedProperty(null)}
        >
          {/* Stylized Albania Map SVG Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <svg viewBox="0 0 200 400" className="h-[90%] w-auto fill-trust-blue dark:fill-trust-blue transition-transform duration-700" style={{
              transform: selectedProperty ? 'scale(1.1) translateX(-10%)' : 'scale(1)'
            }}>
              <path d="M60,10 L100,5 L140,20 L130,80 L160,150 L140,220 L160,280 L130,350 L80,390 L40,320 L20,250 L40,150 L20,80 L60,10 Z" />
            </svg>
          </div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          {/* Pins */}
          {filteredProperties.map((prop) => {
            if (!prop.coordinates) return null;
            const isSelected = selectedProperty?.id === prop.id;

            return (
              <div
                key={prop.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all duration-500 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                  }`}
                style={{ top: `${prop.coordinates.y}%`, left: `${prop.coordinates.x}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProperty(prop);
                }}
              >
                {/* Pulse effect */}
                <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isSelected ? 'bg-trust-green' : 'bg-trust-blue'} w-full h-full`}></div>

                {/* Pin Head */}
                <div className={`relative flex items-center gap-2 shadow-2xl rounded-full pl-2 pr-4 py-2 border-2 transition-all ${isSelected
                    ? 'bg-trust-green text-white border-white'
                    : 'bg-white dark:bg-trust-darkcard text-trust-blue dark:text-white border-gray-100 dark:border-gray-700'
                  }`}>
                  <div className={`p-1.5 rounded-full ${isSelected ? 'bg-white text-trust-green' : 'bg-trust-blue text-white'}`}>
                    <MapPin size={14} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold">€{prop.pricePerNight}</span>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-6 left-6 bg-white/80 dark:bg-black/40 backdrop-blur px-4 py-2 rounded-lg text-xs font-mono text-gray-500">
            {filteredProperties.length} Properties Found • Albanian Region
          </div>
        </div>

        {/* Property Details Panel */}
        <div className={`
          absolute md:relative bottom-0 left-0 right-0 md:w-[400px] bg-white dark:bg-trust-darkcard border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700
          transition-all duration-500 ease-in-out z-40 shadow-2xl flex flex-col
          ${selectedProperty ? 'h-[75%] md:h-full opacity-100' : 'h-0 md:w-0 overflow-hidden opacity-0 pointer-events-none'}
        `}>
          {selectedProperty && (
            <div className="h-full flex flex-col">
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/90 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 rounded-full text-gray-800 dark:text-white shadow-md transition-all active:scale-95"
              >
                <X size={20} />
              </button>

              {/* Gallery */}
              <div className="h-64 relative overflow-hidden">
                <PropertyGallery
                  images={selectedProperty.images || [selectedProperty.imgUrl]}
                  title={selectedProperty.name}
                />
              </div>

              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${selectedProperty.category === 'Coastal' ? 'bg-blue-100 text-blue-600' :
                      selectedProperty.category === 'Urban' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                    }`}>
                    {selectedProperty.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold bg-trust-green/10 text-trust-green px-2 py-1 rounded">
                    <Star size={10} fill="currentColor" /> {selectedProperty.qualityScore / 20}
                  </div>
                </div>
                <h3 className="font-serif font-bold text-2xl text-trust-blue dark:text-white leading-tight mb-2">
                  {selectedProperty.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-trust-green" /> {selectedProperty.location}
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 flex-1 overflow-y-auto space-y-8 mobile-scrollbar-hide">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities?.map((am, i) => (
                      <span key={i} className="text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-100 dark:border-gray-700 shadow-sm">
                        {getAmenityIcon(am)} {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-trust-blue text-white rounded-2xl shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                    <div className="relative z-10 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-blue-200 font-medium mb-1 uppercase tracking-wider">Premium Rate</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">€{selectedProperty.pricePerNight}</span>
                          <span className="text-sm text-blue-200">/ night</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs bg-trust-green px-2 py-1 rounded-lg font-bold">Best Value</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About the Stay</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "Experience the perfect blend of local Albanian charm and international luxury standards. This property is fully managed by our on-site team available 24/7."
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-trust-darkcard/80 backdrop-blur-md">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-trust-blue hover:bg-[#081522] text-white py-4 rounded-2xl font-bold shadow-2xl transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
                >
                  Direct Booking <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend (Desktop only) */}
      {!selectedProperty && (
        <div className="absolute bottom-20 right-8 hidden md:block bg-white/90 dark:bg-trust-darkcard/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-[200px] animate-in fade-in slide-in-from-bottom-4">
          <h4 className="text-xs font-bold text-trust-blue dark:text-white uppercase tracking-widest mb-4">Legend</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-trust-blue"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Standard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-trust-green"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Selected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Region Grid</span>
            </div>
          </div>
        </div>
      )}

      {/* Booking Wizard Modal */}
      {selectedProperty && (
        <BookingWizard
          property={selectedProperty}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
};