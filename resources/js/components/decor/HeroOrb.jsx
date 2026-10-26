import { usePage } from '@inertiajs/react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useMemo } from 'react';
import { EASE } from '../../lib/motion';
import { COLORS } from '../../lib/tokens';

/** Where the three floating labels sit around the orb, in `cqw` of the box. */
const CHIP_SPOTS = [
    { className: 'left-[0cqw] top-[16cqw]', delay: '0s', color: COLORS.grape },
    { className: 'right-[-2cqw] top-[38cqw]', delay: '-2.2s', color: COLORS.iris },
    { className: 'left-[8cqw] bottom-[16cqw]', delay: '-4.1s', color: COLORS.frost },
];

/**
 * The labels: the first service of each tab and then the next ones, so they
 * follow Admin > Services (names, order, published state).
 *
 * @returns {string[]}
 */
function useServiceLabels() {
    const { serviceCategories = [] } = usePage().props;

    return useMemo(() => {
        const columns = serviceCategories.map((category) => (category.items ?? []).map((item) => item.name));
        const picked = [];

        for (let row = 0; picked.length < 3 && columns.some((items) => items[row]); row++) {
            columns.forEach((items) => {
                if (picked.length < 3 && items[row]) picked.push(items[row]);
            });
        }

        return picked.length ? picked : ['Branding', 'UI/UX Design', 'Growth'];
    }, [serviceCategories]);
}

/**
 * The hero's right side: an animated brand orb in the Marketorr gradient.
 * The sphere's colour slowly swirls, two orbit rings carry points of light
 * around it, a glow breathes behind it, and three glass labels — the
 * services, straight from the admin — float beside it.
 *
 * All the motion is CSS (transform and opacity), so it stays smooth and
 * stops for reduced motion. Scroll eases it up and out as the hero leaves.
 * It is backdrop: no pointer events, hidden from assistive tech, and only
 * shown from desktop width, where there is room beside the copy.
 *
 * @param {{ progress?: import('framer-motion').MotionValue<number> }} props
 */
export default function HeroOrb({ progress }) {
    const reduce = useReducedMotion();
    const labels = useServiceLabels();

    const fallback = useMotionValue(0);
    const scroll = progress ?? fallback;
    const scrollY = useTransform(scroll, [0, 1], [0, -90]);
    const scrollScale = useTransform(scroll, [0, 1], [1, 0.9]);
    const scrollFade = useTransform(scroll, [0, 0.65], [1, 0]);

    return (
        <motion.div
            className="hero-orb pointer-events-none absolute right-[5%] top-[15%] hidden h-[min(30vw,420px)] w-[min(30vw,420px)] lg:block"
            style={{ containerType: 'size', ...(reduce ? {} : { y: scrollY, scale: scrollScale, opacity: scrollFade }) }}
            aria-hidden
        >
            <motion.div
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.3, ease: [...EASE] }}
            >
                {/* Soft brand glow, breathing behind everything. */}
                <div className="hero-orb__glow absolute inset-[8cqw] rounded-full" />

                {/* Orbit rings, tilted into ellipses, each carrying a point of light. */}
                <div className="hero-orb__orbit absolute inset-[4cqw]" style={{ '--tilt': '68deg', '--turn': '-18deg' }}>
                    <div className="hero-orb__ring hero-orb__ring--spin">
                        <span className="hero-orb__spark" style={{ background: COLORS.frost }} />
                    </div>
                </div>
                <div className="hero-orb__orbit absolute inset-[12cqw]" style={{ '--tilt': '72deg', '--turn': '28deg' }}>
                    <div className="hero-orb__ring hero-orb__ring--spin-reverse">
                        <span className="hero-orb__spark" style={{ background: COLORS.grape }} />
                    </div>
                </div>

                {/* The sphere: a slowly turning gradient under a glossy light. */}
                <div className="hero-orb__sphere absolute inset-[27cqw] overflow-hidden rounded-full">
                    <div
                        className="hero-orb__swirl absolute inset-[-25%]"
                        style={{ background: `conic-gradient(from 0deg, ${COLORS.grape}, ${COLORS.iris}, ${COLORS.frost}, ${COLORS.iris}, ${COLORS.grape})` }}
                    />
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.75),rgba(255,255,255,0.12)_28%,transparent_52%)]" />
                    <div className="absolute inset-0 rounded-full shadow-[inset_-1.6cqw_-2.4cqw_5cqw_rgba(12,8,40,0.45),inset_1cqw_1cqw_3cqw_rgba(255,255,255,0.25)]" />
                </div>

                {/* Services from the admin, floating as glass labels. */}
                {labels.map((label, index) => (
                    <div
                        key={label}
                        className={`hero-orb__chip absolute ${CHIP_SPOTS[index].className}`}
                        style={{ animationDelay: CHIP_SPOTS[index].delay }}
                    >
                        <span className="h-[1.8cqw] w-[1.8cqw] shrink-0 rounded-full" style={{ background: CHIP_SPOTS[index].color, boxShadow: `0 0 2cqw ${CHIP_SPOTS[index].color}` }} />
                        <span className="truncate">{label}</span>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
