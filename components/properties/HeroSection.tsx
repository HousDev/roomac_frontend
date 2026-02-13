"use client";

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-blue-100 h-auto min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] py-8 md:py-12 lg:py-16">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDRBQUQiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

      <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />
      <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-25 sm:opacity-30 md:opacity-40" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-50 to-white rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-20 sm:opacity-25 md:opacity-30" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
          <div className="mb-4 sm:mb-5 md:mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-white hover:to-[#093876] text-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 border-0 text-xs sm:text-sm hover:text-white">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Premium Accommodations
              </Badge>
            </motion.div>
          </div>

          <div className="mb-4 sm:mb-5 md:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight sm:leading-tight md:leading-tight">
              <div className="block text-slate-900 mb-1 sm:mb-1.5 md:mb-2">
                {"Find Your Perfect".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              <div className="block">
                {"Home".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.5 + (index * 0.1),
                      type: "spring",
                      stiffness: 100
                    }}
                    className="inline-block text-blue-800"
                    style={{
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl mx-auto px-2 sm:px-4">
              Discover premium PG accommodations with modern amenities, flexible pricing, and unmatched comfort across multiple locations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0"
          >
            <Button className="bg-gradient-to-r from-[#004AAD] to-blue-600 hover:from-blue-600 hover:to-[#004AAD] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto">
              Explore Properties
            </Button>
            <Button
              variant="outline"
              className="border-2 border-[#004AAD] text-[#004AAD] hover:bg-teal-300 hover:text-black hover:border-blue-900 hover:shadow-lg px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto mt-2 sm:mt-0 transition-all duration-300 hover:animate-pulse"
            >
              Learn 
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-blue-400 rounded-full"
        animate={{
          y: [0, 8, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-[#004AAD] rounded-full"
        animate={{
          y: [0, -8, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute top-[10%] left-[10%] w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </section>
  );
}