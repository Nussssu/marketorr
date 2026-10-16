import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { withAlpha } from './tokens';

const STORAGE_KEY = 'theme';
const LEGACY_KEY = 'marketorr-theme';

function readStoredTheme() {
    if (typeof window === 'undefined') return 'light';
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
        return stored === 'light' || stored === 'dark' ? stored : 'light';
    } catch {
        return 'light';
    }
}

function applyTheme(choice) {
    const root = document.documentElement;
    root.setAttribute('data-theme', choice);
    root.classList.toggle('dark', choice === 'dark');
}

const ThemeContext = createContext({ theme: 'light', choice: 'light', toggle: () => {}, setChoice: () => {} });

/** Mirror the choice to the cookie the server reads to render the same theme. */
function writeThemeCookie(value) {
    try {
        document.cookie = value
            ? `theme=${value};path=/;max-age=31536000;SameSite=Lax`
            : 'theme=;path=/;max-age=0;SameSite=Lax';
    } catch {
        /* cookies unavailable — the theme still applies for the session */
    }
}

/**
 * @param {{ initial?: 'light'|'dark', children: import('react').ReactNode }} props
 *   `initial` is the theme the server rendered (from the `theme` cookie). The
 *   first render uses it so hydration matches the server-rendered markup, and
 *   the stored choice takes over straight after.
 */
export function ThemeProvider({ initial, children }) {
    const [choice, setChoiceState] = useState(() => initial ?? readStoredTheme());
    const [theme, setTheme] = useState(choice);

    useEffect(() => {
        const stored = readStoredTheme();
        if (stored !== choice) {
            setChoiceState(stored);
        }
        // Only on mount: reconcile the server's theme with the stored choice.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                writeThemeCookie(null);
            } else {
                window.localStorage.setItem(STORAGE_KEY, next);
                window.localStorage.removeItem(LEGACY_KEY);
                writeThemeCookie(next);
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
            `0 0 ${Math.round(base * (light ? 0.5 : 1))}px ${withAlpha(color, '55')}`,
    };
}
