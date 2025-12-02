'use client';

import React, { useState, useCallback } from 'react';
import { Upload as UploadIcon, Image, Sparkles, Home, X } from 'lucide-react';

interface UploadProps {
    onFileSelect: (file: File | null) => void;
    currentFile: File | null;
    onNext: () => void;
}

export default function Upload({ onFileSelect, currentFile, onNext }: UploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentFile ? URL.createObjectURL(currentFile) : null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                handleFileSelection(file);
            }
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        onFileSelect(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleRemove = () => {
        onFileSelect(null);
        setPreview(null);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-6">
                <div className="flex justify-center items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                        <Home className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-6xl md:text-7xl font-['Space_Grotesk'] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 animate-gradient">
                        Room Designer
                    </h1>
                </div>

                <p className="text-gray-700 max-w-3xl mx-auto text-2xl font-['Inter'] font-light leading-relaxed">
                    Transform your empty space into a stunning, personalized sanctuary with AI-powered interior design.
                    Upload a photo and let us bring your vision to life.
                </p>
            </div>

            <div
                className={`bg-white p-12 rounded-[2rem] shadow-sm border-3 border-dashed transition-all duration-300 ${isDragging
                    ? 'border-orange-500 bg-orange-100/50 shadow-2xl scale-105'
                    : 'border-orange-300 bg-white/80 shadow-xl hover:shadow-2xl hover:scale-102'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    {preview ? (
                        <div className="text-center">
                            <img src={preview} alt="Preview" className="mx-auto h-64 object-cover rounded-xl shadow-md mb-6" />
                            <div className="flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="px-6 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    Remove
                                </button>
                                <button
                                    onClick={onNext}
                                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 relative">
                            {isDragging ? (
                                <>
                                    <div className="mb-6 relative">
                                        <UploadIcon className={`w-16 h-16 text-orange-400 animate-bounce`} strokeWidth={1.5} />
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-20 rounded-full blur-xl"></div>
                                    </div>
                                    <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
                                </>
                            ) : (
                                <>
                                    <div className="mb-6 relative">
                                        <UploadIcon className={`w-16 h-16 text-orange-400`} strokeWidth={1.5} />
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-20 rounded-full blur-xl"></div>
                                    </div>
                                    <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2" />
                                </>
                            )}

                            <label htmlFor="file-upload" className="relative cursor-pointer">
                                <span className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-102 transition-all">
                                    Click to upload
                                </span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileInput} />
                            </label>

                            <p className="text-gray-500 mb-6">or drag and drop your image here</p>

                            <div className="flex items-center gap-4 text-xs text-gray-400 uppercase tracking-wider">
                                <div className="h-px w-12 bg-gray-300"></div>
                                <span>PNG, JPG, WEBP up to 10MB</span>
                                <div className="h-px w-12 bg-gray-300"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
