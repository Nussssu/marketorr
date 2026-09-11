import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', choice: 'light', toggle: () => {}, setChoice: () => {} });

export function ThemeProvider({ children }) {
    const [choice, setChoiceState] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const stored = window.localStorage.getItem('marketorr-theme');
        return stored === 'dark' || stored === 'light' ? stored : 'light';
    });
    const [theme, setTheme] = useState(choice);

    useEffect(() => {
        setTheme(choice);
        document.documentElement.setAttribute('data-theme', choice);
    }, [choice]);

    const setChoice = useCallback((next) => {
        setChoiceState(next);
        try {
            if (next === 'system') window.localStorage.removeItem('marketorr-theme');
            else window.localStorage.setItem('marketorr-theme', next);
        } catch {
            /* storage unavailable — theme still works for the session */
        }
    }, []);

    const toggle = useCallback(() => {
        setChoice(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setChoice]);

    return (
        <ThemeContext.Provider value={{ theme, choice, toggle, setChoice }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

/**
 * Per-theme animation adjustments.
 * Dark keeps the full cinematic treatment; light softens glow-heavy
 * motion so it stays premium on a paper background.
 */
export function useThemeMotion() {
    const { theme } = useTheme();
    const light = theme === 'light';
    return {
        theme,
        glow: light ? 0.45 : 1, // box-shadow / glow opacity multiplier
        orb: light ? 0.65 : 1, // ambient orb opacity multiplier
        float: light ? 0.55 : 1, // decorative float amplitude multiplier
        orbBlur: light ? 100 : 140, // ambient orb blur radius
        barGlow: (color, base) =>
            `0 0 ${Math.round(base * (light ? 0.5 : 1))}px ${color}55`,
    };
}
