import { useThemeMotion } from '../../lib/theme';

/**
 * Reusable cinematic background stage.
 *
 * Composes layered radial glows, an optional faint grid, a dynamic
 * atmosphere wash (driven by `--atmo`), logo-inspired three-bar motif
 * and a gradient hairline — without ever duplicating the
 * CSS in every section. Always `aria-hidden` + pointer-events-none so
 * decor can never cover text or intercept clicks.
 *
 * Variants encode intent: hero = strongest tricolor lighting,
 * about = clean + dark, services = reactive atmosphere,
 * contact = full convergence. The Our Work section runs undecorated.
 */
const VARIANTS = {
    hero: {
        grid: false, // hero owns a mouse-reactive grid layer itself
        orbs: [
            { color: 'var(--glow-purple)', cls: '-left-40 top-[28%] h-[480px] w-[480px]' },
            { color: 'var(--glow-blue)', cls: 'right-[-160px] top-[6%] h-[430px] w-[430px]' },
            { color: 'var(--glow-cyan)', cls: 'bottom-[-130px] left-1/3 h-[300px] w-[540px]' },
        ],
        beam: true,
    },
    about: {
        grid: false,
        orbs: [
            { color: 'var(--glow-blue)', cls: 'right-[-140px] top-[4%] h-[340px] w-[340px]' },
        ],
        motif: 'right-[5%] top-[10%]',
    },
    services: {
        grid: true,
        orbs: [],
        atmosphere: true,
    },
    contact: {
        grid: false,
        orbs: [
            { color: 'var(--glow-purple)', cls: 'left-[-120px] top-[6%] h-[400px] w-[400px]' },
            { color: 'var(--glow-cyan)', cls: 'bottom-[-140px] left-[30%] h-[300px] w-[560px]' },
        ],
        hairline: true,
    },
};

function Motif({ cls = '' }) {
    const bars = [
        { c: '#891FFB', h: 44 },
        { c: '#507AF4', h: 68 },
        { c: '#1BE2EB', h: 96 },
    ];
    return (
        <div className={`absolute hidden items-end gap-2 opacity-50 sm:flex ${cls}`} aria-hidden>
            {bars.map((b) => (
                <span
                    key={b.c}
                    className="motif-bar w-5"
                    style={{ height: b.h, background: `linear-gradient(180deg, ${b.c}59, transparent)` }}
                />
            ))}
        </div>
    );
}

export default function Stage({ variant = 'about', atmo = null, atmoKey = 'base' }) {
    const fx = useThemeMotion();
    const v = VARIANTS[variant] ?? VARIANTS.about;

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {v.grid && <div className="grid-bg absolute inset-0" />}
            {v.beam && (
                <div
                    className="absolute left-1/2 top-[-220px] h-[380px] w-[720px] max-w-none -translate-x-1/2 rounded-[100%]"
                    style={{ background: 'radial-gradient(ellipse, var(--glow-purple), transparent 70%)', opacity: fx.orb }}
                />
            )}
            {(v.orbs ?? []).map((o, i) => (
                <div
                    key={i}
                    className={`absolute rounded-full ${o.cls}`}
                    style={{ background: `radial-gradient(circle, ${o.color}, transparent 70%)`, opacity: fx.orb }}
                />
            ))}
            {v.atmosphere && atmo && (
                <div
                    key={atmoKey}
                    className="atmo-wash absolute inset-0"
                    style={{ background: `radial-gradient(55% 45% at 72% 18%, ${atmo}2e, transparent 70%)` }}
                />
            )}
            {v.motif && <Motif cls={v.motif} />}
            {v.hairline && (
                <div className="hairline-brand hairline-fade absolute inset-x-0 top-0 opacity-70" />
            )}
        </div>
    );
}
