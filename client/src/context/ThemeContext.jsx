import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const ACCENT_COLORS = [
    { name: 'Purple', key: 'purple', color: '#8b5cf6', gradient: 'from-fuchsia-500 via-violet-500 to-cyan-400' },
    { name: 'Blue', key: 'blue', color: '#3b82f6', gradient: 'from-blue-500 via-indigo-500 to-cyan-400' },
    { name: 'Emerald', key: 'emerald', color: '#10b981', gradient: 'from-emerald-500 via-teal-500 to-cyan-400' },
    { name: 'Rose', key: 'rose', color: '#f43f5e', gradient: 'from-rose-500 via-pink-500 to-fuchsia-400' },
    { name: 'Amber', key: 'amber', color: '#f59e0b', gradient: 'from-amber-500 via-orange-500 to-yellow-400' },
];

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('libx_theme');
        return saved ? saved === 'dark' : true; // Default to dark mode
    });

    const [accent, setAccent] = useState(() => {
        return localStorage.getItem('libx_accent') || 'purple';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('libx_theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem('libx_accent', accent);
    }, [accent]);

    const toggleTheme = () => setDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme, accent, setAccent, ACCENT_COLORS }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
