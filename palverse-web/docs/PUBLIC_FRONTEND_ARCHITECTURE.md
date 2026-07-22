# Palverse Public Frontend Architecture

## Overview
This document outlines the architecture for the Next.js public frontend for Palverse. It is designed to be highly maintainable, scalable, and fully aligned with the approved UI/UX references.

## Core Technologies
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (PostCSS)
- **State Management**: React Hooks (and Context for theme/i18n if needed)
- **Data Fetching**: Axios (custom client interceptor)
- **Icons**: `lucide-react`
- **Forms**: `react-hook-form` + `zod`

## Directory Structure
```
src/
  app/              # Next.js App Router pages and layouts
  components/       # Reusable UI components
    brand/          # Brand assets, logos, patterned backgrounds
    categories/     # Category chips and cards
    home/           # Home page specific sections
    layout/         # Header, Footer, Navigation
    search/         # Search bar and filters
    stores/         # Store cards, profile, details
    ui/             # Base UI elements (buttons, inputs)
  constants/        # App-wide constants
  hooks/            # Custom React hooks
  lib/              # Utility functions and shared libraries
    api/            # Axios client and API helpers
    i18n/           # Localization dictionaries
    utils/          # Tailwind merge and formatting helpers
  types/            # TypeScript interfaces and types
```

## Routing Strategy
The app uses the Next.js App Router.
- `/`: Home Page
- `/search`: Search results
- `/categories`: All categories
- `/stores`: All stores
- `/stores/[slug]`: Store detail page
- `/offers`: Offers listing
- `/pages/[slug]`: Static pages (About, Terms, etc.)
- `/faqs`: FAQ page

## Localization
- Default Language: Arabic (`ar`), Direction: RTL.
- Future support for English (`en`).
- All user-facing strings should be localized using dictionaries located in `src/lib/i18n/`.

## Theming
- Primary experience is Light Mode (white canvas, green accents).
- Dark Mode is supported via `next-themes`, mapping to Tailwind's dark variants.
