# Issue #8 Analysis: Tailwind MLB Theme Configuration

## Overview
Configure Tailwind CSS with MLB brand colors and custom theme.

## Work Streams

### Stream A: Tailwind Setup (Single Stream)
**Files to Create:**
- `frontend/tailwind.config.js` - Tailwind configuration
- `frontend/postcss.config.js` - PostCSS config
- `frontend/src/index.css` - Global CSS with variables

**Implementation Details:**
1. Install dependencies:
   - tailwindcss, postcss, autoprefixer
   - Initialize tailwind config

2. tailwind.config.js:
   ```javascript
   colors: {
     mlb: {
       navy: '#041E42',
       red: '#BF0D3E',
       'red-dark': '#A00B34',
     },
     gold: '#C4A35A',
     success: '#2D8659',
     warning: '#E67E22',
     info: '#3182CE',
     error: '#DC2626',
   },
   borderRadius: {
     card: '12px',
     button: '8px',
   },
   boxShadow: {
     card: '0 4px 6px rgba(4, 30, 66, 0.05)',
     'card-hover': '0 10px 15px rgba(4, 30, 66, 0.1)',
   }
   ```

3. index.css:
   - Tailwind directives (@tailwind base, components, utilities)
   - CSS variables for colors
   - Import in main.tsx

**Parallel Streams:** 1

## Dependencies
- Issue #7 (React + Vite) - Can run in parallel

## Definition of Done
- [ ] Tailwind CSS installed
- [ ] MLB colors work (bg-mlb-navy, text-mlb-red)
- [ ] Custom shadows work
- [ ] Global styles applied
