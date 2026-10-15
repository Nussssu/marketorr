import { motion, useReducedMotion } from 'framer-motion';
import ScrubRise from '../motion/ScrubRise';
import { GradientTitle, SectionLabel } from '../ui/primitives';
import { assetUrl } from '../../lib/asset';

function LeadershipPortrait({ image, alt }) {
    const reduce = useReducedMotion();

    return (
        <motion.figure
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.22, margin: '0px 0px -5% 0px' }}
            transition={reduce ? undefined : { type: 'spring', stiffness: 170, damping: 17, mass: 0.75 }}
            className="relative overflow-hidden rounded-[2rem]"
        >
            <img
                src={assetUrl(image)}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] h-full max-h-[620px] w-full object-cover object-top"
            />
        </motion.figure>
    );
}

function LeadershipCopy({ name, role, bio }) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3, margin: '0px 0px -5% 0px' }}
            transition={reduce ? undefined : { type: 'spring', stiffness: 175, damping: 18, mass: 0.72, delay: 0.1 }}
            className="flex flex-col justify-center"
        >
            {role && (
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#891FFB]">
                    {role}
                </p>
            )}
            <h3 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-4xl">
                {name}
            </h3>
            {bio && (
                <p className="mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--mute)] md:text-base">
                    {bio}
                </p>
            )}
        </motion.div>
    );
}

/**
 * Leadership: a heading, then the leader's portrait beside their name, role
 * and bio. The awards strip follows as its own section.
 *
 * @param {{ content?: { label?: string, heading?: string, highlight?: number, name?: string, role?: string, bio?: string, image?: string } }} props
 */
export default function Team({ content = {} }) {
    const hasLeader = Boolean(content.name || content.image);

    return (
        <section aria-labelledby="team-title" className="section-pad relative border-t border-[var(--line)]">
            <div className="container-x">
                <ScrubRise>
                    {content.label && <SectionLabel name={content.label} />}
                    <h2 id="team-title" className="display-md mt-6 max-w-3xl uppercase text-[var(--ink-strong)]">
                        <GradientTitle text={content.heading ?? ''} highlightWords={Number(content.highlight ?? 0)} />
                    </h2>
                </ScrubRise>

                {hasLeader && (
                    <div className="mt-12 grid items-center gap-10 md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
                        {content.image && (
                            <LeadershipPortrait
                                image={content.image}
                                alt={[content.name, content.role].filter(Boolean).join(', ') + ' at Marketorr'}
                            />
                        )}
                        <LeadershipCopy name={content.name} role={content.role} bio={content.bio} />
                    </div>
                )}
            </div>
        </section>
    );
}
