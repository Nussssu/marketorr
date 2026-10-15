import { Head, Link } from '@inertiajs/react';
import CategoryHero from '../../components/sections/CategoryHero';
import BounceTitle from '../../components/motion/BounceTitle';

export default function ServicesIndex({ subservices }) {
    return (
        <>
            <Head title="Services | Marketorr" />
            <div className="bg-[var(--bg)]">
                {subservices.map((category, index) => (
                    <div key={category.slug} id={category.slug}>
                        <CategoryHero category={category} blendTop={index > 0} />
                    </div>
                ))}

                <section className="container-x pb-24 pt-8 min-[769px]:py-24 lg:py-32">
                    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-7 py-16 text-center sm:px-12 lg:py-24">
                        <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">Have a project in mind?</p>
                        <h2 className="display-md mx-auto mt-5 max-w-4xl uppercase text-[var(--ink-strong)]">
                            <BounceTitle text="Let’s make it matter." highlightWords={0} delay={0.1} onScroll />
                        </h2>
                        <Link href="/contact" className="btn-press mt-8 inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.17em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                            Start a project <span aria-hidden>↗</span>
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
