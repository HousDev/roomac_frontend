import { Check, Crown, Sparkles } from 'lucide-react';
import { PricingPlan } from '@/types/property';

interface PricingPlansProps {
  plans: PricingPlan[];
  onSelectPlan: () => void;
}

export function PricingPlans({ plans, onSelectPlan }: PricingPlansProps) {
  return (
    <div className="glass rounded-2xl p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-black gradient-text flex items-center mb-1">
          <Sparkles className="w-5 h-5 mr-2" />
          Pricing Plans
        </h2>
        <p className="text-gray-700 font-semibold text-sm">Choose your duration</p>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative glass rounded-xl p-4 transition-all border-2 ${
              plan.recommended
                ? 'border-yellow-400 shadow-xl'
                : 'border-white/20'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-2 -right-2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                  <Crown className="w-3 h-3 inline mr-1" />
                  Popular
                </span>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base font-black text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">All-inclusive</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black gradient-text">₹{plan.price.toLocaleString()}</p>
                <p className="text-xs text-gray-600 font-semibold">/mo</p>
              </div>
            </div>

            <ul className="space-y-2 mb-5">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 font-semibold">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onSelectPlan}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-lg hover:scale-105 ${
                plan.recommended
                  ? 'bg-blue-500 text-white'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
              }`}
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
