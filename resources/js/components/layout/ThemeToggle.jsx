import { motion } from 'framer-motion';
import { useTheme } from '../../lib/theme';

export default function ThemeToggle({ compact = false }) {
    const { theme, toggle } = useTheme();
    const dark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={!dark}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`btn-press relative flex items-center rounded-full border border-[var(--line)] bg-[var(--chip)] ${
                compact ? 'h-9 w-9 justify-center' : 'h-10 gap-2 px-3'
            }`}
        >
            <span className="relative block h-4 w-4" aria-hidden>
                {/* sun */}
                <motion.span
                    className="absolute inset-0 rounded-full bg-[#1BE2EB]"
                    initial={false}
                    animate={{ scale: dark ? 0 : 1, opacity: dark ? 0 : 1 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* moon */}
                <motion.span
                    className="absolute inset-0 rounded-full bg-[#891FFB]"
                    initial={false}
                    animate={{ scale: dark ? 1 : 0, opacity: dark ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                    className="absolute inset-[3px] rounded-full bg-[var(--bg)]"
                    initial={false}
                    animate={{ x: dark ? 3 : -3, opacity: dark ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
            </span>
            {!compact && (
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                    {dark ? 'Light' : 'Dark'}
                </span>
            )}
        </button>
    );
}
