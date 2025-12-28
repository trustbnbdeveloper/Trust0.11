import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="relative h-48 md:h-64 w-full overflow-hidden bg-gray-100 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Image */}
      <img 
        src={images[currentIndex]} 
        alt={`${title} - View ${currentIndex + 1}`} 
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextImage}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Fullscreen Hint */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <div className="bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white">
           <Maximize2 size={14} />
         </div>
      </div>
    </div>
  );
};