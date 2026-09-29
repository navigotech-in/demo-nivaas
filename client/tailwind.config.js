/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#FDFCF9', // Soft White/Cream
        'base-soft': '#FFF6E8', // Warm Cream
        surface: '#FFFFFF', // Pure White
        'surface-grey': '#E7E0D7', // Warm Taupe Border
        'surface-dark': '#292826', // Graphite
        ink: '#292826', // Graphite
        'ink-light': '#54504A', // High-contrast Warm Charcoal (WCAG AA compliant)
        muted: '#54504A', // High-contrast Warm Charcoal
        line: '#E7E0D7', // Warm Taupe Border
        'line-subtle': '#F0EBE6',
        accent: '#E76F2E', // Saffron Orange
        'accent-dark': '#B84718', // Deep Saffron (4.5:1+ contrast)
        'accent-soft': '#54504A',
        'accent-tint': '#FBE7D3', // Soft Saffron Tint
        slatecard: '#FFFFFF',
      },
      fontFamily: {
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', "'Segoe UI'", 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        content: '1600px', // Full width modern container
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 30px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
}