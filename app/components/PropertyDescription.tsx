import { FileText, CheckCircle2, Sparkles, Award } from 'lucide-react';

interface PropertyDescriptionProps {
  description: string;
  highlights: string[];
}

export function PropertyDescription({ description, highlights }: PropertyDescriptionProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">
            About This Property
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-black text-white">Premium</span>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-5 mb-6 border-2 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-gray-800 leading-relaxed font-semibold text-sm">
              {description}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            Key Highlights
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-800">{highlight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
