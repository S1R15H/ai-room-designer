import React from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';

interface Item {
    name: string;
    link: string;
    category?: string;
    price?: number;
}

interface ResultViewerProps {
    originalUrl: string;
    generatedUrl: string;
    items?: Item[];
}

export default function ResultViewer({ originalUrl, generatedUrl, items = [] }: ResultViewerProps) {
    // Mock data for display if missing
    const displayItems = items.map(item => ({
        ...item,
        category: item.category || 'Furniture',
        price: Number(item.price) || Math.floor(Math.random() * 500) + 50
    }));

    const totalCost = displayItems.reduce((sum, item) => sum + (item.price || 0), 0);

    return (
        <div className="w-full max-w-[1400px] mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center justify-center">
                    <h2 className="text-6xl font-['Space_Grotesk'] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 animate-gradient pb-2">
                        Your Design is Ready ✨
                    </h2>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:h-[600px] xl:h-[700px]">
                {/* Main Image Area */}
                <div className="flex-1 h-full">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full w-full">
                        <img
                            src={generatedUrl}
                            alt="Generated Design"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                            AI Generated
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-96 flex-shrink-0 h-full">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                        <div className="mb-6 flex-shrink-0">
                            <h3 className="text-lg font-bold text-terracotta">Furniture & Items</h3>
                            <p className="text-sm text-gray-500">{items.length} items selected</p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {displayItems.length > 0 ? (
                                displayItems.map((item, index) => (
                                    <div key={index} className="group p-4 border border-orange-100 rounded-2xl hover:border-orange-accent hover:shadow-md transition-all duration-300 bg-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                                                <p className="text-xs text-orange-accent font-medium uppercase tracking-wide mb-2">{item.category}</p>
                                                <p className="text-sm font-bold text-gray-700">${item.price}</p>
                                            </div>
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-orange-50 text-orange-accent rounded-lg group-hover:bg-orange-accent group-hover:text-white transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No items detected in this design.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Estimated Total:</span>
                                <span className="text-2xl font-bold text-terracotta">${totalCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
