"use client";

import { useState, useCallback, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";

interface FiltersSectionProps {
  onFiltersChange?: (filters: any) => void;
}

const FiltersSection = memo(function FiltersSection({ onFiltersChange }: FiltersSectionProps) {
  const [selectedCity, setSelectedCity] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([5000, 15000]);
  const [showFilters, setShowFilters] = useState(false);

  const handleCityChange = useCallback((value: string) => {
    setSelectedCity(value);
    onFiltersChange?.({ city: value, searchArea, selectedType, budgetRange });
  }, [searchArea, selectedType, budgetRange, onFiltersChange]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchArea(value);
    onFiltersChange?.({ city: selectedCity, searchArea: value, selectedType, budgetRange });
  }, [selectedCity, selectedType, budgetRange, onFiltersChange]);

  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value);
    onFiltersChange?.({ city: selectedCity, searchArea, selectedType: value, budgetRange });
  }, [selectedCity, searchArea, budgetRange, onFiltersChange]);

  const handleBudgetChange = useCallback((value: [number, number]) => {
    setBudgetRange(value);
    onFiltersChange?.({ city: selectedCity, searchArea, selectedType, budgetRange: value });
  }, [selectedCity, searchArea, selectedType, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setSelectedCity("");
    setSearchArea("");
    setSelectedType("");
    setBudgetRange([5000, 15000]);
    onFiltersChange?.({ city: "", searchArea: "", selectedType: "", budgetRange: [5000, 15000] });
  }, [onFiltersChange]);

  const activeFiltersCount = [
    selectedCity,
    searchArea,
    selectedType
  ].filter(Boolean).length + (budgetRange[0] !== 5000 || budgetRange[1] !== 15000 ? 1 : 0);

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-4 -mt-6 sm:-mt-7 md:-mt-8 relative z-10 mb-8 sm:mb-10 md:mb-12">
      <Card className="shadow-3xl animate-slide-in-left">
        <CardContent className="p-4 sm:p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="animate-fade-in-up animation-delay-300">
            <Input
              placeholder="City"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 focus:scale-[1.02]"
            />
          </div>

          <div className="animate-fade-in-up animation-delay-400">
            <Input
              placeholder="Search name or area"
              value={searchArea}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 focus:scale-[1.02]"
            />
          </div>

          <div className="animate-fade-in-up animation-delay-500">
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-[1.01] hover:border-blue-300">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single" className="text-sm sm:text-base">Single Sharing</SelectItem>
                <SelectItem value="double" className="text-sm sm:text-base">Double Sharing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 animate-fade-in-up animation-delay-600">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1 sm:gap-2 h-10 sm:h-11 md:h-12 flex-1 text-xs sm:text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              Budget
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-10 sm:h-11 md:h-12 transition-all duration-300 hover:scale-110 hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="col-span-1 sm:col-span-2 md:col-span-4 mt-3 sm:mt-4 animate-fade-in-up animation-delay-200">
              <p className="mb-2 text-xs sm:text-sm">
                Budget ₹{budgetRange[0]} - ₹{budgetRange[1]}
              </p>
              <Slider
                value={budgetRange}
                onValueChange={handleBudgetChange}
                min={5000}
                max={15000}
                step={500}
                className="h-2 sm:h-3"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default FiltersSection;