import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPinned, MessageSquare } from 'lucide-react';
import { OfficeLocation } from './types';

interface OfficeInfoProps {
  locations: OfficeLocation[];
}

export default function OfficeInfo({ locations }: OfficeInfoProps) {
  return (
    <div className="space-y-6">
      {/* Office Hours */}
      <Card className="border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
  <CardContent className="p-0">
    <div className="bg-gradient-to-br from-[#004AAD] to-blue-500 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Clock className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-white">Office Hours</h3>
          <p className="text-xs text-white/80">Visit us anytime</p>
        </div>
      </div>
    </div>
    
    <div className="p-4 bg-white">
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-slate-600 font-medium">Mon - Fri</span>
          <span className="text-[#004AAD] font-semibold">9 AM - 7 PM</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-slate-600 font-medium">Saturday</span>
          <span className="text-[#004AAD] font-semibold">10 AM - 6 PM</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-slate-600 font-medium">Sunday</span>
          <span className="text-[#004AAD] font-semibold">10 AM - 5 PM</span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
      {/* Office Locations */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPinned className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Our Offices</h3>
              <p className="text-sm text-slate-600">Multiple locations</p>
            </div>
          </div>
          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="pb-4 border-b last:border-0">
                <h4 className="font-bold text-slate-900 mb-2">{location.city}</h4>
                <p className="text-sm text-slate-600 mb-2">{location.address}</p>
                <div className="flex flex-col gap-1 text-xs">
                  <a href={`tel:${location.phone}`} className="text-[#004AAD] hover:underline">{location.phone}</a>
                  <a href={`mailto:${location.email}`} className="text-[#004AAD] hover:underline">{location.email}</a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Response Card */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-[#004AAD] via-blue-600 to-cyan-600 p-6 text-white">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
          <p className="text-white/90 mb-4 text-sm">
            For urgent queries, reach us directly via WhatsApp or call us. We're always ready to assist you!
          </p>
          <a href="https://wa.me/919876543210?text=Hi%20ROOMAC,%20I%20need%20assistance" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-white text-[#004AAD] hover:bg-white/90 shadow-lg">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat on WhatsApp
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}