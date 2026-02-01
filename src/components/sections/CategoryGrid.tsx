"use client";

import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";

const categories = [
  { name: "Fruits & Vegetables", image: "/images/Category/fruit.webp" },
  { name: "Dairy, Bread & Eggs", image: "/images/Category/dairy.webp" },
  { name: "Atta, Rice, Oil & Dals", image: "/images/Category/atta.webp" },
  { name: "Meat, Fish & Eggs", image: "/images/Category/meat.webp" },
  { name: "Breakfast & Sauces", image: "/images/Category/breakfast.webp" },
  { name: "Packaged Food", image: "/images/Category/packed.webp" },
  { name: "Mohalla Cafe", image: "/images/Category/cafe.webp" },
  { name: "Tea, Coffee & More", image: "/images/Category/tea.webp" },
  { name: "Ice Creams & More", image: "/images/Category/icecream.webp" },
  { name: "Frozen Food", image: "/images/Category/frozen.webp" },
  { name: "Biscuits & Cookies", image: "/images/Category/biscuit.webp" },
  { name: "Cold Drinks & Juices", image: "/images/Category/colddrink.webp" },
  { name: "Sweets & Namkeen", image: "/images/Category/sweet.webp" },
];

export default function CategoryGrid() {
  return (
    <section className="py-4 bg-background overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
          {categories.map((cat, index) => (
            <Link
              key={index}
              href={`/category?category=${encodeURIComponent(cat.name)}`}
              className="shrink-0 snap-start"
            >
              <div className="relative w-[100px] h-[148px] overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={100}
                  height={148}
                  className="w-full h-full object-contain"
                  priority={index < 8}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Optional: Right Navigation Arrow (Visible on hover on desktop) */}
        <div className="absolute right-5 top-1/2 z-10 -translate-y-1/2 hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/80 p-2 shadow-lg backdrop-blur-sm hover:bg-black transition-colors"
            onClick={() => {
              const el = document.querySelector('.no-scrollbar');
              el?.scrollBy({ left: 300, behavior: 'smooth' });
            }}
          >
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M8.5 5L15.5 12L8.5 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
