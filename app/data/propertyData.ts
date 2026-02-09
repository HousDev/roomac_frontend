import { Property } from '@/types/property';

export const propertyData: Property = {
  id: '1',
  name: 'HINJEWADI D-mart',
  location: 'Hinjewadi phase-1',
  address: 'Near Indira College, Wakad, Pune, Maharashtra 411057',
  description: 'Experience premium coliving in the heart of Hinjewadi Phase 1. Our property offers modern, fully-furnished accommodations with world-class amenities perfect for working professionals. Located near major IT parks and just minutes from D-Mart, enjoy the convenience of urban living with a peaceful residential atmosphere. Features spacious rooms, high-speed internet, 24/7 security, and a vibrant community of like-minded professionals.',
  highlights: [
    'Prime Hinjewadi Location',
    'Near IT Parks & D-Mart',
    '24/7 Power Backup',
    'High-Speed WiFi',
    'Daily Housekeeping',
    'CCTV Surveillance'
  ],
  images: [
    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ],
  securityDeposit: 3000,
  offers: [
    {
      id: '1',
      title: 'Zero Brokerage',
      description: 'Book directly without any brokerage fees',
      icon: 'tag',
      discount: '100%'
    },
    {
      id: '2',
      title: 'First Month Discount',
      description: 'Get 20% off on your first month rent',
      icon: 'percent',
      discount: '20%'
    },
    {
      id: '3',
      title: 'Instant Move-in',
      description: 'Move in within 24 hours of booking',
      icon: 'clock',
      discount: null
    },
    {
      id: '4',
      title: 'Refer & Earn',
      description: 'Earn ₹1500 for every successful referral',
      icon: 'gift',
      discount: '₹1500'
    }
  ],
  termsAndConditions: [
    'Minimum lock-in period of 3 months required',
    'Security deposit of ₹3000 refundable within 30 days of checkout',
    'Notice period of 1 month required before vacating',
    'Electricity charges as per actuals, billed monthly',
    'Guests allowed with prior permission from management',
    'Smoking and alcohol consumption strictly prohibited in rooms',
    'Pets not allowed in the premises',
    'Monthly rent includes 3 meals per day and all amenities',
    'Damage to property will be deducted from security deposit',
    'Management reserves the right to modify rules with 15 days prior notice'
  ],
  tags: ['New Listing', 'Premium'],
  rooms: [
    {
      id: 'room-101',
      name: 'Room 101',
      floor: 1,
      sharing: '2 Sharing',
      sharingType: 2,
      available: 1,
      ac: true,
      wifi: true,
      price: 7000,
      gender: 'male' as const,
      occupancy: { male: 1, female: 0 },
      status: 'available' as const
    },
    {
      id: 'room-102',
      name: 'Room 102',
      floor: 1,
      sharing: '2 Sharing',
      sharingType: 2,
      available: 1,
      ac: true,
      wifi: true,
      price: 7000,
      gender: 'female' as const,
      occupancy: { male: 0, female: 1 },
      status: 'available' as const
    },
    {
      id: 'room-103',
      name: 'Room 103',
      floor: 1,
      sharing: '2 Sharing',
      sharingType: 2,
      available: 1,
      ac: true,
      wifi: true,
      price: 7000,
      gender: 'male' as const,
      occupancy: { male: 1, female: 0 },
      vacateDate: '2026-01-25',
      status: 'available-soon' as const
    },
    {
      id: 'room-201',
      name: 'Room 201',
      floor: 2,
      sharing: '3 Sharing',
      sharingType: 3,
      available: 2,
      ac: true,
      wifi: true,
      price: 5500,
      gender: 'male' as const,
      occupancy: { male: 1, female: 0 },
      status: 'available' as const
    },
    {
      id: 'room-202',
      name: 'Room 202',
      floor: 2,
      sharing: '3 Sharing',
      sharingType: 3,
      available: 1,
      ac: true,
      wifi: true,
      price: 5500,
      gender: 'female' as const,
      occupancy: { male: 0, female: 2 },
      status: 'available' as const
    },
    {
      id: 'room-203',
      name: 'Room 203',
      floor: 2,
      sharing: '3 Sharing',
      sharingType: 3,
      available: 2,
      ac: true,
      wifi: true,
      price: 5500,
      gender: 'male' as const,
      occupancy: { male: 1, female: 0 },
      vacateDate: '2026-02-05',
      status: 'available-soon' as const
    },
    {
      id: 'room-301',
      name: 'Room 301',
      floor: 3,
      sharing: '4 Sharing',
      sharingType: 4,
      available: 3,
      ac: false,
      wifi: true,
      price: 4500,
      gender: 'male' as const,
      occupancy: { male: 1, female: 0 },
      status: 'available' as const
    },
    {
      id: 'room-302',
      name: 'Room 302',
      floor: 3,
      sharing: '4 Sharing',
      sharingType: 4,
      available: 2,
      ac: false,
      wifi: true,
      price: 4500,
      gender: 'female' as const,
      occupancy: { male: 0, female: 2 },
      status: 'available' as const
    },
    {
      id: 'room-303',
      name: 'Room 303',
      floor: 3,
      sharing: '4 Sharing',
      sharingType: 4,
      available: 1,
      ac: false,
      wifi: true,
      price: 4500,
      gender: 'female' as const,
      occupancy: { male: 0, female: 3 },
      vacateDate: '2026-01-20',
      status: 'available-soon' as const
    }
  ],
  amenities: [
    {
      icon: 'Wifi',
      title: 'High-Speed Wi-Fi',
      description: 'Unlimited broadband'
    },
    {
      icon: 'Car',
      title: 'Parking',
      description: 'Free 2 & car parking'
    },
    {
      icon: 'Shield',
      title: 'Security',
      description: 'CCTV & biometric'
    },
    {
      icon: 'Users',
      title: 'Common Area',
      description: 'Lounge & recreation'
    },
    {
      icon: 'Utensils',
      title: 'Meals Daily',
      description: 'Hygienic & nutritious'
    },
    {
      icon: 'Battery',
      title: 'DG Backup',
      description: 'Uninterrupted power'
    },
    {
      icon: 'Shirt',
      title: 'Laundry',
      description: 'Weekly service'
    },
    {
      icon: 'Sparkles',
      title: 'Housekeeping',
      description: 'Daily cleaning'
    },
    {
      icon: 'Bath',
      title: 'Attached Bathroom',
      description: 'Hot water 24/7'
    },
    {
      icon: 'ArrowUp',
      title: 'Lift',
      description: '24 hours'
    },
    {
      icon: 'Headphones',
      title: '24x7 Support',
      description: 'Always available'
    }
  ],
  pricingPlans: [
    {
      id: 'double-sharing',
      name: 'Double Sharing',
      price: 7000,
      duration: 'month',
      features: [
        'Room with all furniture',
        '3 meals daily included',
        'All amenities included',
        'Wi-fi & utilities'
      ]
    },
    {
      id: 'single-occupancy',
      name: 'Single Occupancy',
      price: 11200,
      duration: 'month',
      features: [
        'Private room all inclusive',
        '3 meals daily included',
        'All amenities included',
        'Maximum privacy'
      ],
      recommended: true
    }
  ],
  manager: {
    name: 'Aalish',
    phone: '6304984796',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  activity: {
    totalViews: 146,
    shortlistedBy: 23,
    contactRequests: {
      count: 12,
      thisWeek: 3
    }
  },
  coordinates: {
    lat: 18.5912,
    lng: 73.7389
  },
  nearbyPlaces: [
    {
      name: 'D-Mart Hinjewadi',
      distance: '500m',
      type: 'shopping' as const,
      icon: 'ShoppingCart'
    },
    {
      name: 'PCMC Bus Stop',
      distance: '300m',
      type: 'transport' as const,
      icon: 'Bus'
    },
    {
      name: 'Infosys Phase 1',
      distance: '1.2km',
      type: 'company' as const,
      icon: 'Building2'
    },
    {
      name: 'TCS Hinjewadi',
      distance: '1.5km',
      type: 'company' as const,
      icon: 'Building2'
    },
    {
      name: 'Wipro Campus',
      distance: '2km',
      type: 'company' as const,
      icon: 'Building2'
    },
    {
      name: 'Cognizant',
      distance: '2.3km',
      type: 'company' as const,
      icon: 'Building2'
    },
    {
      name: 'Life Care Hospital',
      distance: '800m',
      type: 'hospital' as const,
      icon: 'Hospital'
    },
    {
      name: 'Food Court',
      distance: '400m',
      type: 'restaurant' as const,
      icon: 'Utensils'
    },
    {
      name: 'Xion Mall',
      distance: '3km',
      type: 'entertainment' as const,
      icon: 'Film'
    }
  ],
  reviews: [
    {
      id: 'review-1',
      userName: 'Priya Sharma',
      userAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      date: '2026-01-05',
      comment: 'Excellent property with all modern amenities. The location is perfect for working professionals. WiFi speed is great and the food quality is amazing. Manager Aalish is very helpful and responsive.',
      roomType: '2 Sharing',
      stayDuration: '6 months',
      verified: true,
      helpful: 12
    },
    {
      id: 'review-2',
      userName: 'Rahul Verma',
      userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      date: '2025-12-28',
      comment: 'Great coliving space! The rooms are clean and spacious. Being close to IT parks makes commuting very easy. The housekeeping staff is very professional. Highly recommended for anyone working in Hinjewadi.',
      roomType: '3 Sharing',
      stayDuration: '4 months',
      verified: true,
      helpful: 8
    },
    {
      id: 'review-3',
      userName: 'Sneha Patel',
      userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 4,
      date: '2025-12-20',
      comment: 'Nice property overall. The amenities are good and the location is convenient. D-Mart is very close which makes grocery shopping easy. Only minor issue is parking can be tight during peak hours.',
      roomType: '2 Sharing',
      stayDuration: '3 months',
      verified: true,
      helpful: 5
    },
    {
      id: 'review-4',
      userName: 'Amit Kumar',
      userAvatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      date: '2025-12-15',
      comment: 'Best PG in Hinjewadi! The property is well-maintained and secure. The AC works perfectly and power backup is reliable. The common areas are clean and there is a good community feel here.',
      roomType: '4 Sharing',
      stayDuration: '8 months',
      verified: true,
      helpful: 15
    },
    {
      id: 'review-5',
      userName: 'Anjali Singh',
      userAvatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      date: '2025-12-10',
      comment: 'Wonderful experience staying here. The food is homely and hygienic. Aalish is always available to help with any issues. The laundry service is very convenient. Great value for money!',
      roomType: '3 Sharing',
      stayDuration: '5 months',
      verified: true,
      helpful: 9
    }
  ],
  averageRating: 4.8,
  totalReviews: 60
};
