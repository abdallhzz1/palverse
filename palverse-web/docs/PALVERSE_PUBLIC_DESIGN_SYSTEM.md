# Palverse Public Design System

## Colors
- **Primary Dark Green**: `#0F3D2E` - Used for navigation, primary actions, and footers.
- **Primary Green**: `#1E7D4E` - Used for accents, buttons, active states.
- **Muted Green**: `#7FA789` - Used for borders, subtle elements, inactive states.
- **Light Green**: `#EAF3EC` - Used for backgrounds, hover states on cards.
- **White**: `#FFFFFF` - Primary background.
- **Dark Surface**: `#1F2522` - Primary background for Dark Mode.

## Typography
- **Primary Font (Arabic)**: `Cairo`
- **Secondary Font (Arabic)**: `IBM Plex Sans Arabic` (fallback or specific elements)
- **Primary Font (English/Technical)**: `Inter`

## Component Guidelines
### Cards
- White background (Light Mode) or Dark Surface (Dark Mode).
- Thin muted green border (`border-[#7FA789]`).
- Small, clean shadows.
- Consistent border radius (`rounded-lg` or `rounded-xl` depending on size).

### Buttons
- **Primary**: Dark green (`#0F3D2E`) or Green (`#1E7D4E`) background, white text.
- **Secondary/Outline**: Transparent background, Muted green border, Green text.
- Slightly rounded (`rounded-md` or `rounded-full`).

### Forms & Inputs
- Simple outlines, muted green focus rings.
- Large, accessible tap targets for mobile.

## Assets
- Use brand assets strictly from `public/brand/` directory.
- Preserve aspect ratios.
- Support both Light and Dark mode variations if necessary.
