import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Image as ImageIcon, Eye, Heart, MessageSquare } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  propertyName: string;
  stats: {
    views: number;
    saved: number;
    contacted: number;
  };
}

export function ImageGallery({ images, propertyName, stats }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative group">
        <div className="relative w-full h-[450px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={images[currentIndex]}
            alt={`${propertyName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          <div className="absolute top-4 left-4 flex gap-2">
            <div className="glass-dark px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-lg">
              <Eye className="w-4 h-4 text-white" />
              <span className="font-black text-sm text-white">{stats.views}</span>
            </div>
            <div className="glass-dark px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-lg">
              <Heart className="w-4 h-4 text-rose-400" />
              <span className="font-black text-sm text-white">{stats.saved}</span>
            </div>
            <div className="glass-dark px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-lg">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="font-black text-sm text-white">{stats.contacted}</span>
            </div>
          </div>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 glass-dark p-4 rounded-2xl text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 glass-dark p-4 rounded-2xl text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowFullscreen(true)}
            className="absolute top-6 right-6 glass-dark p-3 rounded-xl text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-6 glass-dark px-5 py-3 rounded-2xl text-white font-bold flex items-center gap-2 shadow-xl">
            <ImageIcon className="w-5 h-5" />
            {currentIndex + 1} / {images.length}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-12' : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          {images.slice(0, 4).map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-20 md:h-24 rounded-2xl overflow-hidden transition-all hover-lift ${
                currentIndex === index ? 'ring-4 ring-blue-600 ring-offset-2' : ''
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {currentIndex !== index && (
                <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-all"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fadeIn">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 glass-dark p-4 rounded-2xl text-white transition-all hover:scale-110 z-10"
            aria-label="Close fullscreen"
          >
            <X className="w-7 h-7" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 glass-dark p-4 rounded-2xl text-white transition-all hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={images[currentIndex]}
            alt={`${propertyName} - Image ${currentIndex + 1}`}
            className="max-w-[90%] max-h-[90%] object-contain rounded-2xl shadow-2xl"
          />

          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 glass-dark p-4 rounded-2xl text-white transition-all hover:scale-110 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-dark px-6 py-3 rounded-2xl text-white text-lg font-bold">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
