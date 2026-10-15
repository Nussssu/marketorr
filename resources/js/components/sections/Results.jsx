import { Link } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { EASE } from '../../lib/motion';
import CountUp from '../motion/CountUp';
import RevealText from '../motion/RevealText';
import { SectionLabel } from '../ui/primitives';

/**
 * One result, set as an oversized number. It slides in from the side and
 * counts up as it arrives; alternate rows come from alternate sides.
 */
function ResultRow({ item, index, reduce }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 55%'] });
    const from = index % 2 === 0 ? -8 : 8;
    const x = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : [`${from}%`, '0%']);
    const opacity = useTransform(scrollYProgress, [0, 0.6], reduce ? [1, 1] : [0.15, 1]);
    const isInternal = item.url?.startsWith('/');

    return (
        <li ref={ref} className="grid gap-6 border-t border-[var(--line)] py-12 md:py-16 lg:grid-cols-12 lg:items-end lg:gap-10">
            <motion.p
                style={{ x, opacity }}
                className="font-display text-[clamp(4.25rem,15vw,15rem)] font-extrabold leading-[0.82] tracking-[-0.055em] text-[var(--ink-strong)] lg:col-span-8"
            >
                <CountUp to={Number(item.value) || 0} prefix={item.prefix ?? ''} />
                {item.suffix && <span className="text-gradient text-[0.42em] tracking-[-0.03em]">{item.suffix}</span>}
            </motion.p>

            <motion.div
                className="lg:col-span-4 lg:pb-4"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 0.7, delay: 0.15, ease: [...EASE] }}
            >
                <p className="font-display text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">{item.label}</p>
                {item.context && <p className="mt-3 text-[15px] leading-relaxed text-[var(--mute)]">{item.context}</p>}
                {item.url && (
                    isInternal ? (
                        <Link
                            href={item.url}
                            data-cursor="view"
                            className="link-underline btn-press mt-5 inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]"
                        >
                            See the work ↗
                        </Link>
                    ) : (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor="view"
                            className="link-underline btn-press mt-5 inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]"
                        >
                            See the work ↗
                        </a>
                    )
                )}
            </motion.div>
        </li>
    );
}

/**
 * Client outcomes, one oversized number per row.
 *
 * @param {{ content?: { heading?: string, items?: Array<{ prefix?: string, value?: number, suffix?: string, label?: string, context?: string, url?: string }> } }} props
 */
export default function Results({ content }) {
    const reduce = useReducedMotion();
    const items = (content?.items ?? []).filter((item) => item?.label);
    const heading = content?.heading || 'Results';

    if (items.length === 0) return null;

    return (
        <section id="results" className="noise relative overflow-hidden bg-[var(--bg-soft)] section-pad">
            <div className="container-x relative">
                <SectionLabel name="RESULTS" />
                <RevealText
                    as="h2"
                    className="display-md mt-8 max-w-3xl uppercase text-[var(--ink-strong)]"
                    lines={[heading]}
                />
                <ul className="mt-14 border-b border-[var(--line)] md:mt-20">
                    {items.map((item, index) => (
                        <ResultRow key={index} item={item} index={index} reduce={reduce} />
                    ))}
                </ul>
            </div>
        </section>
    );
}
