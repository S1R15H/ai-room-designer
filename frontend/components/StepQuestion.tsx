import React from 'react';

interface Option {
  label: string;
  description: string;
  value: string;
}

interface StepQuestionProps {
  question: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function StepQuestion({
  question,
  options,
  selectedValue,
  onSelect,
}: StepQuestionProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-4xl font-serif text-terracotta mb-12 text-center">
        {question}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-md ${
              selectedValue === option.value
                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-1xl scale-103'
                : 'border-orange-100 bg-white hover:border-orange-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="pr-8">
                <div className="font-semibold text-lg text-gray-900 mb-2">
                  {option.label}
                </div>
                <div className="text-sm text-gray-500 leading-relaxed">
                  {option.description}
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 transition-colors ${
                  selectedValue === option.value
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 group-hover:border-orange-300'
                }`}
              >
                {selectedValue === option.value && (
                  <svg
                    className="w-full h-full text-white p-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
