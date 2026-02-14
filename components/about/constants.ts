import { AboutPageData } from './types';

export const aboutPageData: AboutPageData = {
  stats: [
    { number: "100+", label: "Happy Residents", icon: 'Users', color: "from-yellow-500 to-yellow-500" },
    { number: "50+", label: "Premium Properties", icon: 'Home', color: "from-green-500 to-emerald-500" },
    { number: "10+", label: "Cities Covered", icon: 'Globe', color: "from-purple-500 to-pink-500" },
    { number: "4.8", label: "Average Rating", icon: 'Award', color: "from-orange-500 to-red-500" }
  ],

  values: [
    {
      icon: 'Heart',
      title: 'Comfort First',
      description: 'We believe comfortable living spaces are essential for productivity and well-being. Every detail, from furniture to room layout, is thoughtfully designed with your comfort in mind.',
      color: "from-red-500 to-pink-500"
    },
    {
      icon: 'Shield',
      title: 'Transparent & Fair',
      description: 'No hidden charges, no surprises. Our pricing is crystal clear, and our policies are resident-friendly. What you see is exactly what you get.',
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: 'Users',
      title: 'Community Focused',
      description: 'We foster a vibrant sense of community where residents feel connected, supported, and at home. Regular events and networking opportunities bring everyone together.',
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: 'Zap',
      title: 'Quality Assurance',
      description: 'From furniture to food, from maintenance to security — we maintain the highest standards in everything we do. Your satisfaction is our priority.',
      color: "from-purple-500 to-pink-500"
    }
  ],

  milestones: [
    { year: "2019", title: "Founded", description: "ROOMAC started with a vision to redefine co-living" },
    { year: "2020", title: "Expansion", description: "Opened properties in 5 major cities" },
    { year: "2021", title: "Innovation", description: "Launched digital tenant portal and smart features" },
    { year: "2024", title: "Growth", description: "Serving 500+ happy residents across 50+ properties" }
  ],

  team: [
    {
      icon: 'Target',
      title: "Our Mission",
      description: "To provide premium, affordable co-living spaces that combine comfort, community, and convenience for young professionals and students."
    },
    {
      icon: 'TrendingUp',
      title: "Our Vision",
      description: "To become India's most trusted co-living brand, known for exceptional quality, transparent practices, and resident satisfaction."
    },
    {
      icon: 'Building2',
      title: "Our Approach",
      description: "We leverage technology, maintain high standards, and listen to our residents to continuously improve and innovate our services."
    }
  ]
};