import { FileCheck, AlertCircle } from 'lucide-react';

interface TermsConditionsProps {
  terms: string[];
}

export function TermsConditions({ terms }: TermsConditionsProps) {
  return (
    <div className="glass rounded-2xl p-4 shadow-xl">
      <h2 className="text-sm font-black gradient-text mb-3 flex items-center">
        <FileCheck className="w-4 h-4 mr-1.5" />
        Terms & Conditions
      </h2>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
        {terms.map((term, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2 bg-white/50 rounded-lg border border-gray-200"
          >
            <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-700 font-medium leading-relaxed">{term}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2.5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
        <p className="text-[10px] text-gray-600 font-semibold text-center leading-relaxed">
          By booking, you agree to all terms mentioned above
        </p>
      </div>
    </div>
  );
}
