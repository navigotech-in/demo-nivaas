/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#F1F5F9', // Cool modern slate grey
        'base-soft': '#F8FAFC',
        surface: '#FFFFFF',
        'surface-grey': '#E2E8F0',
        'surface-dark': '#0F172A',
        ink: '#0F172A',
        'ink-light': '#334155',
        muted: '#64748B',
        line: '#CBD5E1',
        'line-subtle': '#E2E8F0',
        accent: '#334155',
        'accent-dark': '#1E293B',
        'accent-soft': '#64748B',
        'accent-tint': '#F1F5F9',
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