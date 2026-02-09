import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Key, Home, CheckCircle, UserPlus, CreditCard, Shield, Phone, MessageSquare } from 'lucide-react';
import Link from '@/src/compat/next-link';

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Browse & Explore",
      description: "Explore our premium properties across multiple locations. Filter by area, price, and amenities to find your perfect match.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "02",
      icon: Phone,
      title: "Connect With Us",
      description: "Reach out via call, WhatsApp, or our contact form. Our team provides instant support and answers all your queries.",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      icon: Calendar,
      title: "Schedule a Visit",
      description: "Book a property tour at your convenience. Experience our facilities, meet our staff, and get a real feel of the space.",
      color: "from-green-500 to-emerald-500"
    },
    {
      number: "04",
      icon: UserPlus,
      title: "Register & Verify",
      description: "Complete a quick registration with your ID proof. We maintain security and ensure a safe living environment for all.",
      color: "from-orange-500 to-red-500"
    },
    {
      number: "05",
      icon: CreditCard,
      title: "Make Payment",
      description: "Choose flexible payment options - online, offline, or advance payment with special discounts. Secure and hassle-free.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      number: "06",
      icon: Key,
      title: "Move In!",
      description: "Receive your keys and welcome kit. Move into your fully-furnished room and start your comfortable living experience.",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "24/7 security, CCTV surveillance, and verified residents"
    },
    {
      icon: CheckCircle,
      title: "Transparent Pricing",
      description: "No hidden charges. All-inclusive pricing with clear breakdowns"
    },
    {
      icon: MessageSquare,
      title: "Instant Support",
      description: "Dedicated support team available via call, WhatsApp, and email"
    },
    {
      icon: Home,
      title: "Ready to Move",
      description: "Fully furnished rooms with all amenities from day one"
    }
  ];

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blue-900 text-white py-24 ">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 ">
              How It Works
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Your journey to comfortable living, simplified in 6 easy steps
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/properties">
                <Button size="lg" className="bg-white text-[#004AAD] hover:bg-white/90 shadow-xl">
                  Browse Properties
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Simple Process, Perfect Results
              </h2>
              <p className="text-xl text-slate-600">
                From browsing to moving in — we've made it incredibly easy
              </p>
            </div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <Card key={index} className="border-0 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className={`flex flex-col md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                      {/* Icon Side */}
                      <div className={`md:w-1/3 bg-gradient-to-br ${step.color} p-12 flex flex-col items-center justify-center text-white relative`}>
                        <div className="absolute top-4 left-4 text-8xl font-bold opacity-20">
                          {step.number}
                        </div>
                        <div className="relative z-10">
                          <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                            <step.icon className="h-12 w-12" />
                          </div>
                          <div className="text-6xl font-bold mb-2">{step.number}</div>
                          <div className="h-1 w-16 bg-white/50 mx-auto" />
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="md:w-2/3 p-12">
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">{step.title}</h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Why Choose ROOMAC?
              </h2>
              <p className="text-xl text-slate-600">
                We go beyond just providing a room — we create a home
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-[#004AAD]/50 transition-all hover:shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-[#004AAD] to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#004AAD] via-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Find Your Perfect Room?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join hundreds of happy residents who call ROOMAC home
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/properties">
                <Button size="lg" className="bg-white text-[#004AAD] hover:bg-white/90 shadow-xl">
                  <Search className="mr-2 h-5 w-5" />
                  Explore Properties
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                  <Phone className="mr-2 h-5 w-5" />
                  Talk to Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
