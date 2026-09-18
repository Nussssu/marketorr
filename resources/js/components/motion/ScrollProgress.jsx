import { usePage } from '@inertiajs/react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Whether this is a discipline page - /services/branding, /services/ui-ux.
 *
 * Those pages run a pinned showcase that carries its own position indicator,
 * so a second bar reading the same scroll at the top of the screen says
 * nothing extra and competes with it. The services index and the individual
 * sub-service pages keep the bar.
 *
 * @param {string} url
 * @return {boolean}
 */
function isDisciplinePage(url) {
    const path = url.split(/[?#]/)[0];
    const segments = path.split('/').filter(Boolean);

    return segments.length === 2 && segments[0] === 'services';
}

export default function ScrollProgress() {
    const { url } = usePage();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

    if (isDisciplinePage(url)) {
        return null;
    }

    return (
        <motion.div
            className="fixed left-0 top-0 z-[10000] h-[3px] w-full origin-left"
            style={{ scaleX, background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
            aria-hidden
        />
    );
}
