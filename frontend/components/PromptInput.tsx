'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';


interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    onBack: () => void;
    onGenerate: () => void;
    isProcessing: boolean;
    error: string | null;
}

export default function PromptInput({ value, onChange, onBack, onGenerate, isProcessing, error }: PromptInputProps) {
    return (
        <div className="max-w-4xl mx-auto">

            <div className="text-center space-y-6 mb-12">
                <div className="flex justify-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-6xl md:text-7xl font-['Space_Grotesk'] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 animate-gradient">
                        Final Touch
                    </h2>
                </div>
                <p className="text-2xl font-serif text-terracotta mb-12 text-center max-w-3xl mx-auto">
                    Describe any specific requirements or preferences for your space
                </p>
            </div>

            <div className="mb-8">
                <textarea
                    rows={6}
                    className="w-full px-6 py-6 border-3 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none resize-none bg-white/80 backdrop-blur-sm shadow-lg text-lg"
                    placeholder="Describe what you envision for this room..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all shadow-lg"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <button
                    onClick={onGenerate}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg flex items-center"
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Design...
                        </>
                    ) : (
                        <>
                            Generate Design
                            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
            {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        </div>
    );
}
