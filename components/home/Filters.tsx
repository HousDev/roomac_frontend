// components/home/Filters.tsx
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Home, Building2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 }
};

interface FiltersProps {
  cities: any[];
  isLoading?: boolean;
}

export default function Filters({ cities, isLoading = false }: FiltersProps) {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchArea, setSearchArea] = useState('');

  if (isLoading) {
    return (
      <div className="py-6 sm:py-8 bg-white -mt-8 sm:-mt-12 md:-mt-16 relative z-20 px-2 sm:px-4">
        <div className="container mx-auto px-3 sm:px-4">
          <Card className="border rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 rounded-lg"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.section 
      className="py-6 sm:py-8 bg-white -mt-8 sm:-mt-12 md:-mt-16 relative border-collapse z-20 px-2 sm:px-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 1.6 }}>
          <Card className="border rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 mx-1">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <motion.div variants={slideInFromLeft} transition={{ delay: 1.7 }} className="md:col-span-1">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-white border-2 border-blue-200/70 text-slate-700 hover:border-blue-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm text-sm sm:text-base">
                      <SelectValue placeholder="Select Cityyy" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg sm:rounded-xl shadow-xl border border-blue-100 bg-white">
                      {cities.map((city: any) => (
                        <SelectItem key={city.id} value={city.name.toLowerCase()} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors text-sm sm:text-base">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            {city.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={slideInFromLeft} transition={{ delay: 1.8 }} className="md:col-span-1">
                  <Input
                    placeholder="Search by locality..."
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-white border-2 border-blue-200/70 text-slate-700 hover:border-blue-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm text-sm sm:text-base"
                  />
                </motion.div>

                <motion.div variants={slideInFromLeft} transition={{ delay: 1.9 }} className="md:col-span-1">
                  <Select>
                    <SelectTrigger className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-white border-2 border-blue-200/70 text-slate-700 hover:border-blue-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm text-sm sm:text-base">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg sm:rounded-xl shadow-xl border border-blue-100 bg-white">
                      <SelectItem value="pg" className="hover:bg-blue-50 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <Home className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          PG Accommodation
                        </div>
                      </SelectItem>
                      <SelectItem value="coliving" className="hover:bg-blue-50 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          Co-Living Space
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={slideInFromLeft} transition={{ delay: 2.0 }} className="w-full md:col-span-1">
                  <Link href="/properties" className="w-full">
                    <Button className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold gap-2 bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                      Search Properties
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}