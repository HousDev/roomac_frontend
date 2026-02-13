import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPinned, MessageSquare } from 'lucide-react';
import { OfficeLocation } from './types';

interface OfficeInfoProps {
  locations: OfficeLocation[];
}

export default function OfficeInfo({ locations }: OfficeInfoProps) {
  return (
   <div className="space-y-4">
  {/* Office Hours */}
  <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <CardContent className="p-0">
      <div className="bg-gradient-to-br from-[#004AAD] to-blue-600 p-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Office Hours</h3>
            <p className="text-xs text-white/70">Visit us anytime</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-white">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center py-2 px-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-slate-600 font-medium text-sm">Mon - Fri</span>
            <span className="text-[#004AAD] font-semibold text-sm">9 AM - 7 PM</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-slate-600 font-medium text-sm">Saturday</span>
            <span className="text-[#004AAD] font-semibold text-sm">10 AM - 6 PM</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-slate-600 font-medium text-sm">Sunday</span>
            <span className="text-[#004AAD] font-semibold text-sm">10 AM - 5 PM</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Office Locations */}
  <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <CardContent className="p-0">
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <MapPinned className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Our Offices</h3>
            <p className="text-xs text-white/70">Multiple locations</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-white">
        <div className="space-y-3">
          {locations.map((location, index) => (
            <div key={index} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
              <h4 className="font-semibold text-sm text-slate-900 mb-1">{location.city}</h4>
              <p className="text-sm text-slate-600 mb-2 leading-relaxed">{location.address}</p>
              <div className="flex flex-col gap-1">
                <a href={`tel:${location.phone}`} className="text-[#004AAD] hover:underline text-sm font-medium">
                  {location.phone}
                </a>
                <a href={`mailto:${location.email}`} className="text-[#004AAD] hover:underline text-sm">
                  {location.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Quick Response Card */}
  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className="bg-gradient-to-br from-[#004AAD] via-blue-600 to-cyan-600 p-4 text-white">
      <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold mb-2">Need Immediate Help?</h3>
      <p className="text-white/90 mb-3 text-sm leading-relaxed">
        For urgent queries, reach us directly via WhatsApp or call us. We're always ready to assist you!
      </p>
      <a href="https://wa.me/919876543210?text=Hi%20ROOMAC,%20I%20need%20assistance" target="_blank" rel="noopener noreferrer">
        <Button className="w-full bg-white text-[#004AAD] hover:bg-white/90 shadow-md font-semibold text-sm py-2.5">
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat on WhatsApp
        </Button>
      </a>
    </div>
  </Card>
</div>
  );
}