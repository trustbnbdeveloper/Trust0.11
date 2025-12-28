
import React from 'react';
import { X, Clock, MapPin, Star, Calendar, Utensils, Camera, Mountain, Coffee, Car } from 'lucide-react';
import { LocalGuideTrip } from '../types';

interface GuideDetailsModalProps {
  trip: LocalGuideTrip;
  onClose: () => void;
}

export const GuideDetailsModal: React.FC<GuideDetailsModalProps> = ({ trip, onClose }) => {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'Food': return <Utensils size={16} />;
      case 'View': return <Camera size={16} />;
      case 'Activity': return <Mountain size={16} />;
      case 'Transport': return <Car size={16} />;
      case 'Culture': return <Coffee size={16} />; // Using Coffee for culture/relaxed vibe or maybe another icon
      default: return <MapPin size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Image */}
        <div className="h-56 md:h-64 relative shrink-0">
           <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors"
           >
             <X size={20} />
           </button>
           <div className="absolute bottom-6 left-6 text-white max-w-lg">
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-trust-blue text-white text-[10px] uppercase font-bold px-2 py-1 rounded border border-white/20">
                   {trip.category}
                 </span>
                 <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold">
                    <Star size={10} fill="currentColor" className="text-yellow-400" /> {trip.rating}
                 </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-1">{trip.title}</h2>
              <p className="text-sm text-gray-200">{trip.description}</p>
           </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-trust-darkcard">
           <div className="p-6">
              {/* Meta Data */}
              <div className="flex gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Clock size={18} className="text-trust-blue dark:text-trust-green" />
                    <div>
                       <p className="text-[10px] text-gray-400 uppercase font-bold">Duration</p>
                       <p className="text-sm font-bold">{trip.duration}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MapPin size={18} className="text-trust-blue dark:text-trust-green" />
                    <div>
                       <p className="text-[10px] text-gray-400 uppercase font-bold">Distance</p>
                       <p className="text-sm font-bold">{trip.distance}</p>
                    </div>
                 </div>
              </div>

              {/* Timeline Itinerary */}
              <div className="pt-6">
                 <h3 className="font-bold text-trust-blue dark:text-white mb-6 flex items-center gap-2">
                   <Calendar size={18} /> Trip Itinerary
                 </h3>
                 
                 <div className="relative pl-4 space-y-8">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-2 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                    {trip.stops.map((stop, index) => (
                      <div key={index} className="relative flex gap-4">
                         {/* Time Bubble */}
                         <div className="w-14 text-right pt-2 shrink-0">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{stop.time}</span>
                         </div>
                         
                         {/* Icon Node */}
                         <div className="relative z-10 w-8 h-8 rounded-full bg-white dark:bg-trust-darkcard border-2 border-trust-blue dark:border-trust-green flex items-center justify-center text-trust-blue dark:text-white shrink-0">
                            {getIcon(stop.type)}
                         </div>

                         {/* Content Card */}
                         <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-trust-blue/30 dark:hover:border-trust-green/30 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                               <h4 className="font-bold text-trust-blue dark:text-white text-sm">{stop.title}</h4>
                               <span className="text-[10px] bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
                                 {stop.type}
                               </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{stop.description}</p>
                            <div className="flex items-center gap-1 text-[10px] text-trust-blue dark:text-blue-300 font-medium">
                               <MapPin size={10} /> {stop.location}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-trust-darkcard flex justify-between items-center shrink-0">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
           >
             Close
           </button>
           <button className="px-6 py-2.5 bg-trust-blue text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center gap-2">
             <MapPin size={16} /> Open in Maps
           </button>
        </div>

      </div>
    </div>
  );
};
