// This file only returns string icon names, not React components
export async function getStaticData() {
  return {
    steps: [
      {
        number: "01",
        iconName: "Search",
        title: "Browse & Explore",
        description: "Explore our carefully curated collection of premium properties across multiple locations. Use our advanced filters to search by area, price range, and amenities to find your perfect match.",
        features: ["Advanced search filters", "High-quality property photos", "Detailed amenity lists", "Real-time availability"],
        color: "from-blue-700 to-cyan-200",
        bgColor: "bg-blue-50"
      },
      {
        number: "02",
        iconName: "Phone",
        title: "Connect With Us",
        description: "Reach out through your preferred channel - call, WhatsApp, or our contact form. Our dedicated team is ready to assist you 24/7 with instant responses to all your queries.",
        features: ["24/7 support availability", "Multiple contact channels", "Instant query resolution", "Expert guidance"],
        color: "from-red-300 to-pink-500",
        bgColor: "bg-purple-50"
      },
      {
        number: "03",
        iconName: "Calendar",
        title: "Schedule a Visit",
        description: "Book a property tour at your convenience with flexible timing options. Experience our world-class facilities, meet our friendly staff, and get a real feel of your potential new home.",
        features: ["Flexible visit timings", "Personal property tours", "Meet property staff", "Virtual tour option available"],
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50"
      },
      {
        number: "04",
        iconName: "UserPlus",
        title: "Register & Verify",
        description: "Complete a quick and secure registration process with your ID proof and basic documents. We maintain strict security protocols to ensure a safe living environment for all residents.",
        features: ["Quick registration process", "Secure document verification", "Police verification included", "Privacy protection assured"],
        color: "from-orange-500 to-red-500",
        bgColor: "bg-orange-50"
      },
      {
        number: "05",
        iconName: "CreditCard",
        title: "Make Payment",
        description: "Choose from flexible payment options including online transfer, offline payment, or advance payment with special discounts. All transactions are secure and hassle-free.",
        features: ["Multiple payment options", "Secure online gateway", "Advance payment discounts", "Transparent pricing"],
        color: "from-indigo-500 to-purple-500",
        bgColor: "bg-indigo-50"
      },
      {
        number: "06",
        iconName: "Key",
        title: "Move In!",
        description: "Receive your keys and welcome kit on your move-in date. Your fully-furnished room with all amenities is ready for you. Start your comfortable living experience immediately!",
        features: ["Fully furnished rooms", "Welcome amenities kit", "Property orientation", "Immediate support access"],
        color: "from-teal-500 to-cyan-500",
        bgColor: "bg-teal-50"
      }
    ],
    features: [
      {
        iconName: "Shield",
        title: "Secure & Safe",
        description: "24/7 security with CCTV surveillance, biometric access, and verified residents for complete peace of mind",
        color: "from-blue-500 to-cyan-500"
      },
      {
        iconName: "CheckCircle",
        title: "Transparent Pricing",
        description: "No hidden charges. All-inclusive pricing with clear breakdowns. What you see is what you pay",
        color: "from-green-500 to-emerald-500"
      },
      {
        iconName: "Headphones",
        title: "24/7 Support",
        description: "Dedicated support team available round-the-clock via call, WhatsApp, email, and in-person",
        color: "from-purple-500 to-pink-500"
      },
      {
        iconName: "Home",
        title: "Ready to Move",
        description: "Fully furnished rooms with all modern amenities. Pack your bags and move in from day one",
        color: "from-orange-500 to-red-500"
      },
      {
        iconName: "Award",
        title: "Premium Quality",
        description: "High-quality furniture, appliances, and fixtures. Regular maintenance and housekeeping included",
        color: "from-indigo-500 to-purple-500"
      },
      {
        iconName: "Users",
        title: "Community Living",
        description: "Connect with like-minded residents. Regular community events and networking opportunities",
        color: "from-teal-500 to-cyan-500"
      }
    ],
    quickStats: [
      { number: "500+", label: "Happy Residents", iconName: "Users" },
      { number: "50+", label: "Premium Properties", iconName: "Home" },
      { number: "10+", label: "Cities Covered", iconName: "Award" },
      { number: "24/7", label: "Support Available", iconName: "Clock" }
    ]
  };
}

// Icon mapping type
export type IconName = 
  | "Search" | "Phone" | "Calendar" | "Key" | "Home" 
  | "CheckCircle" | "UserPlus" | "CreditCard" | "Shield" 
  | "Clock" | "Award" | "Users" | "Headphones";