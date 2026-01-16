"use client";

import { useTheme } from "@/hooks/useTheme";

/**
 * Example component demonstrating the color system usage
 * Shows buttons, cards, and badges in both light and dark modes
 */
export function ColorSystemDemo() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-8 space-y-8">
      {/* Theme Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Color System Demo</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          Toggle Theme ({theme})
        </button>
      </div>

      {/* Primary Buttons - Green Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Green Palette (Grocery/Fresh)</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-6 py-3 rounded-lg bg-green-primary text-white hover:bg-green-hover transition-colors">
            Primary Button
          </button>
          <button className="px-6 py-3 rounded-lg bg-green-hover text-white transition-colors">
            Hover State
          </button>
          <div className="px-6 py-3 rounded-lg bg-green-bg text-foreground">
            Background Card
          </div>
        </div>
      </section>

      {/* Secondary Buttons - Purple Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Purple Palette (Premium/Modern)</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-6 py-3 rounded-lg bg-purple-primary text-white hover:bg-purple-hover transition-colors">
            Premium Button
          </button>
          <button className="px-6 py-3 rounded-lg bg-purple-hover text-white transition-colors">
            Hover State
          </button>
          <div className="px-6 py-3 rounded-lg bg-purple-bg text-foreground">
            Premium Card
          </div>
        </div>
      </section>

      {/* Accent Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accent Colors</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-6 py-3 rounded-lg bg-orange-primary text-white hover:opacity-90 transition-opacity">
            CTA / Urgency
          </button>
          <button className="px-6 py-3 rounded-lg bg-red-primary text-white hover:opacity-90 transition-opacity">
            Alert / Discount
          </button>
          <button className="px-6 py-3 rounded-lg bg-blue-primary text-white hover:opacity-90 transition-opacity">
            Informational
          </button>
        </div>
      </section>

      {/* Cards with Backgrounds */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards & Surfaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-2">Primary Card</h3>
            <p className="text-muted-foreground">This uses the main card background</p>
          </div>
          <div className="p-6 rounded-lg bg-orange-bg border border-border">
            <h3 className="font-semibold mb-2">Orange Background</h3>
            <p className="text-foreground">Subtle orange accent background</p>
          </div>
          <div className="p-6 rounded-lg bg-red-bg border border-border">
            <h3 className="font-semibold mb-2">Red Background</h3>
            <p className="text-foreground">Subtle red accent background</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges & Tags</h2>
        <div className="flex gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-green-primary text-white text-sm font-medium">
            Fresh
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-primary text-white text-sm font-medium">
            Premium
          </span>
          <span className="px-3 py-1 rounded-full bg-orange-primary text-white text-sm font-medium">
            Hot Deal
          </span>
          <span className="px-3 py-1 rounded-full bg-red-primary text-white text-sm font-medium">
            50% Off
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-primary text-white text-sm font-medium">
            Info
          </span>
        </div>
      </section>

      {/* Text Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-2">
          <p className="text-foreground text-lg">Primary text color (foreground)</p>
          <p className="text-muted-foreground">Secondary text color (muted-foreground)</p>
          <p className="text-green-primary font-semibold">Green primary text</p>
          <p className="text-purple-primary font-semibold">Purple primary text</p>
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Form Elements</h2>
        <div className="space-y-3 max-w-md">
          <input
            type="text"
            placeholder="Text input"
            className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:ring-2 focus:ring-ring outline-none"
          />
          <textarea
            placeholder="Textarea"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none"
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="checkbox-demo" className="accent-primary" />
            <label htmlFor="checkbox-demo" className="text-foreground">
              Checkbox with primary accent
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
