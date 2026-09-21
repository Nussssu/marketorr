import { Link } from '@inertiajs/react';
import {
    motion,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion';
import { useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import { useTapIntent } from '../../lib/tapIntent';

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/**
 * Real photographic visuals per sub-service, taken from the studio's own
 * project photography. Never the SVG logo marks — every card shows a
 * real-world scene: identity systems, campaign photography, packaging in
 * hand, motion renders, interfaces and product screens.
 */
const VISUALS = {
    'brand-strategy': { src: '/images/work/nature-to-near.jpg', alt: 'Near To Nature brand campaign — harvester at sunset with brand overlay' },
    'brand-identity-design': { src: '/images/work/imperial-jute-brand.jpg', alt: 'Imperial Jute brand identity system — signage, stationery and logo construction' },
    rebranding: { src: '/images/work/sabdita-fashion.jpg', alt: 'Sabdita fashion brand refresh — apparel campaign visual' },
    'packaging-design': { src: '/images/work/commercial-cleaning-seo.jpg', alt: 'Cleaning product packaging held in hand — spray and pump bottles' },
    'motion-branding': { src: '/images/work/dusty-vision.jpg', alt: 'Golden 3D motion render of a letterform in dark space' },
    'brand-guidelines': { src: '/images/work/virgin-trend.jpg', alt: 'Vibrant magenta 3D brand world with monogram' },
    'website-ui-ux-design': { src: '/images/work/city-online-web.jpg', alt: 'City Online website interface presented on a dark laptop mockup' },
    'mobile-app-ui-ux': { src: '/images/work/photo-fix-zone.jpg', alt: 'Photo Fix Zone mobile experience — phone repair service visual' },
    'saas-product-design': { src: '/images/work/un-point.jpg', alt: 'Industrial product rendered on a laptop screen in a dark studio' },
    'ux-research-strategy': { src: '/images/work/imperial-jute-seo.jpg', alt: 'SEO analytics and research data visual' },
    'wireframing-prototyping': { src: '/images/work/animateuix.jpg', alt: 'AnimateUIX interface prototype in progress' },
    'design-system': { src: '/images/work/ecohub-essentials.jpg', alt: 'Ecohub Essentials e-commerce interface system on a laptop' },
};

/**
 * Premium 3D floating action button. Gradient fill with layered glow
 * shadows, a sheen sweep and a lift on hover — depth without any JS.
 */
function ViewServiceButton({ href, label }) {
    const tapIntent = useTapIntent();

    return (
        <Link
            href={href}
            prefetch
            data-cursor="cta"
            aria-label={label}
            onPointerDown={tapIntent.onPointerDown}
            onPointerMove={tapIntent.onPointerMove}
            onPointerCancel={tapIntent.onPointerCancel}
            onClick={tapIntent.onClick}
            className="group/btn relative inline-flex w-full min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2.5 py-2.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-300 ease-out hover:-translate-y-1 min-[769px]:w-fit min-[769px]:gap-2.5 min-[769px]:px-7 min-[769px]:py-3.5 min-[769px]:text-[12px] min-[769px]:tracking-[0.17em]"
            style={{
                background: BRAND_GRADIENT,
                boxShadow: '0 18px 42px -12px rgba(137,31,251,0.65), 0 8px 22px -8px rgba(27,226,235,0.45)',
            }}
        >
            <span aria-hidden className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover/btn:bg-white/15" />
            <span className="relative min-w-0 truncate">
                <span className="min-[769px]:hidden">View</span>
                <span className="hidden min-[769px]:inline">View Service</span>
            </span>
            <span aria-hidden className="relative inline-block transition-transform duration-300 ease-out group-hover/btn:translate-x-1">→</span>
        </Link>
    );
}

/**
 * One floating card in the scroll-driven 3D journey. `rel` is 0 when the
 * card is active, +1 while it waits below, -1 once it has exited upward.
 * Cards swing in from alternating sides — even cards bank in from the
 * left, odd cards from the right — rising forward out of depth with a
 * soft focus pull, then settling flat while the reader is on them.
 * Only transform/opacity/filter move; only the near-active card takes
 * pointer input.
 *
 * Hold behaviour: every curve is plateaued across rel [-HOLD, HOLD], so a
 * card sits perfectly still and fully readable for ~70% of its scroll
 * window and only travels in the outer zones. The previous card fades and
 * shrinks away slowly across its whole exit zone instead of vanishing.
 */
const HOLD = 0.35;

function JourneyCard({ category, item, index, count, activeFloat, dimensional }) {
    const side = index % 2 === 0 ? 1 : -1;
    const rel = useTransform(activeFloat, (v) => v - index);
    const y = useTransform(rel, [-1.2, -HOLD, HOLD, 1.4], ['-12%', '0%', '0%', '22%']);
    const rotateX = useTransform(rel, [-1, -HOLD, HOLD, 1], dimensional ? [-9, 0, 0, 9] : [0, 0, 0, 0]);
    const rotateY = useTransform(rel, [-1, -HOLD, HOLD, 1], dimensional ? [-8 * side, 0, 0, 13 * side] : [0, 0, 0, 0]);
    const scale = useTransform(rel, [-1, -HOLD, HOLD, 1], [0.92, 1, 1, 0.95]);
    const opacity = useTransform(rel, [-0.9, -0.55, -HOLD, HOLD, 0.55, 0.95], [0, 0.3, 1, 1, 1, 0]);
    const z = useTransform(rel, (v) => -Math.abs(v) * 170);
    const zIndex = useTransform(rel, (v) => 20 - Math.min(19, Math.round(Math.abs(v) * 10)));
    const pointerEvents = useTransform(rel, (v) => (Math.abs(v) < 0.5 ? 'auto' : 'none'));
    const visual = VISUALS[item.slug] ?? { src: item.image, alt: `${item.name} featured visual` };
    const href = `/services/${category.slug}/${item.slug}`;

    return (
        <motion.article
            style={{ y, rotateX, rotateY, scale, opacity, z, zIndex, pointerEvents }}
            className="absolute inset-0"
            aria-label={`${item.name} — service ${index + 1} of ${count}`}
        >
            <div className="grid h-full grid-cols-1 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_24px_60px_-30px_rgba(80,122,244,0.35)] md:grid-cols-[1.05fr_1fr]">
                <div className="relative min-h-[220px] overflow-hidden bg-[#0B0B10] md:min-h-0">
                    <img
                        src={visual.src}
                        alt={visual.alt}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: BRAND_GRADIENT }} aria-hidden />
                </div>

                <div className="relative flex min-w-0 flex-col justify-center p-7 sm:p-10 xl:p-12">
                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em]">
                        <span style={{ color: item.accent }}>{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-[var(--ink-faint)]" aria-hidden> / {String(count).padStart(2, '0')}</span>
                    </p>
                    <h3 className="mt-4 font-display text-[clamp(1.9rem,3.4vw,3.4rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[var(--ink-strong)]">
                        {item.name}
                    </h3>
                    <p className="mt-5 max-w-md text-[14px] leading-relaxed text-[var(--mute)] sm:text-[15px]">
                        {item.short}
                    </p>
                    <div className="mt-8 flex justify-end">
                        <ViewServiceButton href={href} label={`Open ${item.name}`} />
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

/**
 * Pinned desktop journey: the sticky viewport holds still while the page
 * scrolls past, and the wheel alone drives each card forward out of 3D
 * space. No timers, no autoplay — the animation is a pure function of
 * scroll position, so it reverses exactly when the reader scrolls back.
 */
function DesktopJourney({ category }) {
    const stage = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
    const count = category.items.length;
    const activeFloat = useTransform(scrollYProgress, [0, 1], [0, count - 1]);
    const [active, setActive] = useState(0);

    useMotionValueEvent(activeFloat, 'change', (value) => {
        // Flip the label the moment the incoming card reaches full opacity
        // (its hold-zone edge), so the name always matches the settled card.
        const next = Math.min(count - 1, Math.max(0, Math.floor(value + 0.35)));
        setActive((previous) => (previous === next ? previous : next));
    });

    return (
        <div ref={stage} className="relative hidden lg:block" style={{ height: `${Math.max(count * 110, 460)}vh` }}>
            <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
                <div className="container-x mb-6 flex items-end justify-between gap-6">
                    <p className="min-w-0 font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                        Scroll to explore — <span style={{ color: category.accent }}>{String(active + 1).padStart(2, '0')}</span>
                        <span aria-hidden> / {String(count).padStart(2, '0')} · </span>
                        <span className="inline-block max-w-[160px] truncate align-bottom text-[var(--ink)] sm:max-w-[260px]">{category.items[active]?.name}</span>
                    </p>
                    <div className="h-px w-[min(420px,36vw)] overflow-hidden bg-[var(--line)]" aria-hidden>
                        <motion.div className="h-full origin-left" style={{ scaleX: scrollYProgress, background: BRAND_GRADIENT }} />
                    </div>
                </div>

                <div className="container-x relative h-[68vh] min-h-[520px] [perspective:1500px]">
                    {category.items.map((item, i) => (
                        <JourneyCard
                            key={item.slug}
                            category={category}
                            item={item}
                            index={i}
                            count={count}
                            activeFloat={activeFloat}
                            dimensional={!reduce}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Mobile journey: the same cards as a native vertical stack with a light
 * entrance each — flat rise, fade and settle, no perspective or depth.
 * Touch scrolling stays fully native; nothing is pinned.
 */
function MobileJourney({ category, forceDesktop = false }) {
    const reduce = useReducedMotion();

    return (
        <div className={`container-x grid grid-cols-2 items-stretch gap-x-3 gap-y-8 pb-8 pt-6 min-[380px]:gap-x-4 min-[380px]:gap-y-10 min-[769px]:flex min-[769px]:flex-col min-[769px]:gap-20 min-[769px]:pb-28 ${forceDesktop ? '' : 'lg:hidden'}`}>
            {category.items.map((item, index) => {
                const visual = VISUALS[item.slug] ?? { src: item.image, alt: `${item.name} featured visual` };
                const href = `/services/${category.slug}/${item.slug}`;

                return (
                    <motion.article
                        key={item.slug}
                        initial={{ opacity: 0, x: reduce ? 0 : (index % 2 === 0 ? -18 : 18), y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 }}
                        whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.18 }}
                        transition={{ duration: reduce ? 0 : 0.52, delay: reduce ? 0 : (index % 2) * 0.07, ease: [...EASE] }}
                        className="group grid h-full min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_16px_40px_-20px_rgba(80,122,244,0.3)] min-[769px]:rounded-3xl"
                        aria-label={`${item.name} — service ${index + 1} of ${category.items.length}`}
                    >
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#0B0B10]">
                            <img
                                src={visual.src}
                                alt={visual.alt}
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: BRAND_GRADIENT }} aria-hidden />
                        </div>

                        <div className="flex min-w-0 flex-col p-3 min-[380px]:p-4 min-[769px]:p-8">
                            <p className="font-display text-[8px] font-bold uppercase tracking-[0.14em] min-[769px]:text-[11px] min-[769px]:tracking-[0.24em]">
                                <span style={{ color: item.accent }}>{String(index + 1).padStart(2, '0')}</span>
                                <span className="text-[var(--ink-faint)]" aria-hidden> / {String(category.items.length).padStart(2, '0')}</span>
                            </p>
                            <h3 className="mt-2 break-words font-display text-[clamp(0.9rem,4.2vw,1.15rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-[var(--ink-strong)] min-[769px]:mt-3 min-[769px]:text-4xl min-[769px]:leading-[0.98]">
                                {item.name}
                            </h3>
                            <p className="mt-2 line-clamp-3 max-w-lg text-[9px] leading-[1.45] text-[var(--mute)] min-[380px]:text-[10px] min-[769px]:mt-4 min-[769px]:line-clamp-none min-[769px]:text-[15px] min-[769px]:leading-relaxed">{item.short}</p>
                            <div className="mt-auto flex justify-end pt-4 min-[769px]:mt-6 min-[769px]:pt-0">
                                <ViewServiceButton href={href} label={`Open ${item.name}`} />
                            </div>
                        </div>
                    </motion.article>
                );
            })}
        </div>
    );
}

/**
 * Immersive scroll-driven 3D showcase for one discipline's sub-services.
 * Desktop pins a full-viewport stage where the wheel walks each large
 * floating card forward out of depth; mobile renders the same cards as a
 * light native stack. Reduced motion gets the stack with no entrance
 * travel. Every card links to its existing sub-service page — animation
 * only, routing untouched.
 */
export default function FloatingServiceCards({ category }) {
    const reduce = useReducedMotion();

    if (!category?.items?.length) {
        return null;
    }

    return (
        <section className="relative bg-[var(--bg)]" aria-label={`${category.name} services showcase`}>
            {reduce ? <MobileJourney category={category} forceDesktop /> : (
                <>
                    <DesktopJourney category={category} />
                    <MobileJourney category={category} />
                </>
            )}
        </section>
    );
}
