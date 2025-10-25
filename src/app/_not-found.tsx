'use client';

import Link from 'next/link';
import { ShoppingBasket, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 px-4">
            <div className="text-center max-w-2xl">
                {/* 404 with grocery theme */}
                <div className="relative mb-8">
                    <h1 className="text-[120px] md:text-[180px] font-bold text-neutral-200 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBasket className="w-20 h-20 md:w-32 md:h-32 text-primary-brand opacity-60" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                    Oops! Product Not Found 🛒
                </h2>
                <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Looks like this page wandered off to a different aisle. Let&apos;s get you back to shopping!
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-primary-brand hover:bg-primary-brand-hover text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-8 py-3 rounded-xl transition-all duration-200 border-2 border-neutral-200 hover:border-neutral-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Popular categories suggestion */}
                <div className="mt-12 pt-8 border-t border-neutral-200">
                    <p className="text-sm text-neutral-500 mb-4">Or explore popular categories:</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {['🍎 Fruits', '🥬 Vegetables', '🥛 Dairy', '🍞 Bakery', '🍝 Snacks'].map((category) => (
                            <Link
                                key={category}
                                href="/"
                                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-neutral-700 hover:bg-primary-brand hover:text-white transition-all duration-200 border border-neutral-200 hover:border-primary-brand"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}