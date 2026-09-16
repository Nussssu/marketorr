import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';
const LEGACY_KEY = 'marketorr-theme';

function readStoredTheme() {
    if (typeof window === 'undefined') return 'dark';
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
        return stored === 'light' || stored === 'dark' ? stored : 'dark';
    } catch {
        return 'dark';
    }
}

function applyTheme(choice) {
    const root = document.documentElement;
    root.setAttribute('data-theme', choice);
    root.classList.toggle('dark', choice === 'dark');
}

const ThemeContext = createContext({ theme: 'dark', choice: 'dark', toggle: () => {}, setChoice: () => {} });

export function ThemeProvider({ children }) {
    const [choice, setChoiceState] = useState(readStoredTheme);
    const [theme, setTheme] = useState(choice);

    useEffect(() => {
        setTheme(choice);
        try {
            applyTheme(choice);
        } catch {
            /* DOM unavailable — theme still works for the session */
        }
    }, [choice]);

    const setChoice = useCallback((next) => {
        setChoiceState(next);
        try {
            if (next === 'system') {
                window.localStorage.removeItem(STORAGE_KEY);
                window.localStorage.removeItem(LEGACY_KEY);
            } else {
                window.localStorage.setItem(STORAGE_KEY, next);
                window.localStorage.removeItem(LEGACY_KEY);
            }
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
