// components/home/WhoIsForSection.tsx
import ScrollAnimation from '@/components/home/ScrollAnimation';

export default function WhoIsForSection() {
  const categories = [
    {
      title: "Students",
      description: "Affordable PGs near colleges with food, WiFi & a safe environment.",
      image: "https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      title: "Working Professionals",
      description: "Premium stays near IT parks with power backup & housekeeping.",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      title: "Couples",
      description: "Private & comfortable couple-friendly rooms with full privacy.",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Corporate Stays",
      description: "Short & long-term stays for teams with complete support.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    },
  ];

  return (
    <ScrollAnimation>
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
              <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
                PERFECT FOR EVERYONE
              </span>
              <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-center">
              <span className="text-slate-800">Who Is </span>
              <span className="text-blue-600 ml-2">Roomac For?</span>
            </h2>

            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              Flexible, fully-furnished PG & co-living spaces designed for every lifestyle
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="relative h-[220px] rounded-2xl overflow-hidden group">
                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
                  <p className="text-sm text-white/90">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
}