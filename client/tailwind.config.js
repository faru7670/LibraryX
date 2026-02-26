/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
                    400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
                    800: '#86198f', 900: '#701a75',
                },
                accent: {
                    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
                    400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
                    800: '#155e75', 900: '#164e63',
                },
                violet: {
                    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
                    400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
                    800: '#5b21b6', 900: '#4c1d95',
                },
                surface: {
                    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
                    400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#1e293b',
                    800: '#0f172a', 900: '#020617',
                },
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 3s ease-in-out infinite',
                'slide-up': 'slideUp 0.4s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
            },
            keyframes: {
                float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
                glow: { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
                slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh': 'linear-gradient(135deg, #d946ef22 0%, transparent 50%), linear-gradient(225deg, #06b6d422 0%, transparent 50%)',
            },
        },
    },
    plugins: [],
};
