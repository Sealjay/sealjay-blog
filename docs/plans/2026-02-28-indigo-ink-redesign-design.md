# Indigo Ink Redesign - Design Document

Date: 2026-02-28

## Overview

Complete visual redesign of sealjay.com applying the "Indigo Ink" design direction: deep indigo-black backgrounds with electric indigo and violet accents, rose-pink warm highlights, and editorial typography.

## Key Architecture Decisions

### Dark Mode: Full CSS Custom Properties

- Replace all Tailwind `dark:` prefix classes with CSS custom property references (`var(--color-*)`)
- Use `data-theme="dark"` attribute on `<html>` instead of `.dark` class
- Inline script in `<head>` prevents flash of wrong theme
- `localStorage` persists preference, falls back to `prefers-color-scheme`

### Layout: Full-Width Sections

- Remove current floating card wrapper (`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl`)
- Full-width page backgrounds with section-based alternating colours
- Sticky blurred header, full-width footer with `var(--color-bg-alt)` background
- Content constrained by Container (1120px) and ContentContainer (720px)

### File Renaming

- `IndexLayout.astro` (current root) → `BaseLayout.astro`
- `BaseLayout.astro` (current article) → `BlogPostLayout.astro`
- Update all imports across the codebase

## Design Tokens

### Typography

| Role    | Font               | Fallbacks                         |
|---------|--------------------|-----------------------------------|
| Heading | Bricolage Grotesque | system-ui, sans-serif             |
| Body    | Source Serif 4     | Georgia, Times New Roman, serif   |
| Code    | IBM Plex Mono      | ui-monospace, SFMono-Regular      |

### Colour Palette

Dark mode base: `#0C0A1D` (ink-950)
Light mode base: `#F8F9FC` (paper-50)
Primary: Indigo (`#818CF8` dark / `#4F46E5` light)
Warm: Rose (`#F472B6` dark / `#DB2777` light)
Success: Emerald (`#34D399` dark / `#059669` light)

All colours verified for WCAG 2.1 AA contrast ratios.

### Spacing & Radius

Border radii: 8px (sm), 12px (md), 16px (lg), 20px (xl)
Content max-width: 720px, Layout max-width: 1120px

## Scope

### Modified Files

Every layout, component, container, and page file in the Astro source.
Tailwind config, global CSS, package.json.

### Preserved

- All content files (.mdx, .md) unchanged
- All routes and URLs unchanged
- RSS, JSON Feed, search index endpoints unchanged
- Redirect logic unchanged
- Azure Static Web Apps deployment config unchanged
- astro.config.mjs integration structure unchanged

### Removed

- `@fontsource/inter` and `@fontsource/manrope` packages
- All `dark:` Tailwind prefix usage
- Zinc-based colour scheme
- Floating card layout wrapper
- `prism.css` (replaced by custom syntax theme)

## Constraints

- WCAG 2.1 AA compliance on every page in both modes
- `prefers-reduced-motion: reduce` disables all animation
- 44px minimum touch targets
- Mobile-first (320px+) responsive
- No client-side JS except: dark mode toggle, search dialog, mobile menu
- British English (`lang="en-GB"`)
