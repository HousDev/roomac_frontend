"use client";

interface ImageGalleryProps {
  images: string[];
  exitAnimation: boolean;
  slideDirection: string;
}

const imageUrls = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop&crop=center"
];

export default function ImageGallery({ images, exitAnimation, slideDirection }: ImageGalleryProps) {
  return (
    <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-all duration-500 ${
      exitAnimation ? 
        slideDirection === "slide-out-right-bottom" ? 
          "-translate-x-[100%] -translate-y-[100%] rotate-[-45deg] opacity-0 scale-75" 
          : "" 
        : ""
    }`}>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500 animate-gradient"></div>
      
      {/* Decorative Animated Circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-3xl animate-float"></div>
      <div className="absolute bottom-40 right-10 w-24 h-24 bg-yellow-300 rounded-full opacity-30 blur-2xl animate-float-delayed"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-pink-400 rounded-full opacity-25 blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-20 blur-2xl animate-float"></div>
      
      {/* Curved Overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/5 rounded-full blur-3xl transform -translate-x-40 translate-y-40"></div>
      
      <div className="relative w-full h-full flex flex-col justify-between p-12">
        {/* Fixed Image Grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-6 flex-shrink-0 mb-6 h-80">
          {imageUrls.map((url, index) => (
            <ImageCard 
              key={index}
              url={url}
              index={index}
              fallbackUrl={images[index]}
              fallbackText={getImageText(index)}
            />
          ))}
        </div>

        {/* Welcome Text Section */}
        <div className="text-center text-white space-y-4 mt-8 mb-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <div className="relative inline-block">
            <h1 className="text-5xl font-bold leading-tight relative z-10">
              Welcome To <br />Roomac
            </h1>
            <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full transform scale-150"></div>
          </div>
          <p className="text-sm text-blue-100 leading-relaxed font-medium">
            Manage your stay, connect housemates,<br />and discover community events.
          </p>
          
          {/* Animated Pagination Dots */}
          <div className="flex justify-center gap-2 pt-3">
            <div className="w-10 h-1.5 rounded-full bg-white shadow-lg animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 my-auto"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 my-auto"></div>
          </div>
        </div>
      </div>
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}

function ImageCard({ url, index, fallbackUrl, fallbackText }: {
  url: string;
  index: number;
  fallbackUrl: string;
  fallbackText: string;
}) {
  const rotations = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1"];
  const delays = ["delay-100", "delay-200", "delay-300", "delay-400"];
  const colors = [
    "from-purple-600/30 via-transparent to-blue-600/30",
    "from-blue-600/30 via-transparent to-purple-600/30",
    "from-pink-600/30 via-transparent to-purple-600/30",
    "from-purple-600/30 via-transparent to-blue-600/30"
  ];
  const textColors = ["text-purple-600", "text-blue-600", "text-pink-600", "text-purple-600"];

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 animate-in fade-in zoom-in ${delays[index]} ${rotations[index]}`}>
      <img 
        src={url}
        alt={fallbackText}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = fallbackUrl;
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]}`}></div>
      <div className={`absolute bottom-3 ${index % 2 === 0 ? 'left-3' : 'right-3'} w-8 h-8 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg`}>
        <span className={`${textColors[index]} text-xs font-bold`}>{index + 1}</span>
      </div>
    </div>
  );
}

function getImageText(index: number): string {
  const texts = [
    "Modern Apartment",
    "Luxury Bedroom",
    "Spacious Living",
    "Cozy Interior"
  ];
  return texts[index];
}