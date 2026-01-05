import React from "react";
import { Check } from "lucide-react";

const steps = [
  { number: 1, title: 'University Details' },
  { number: 2, title: 'Address Information' },
  { number: 3, title: 'Admin Account' },
];

export default function StepIndicator({ step }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((s, index) => (
          <React.Fragment key={s.number}>
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center 
                  font-bold text-base sm:text-lg
                  transition-all duration-500 shadow-lg
                  ${
                    step > s.number
                      ? 'bg-white text-[#C62828] scale-105'
                      : step === s.number
                      ? 'bg-white text-[#C62828] ring-4 ring-white/30 scale-105'
                      : 'bg-white/20 text-white/60'
                  }
                `}
              >
                {step > s.number ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`
                  text-xs sm:text-sm font-semibold mt-2 whitespace-nowrap
                  transition-all duration-300 hidden sm:block
                  ${step >= s.number ? 'text-white' : 'text-white/50'}
                `}
              >
                {s.title}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 sm:h-1 mx-3 sm:mx-4 relative">
                <div className="h-full bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-500 ease-in-out bg-white
                      ${step > s.number ? 'w-full' : 'w-0'}
                    `}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
