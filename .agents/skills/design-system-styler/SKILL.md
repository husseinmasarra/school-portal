---
name: design-system-styler
description: Design system guidelines, color palette, Tailwind CSS rules, glassmorphism UI components, and emoji-free clean typography guidelines for the school portal.
---

# UI Design System & Styling Guidelines

Follow these visual guidelines for all UI components in the school portal:

## 1. Color Palette
- **Primary Ocean Blue**: `#0284C7` (Sky-600)
- **Deep Navy Header/Active**: `#032541` (Navy-950)
- **Slate Text**: `#0F172A` (Slate-900)
- **Action Accent CTA (10% Rule)**: `#EF4444` (Red-500)
- **Warning / Honor Accent**: `#F59E0B` (Amber-500)
- **Success / Live Accent**: `#10B981` (Emerald-500)

## 2. Typography & Emoji Rules
- **No Text Emojis**: Never use emoji characters (`📅`, `🔑`, `🌟`, `🟢`, `✨`) inside text titles, menu labels, or button text.
- **Lucide React Icons**: Use crisp, vector SVG icons from `lucide-react`.
- **Pulsing Live Badges**: Use `<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />` for live indicators.

## 3. Component Styling
- **Buttons**: Rounded-2xl / rounded-3xl with smooth transition `transition-all shadow-md hover:scale-[1.02] cursor-pointer`.
- **Cards**: `bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm shadow-slate-100`.
- **Inputs**: `bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#0284C7]`.
