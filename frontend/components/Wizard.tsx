'use client';

import React, { useState } from 'react';
import StepQuestion from './StepQuestion';
import ResultViewer from './ResultViewer';
import Upload from './Upload';
import PromptInput from './PromptInput';
import { generateRoomDesign } from '../lib/api';

const STEPS = [
    {
        id: 'upload',
        title: 'Upload Room',
    },
    {
        id: 'style',
        title: 'Style',
        question: 'Which design style resonates with you most?',
        options: [
            { label: 'Modern Minimalist', value: 'Modern Minimalist', description: 'Clean lines, neutral colors, less clutter' },
            { label: 'Industrial Loft', value: 'Industrial Loft', description: 'Exposed brick, metal accents, raw wood' },
            { label: 'Scandinavian / Hygge', value: 'Scandinavian / Hygge', description: 'Cozy, white/wood, soft textures, functional' },
            { label: 'Cyberpunk / Futuristic', value: 'Cyberpunk / Futuristic', description: 'Neon lights, high-tech, dark metallic' },
            { label: 'Bohemian', value: 'Bohemian', description: 'Plants, patterns, rattan, eclectic, warm' },
            { label: 'Mid-Century Modern', value: 'Mid-Century Modern', description: 'Retro 50s/60s, organic shapes, vibrant accents' },
            { label: 'Japandi', value: 'Japandi', description: 'Blend of Japanese rustic and Scandinavian functionalism' },
            { label: 'None', value: 'None', description: 'No specific style preference' },
        ]
    },
    {
        id: 'mood',
        title: 'Mood',
        question: 'How do you want this room to feel?',
        options: [
            { label: 'Calm & Zen', value: 'Calm & Zen', description: 'Soft lighting, uncluttered, peaceful' },
            { label: 'Energetic & Creative', value: 'Energetic & Creative', description: 'Bright natural light, bold colors' },
            { label: 'Moody & Dramatic', value: 'Moody & Dramatic', description: 'Dim lighting, dark walls, spotlighting' },
            { label: 'Professional & Focused', value: 'Professional & Focused', description: 'Cool lighting, organized, sharp contrast' },
            { label: 'Cozy & Warm', value: 'Cozy & Warm', description: 'Warm lighting, blankets, soft shadows' },
            { label: 'Luxury & Elegant', value: 'Luxury & Elegant', description: 'Gold accents, marble, expensive textures' },
            { label: 'None', value: 'None', description: 'No specific mood preference' },
        ]
    },
    {
        id: 'functionality',
        title: 'Functionality',
        question: 'What is the main activity for this room?',
        options: [
            { label: 'Deep Focus / Work', value: 'Deep Focus / Work', description: 'Needs: Desk, Ergonomic Chair, Bookshelf' },
            { label: 'Relaxation / Lounge', value: 'Relaxation / Lounge', description: 'Needs: Sofa, Coffee Table, TV' },
            { label: 'Gaming / Streaming', value: 'Gaming / Streaming', description: 'Needs: Desk, multiple monitors, RGB lighting' },
            { label: 'Creative Studio', value: 'Creative Studio', description: 'Needs: Large table, storage, easel/instruments' },
            { label: 'Sleeping / Rest', value: 'Sleeping / Rest', description: 'Needs: Bed, Nightstands, Wardrobe' },
            { label: 'Entertainment / Party', value: 'Entertainment / Party', description: 'Needs: Couch, TV, Speakers, Tables' },
            { label: 'None', value: 'None', description: 'No specific functionality preference' },
        ]
    },
    {
        id: 'palette',
        title: 'Color Palette',
        question: 'What color palette do you prefer?',
        options: [
            { label: 'Earth Tones', value: 'Earth Tones', description: 'Beige, Olive, Terracotta, Brown' },
            { label: 'Monochrome', value: 'Monochrome', description: 'Black, White, Grey' },
            { label: 'Pastel', value: 'Pastel', description: 'Soft Pink, Mint Green, Baby Blue' },
            { label: 'Dark & Bold', value: 'Dark & Bold', description: 'Navy Blue, Emerald Green, Charcoal' },
            { label: 'Warm Neutrals', value: 'Warm Neutrals', description: 'Cream, Taupe, Sand' },
            { label: 'Cool Blues', value: 'Cool Blues', description: 'Teal, Slate, Sky Blue' },
            { label: 'Bold Colors', value: 'Bold Colors', description: 'Red, Orange, Yellow, Purple' },
            { label: 'None', value: 'None', description: 'No specific color palette preference' },
        ]
    },
    {
        id: 'clutter',
        title: 'Clutter Level',
        question: "How 'lived-in' should the room look?",
        options: [
            { label: 'Showroom Perfect', value: 'Showroom Perfect', description: 'Zero clutter, architectural photography style' },
            { label: 'Organized but Lived-in', value: 'Organized but Lived-in', description: 'A few books out, coffee cup, throw blanket' },
            { label: 'Maximalist / Busy', value: 'Maximalist / Busy', description: 'Lots of items, posters, full shelves, eclectic' },
            { label: 'None', value: 'None', description: 'No specific clutter preference' },
        ]
    },
    {
        id: 'additional',
        title: 'Additional',
    },
    {
        id: 'result',
        title: 'Result',
    }
];

export default function Wizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSelect = (value: string) => {
        const stepId = STEPS[currentStep].id;
        setAnswers(prev => ({ ...prev, [stepId]: value }));
    };

    const handleGenerate = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('style', answers['style'] || 'None');
        formData.append('mood', answers['mood'] || 'None');
        formData.append('functionality', answers['functionality'] || 'None');
        formData.append('palette', answers['palette'] || 'None');
        formData.append('clutter', answers['clutter'] || 'None');
        formData.append('additional_prompt', answers['additional'] || '');

        try {
            const data = await generateRoomDesign(formData);
            setResult(data);
            handleNext(); // Go to result step
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsProcessing(false);
        }
    };

    const step = STEPS[currentStep];

    // Render Steps
    if (step.id === 'upload') {
        return (
            <Upload
                onFileSelect={setFile}
                currentFile={file}
                onNext={handleNext}
            />
        );
    }

    if (step.id === 'additional') {
        return (
            <PromptInput
                value={answers['additional'] || ''}
                onChange={(value) => setAnswers(prev => ({ ...prev, additional: value }))}
                onBack={handleBack}
                onGenerate={handleGenerate}
                isProcessing={isProcessing}
                error={error}
            />
        );
    }

    if (step.id === 'result') {
        return result ? (
            <ResultViewer
                originalUrl={result.original_url}
                generatedUrl={result.generated_url}
                items={result.items}
            />
        ) : null;
    }

    // Default Question Step
    const totalQuestions = STEPS.length - 2; // Exclude upload and result
    const currentQuestion = currentStep;

    return (
        <div>
            <div className="flex justify-center mb-8">
                <span className="inline-block px-4 py-1 rounded-full bg-orange-50 text-orange-accent text-sm font-medium border border-orange-100">
                    Question {currentQuestion} of {totalQuestions}
                </span>
            </div>

            <StepQuestion
                question={step.question!}
                options={step.options!}
                selectedValue={answers[step.id] || ''}
                onSelect={handleSelect}
            />

            <div className="max-w-4xl mx-auto mt-12 flex justify-between">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all shadow-lg"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!answers[step.id]}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
