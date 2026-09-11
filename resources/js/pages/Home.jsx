import { Head } from '@inertiajs/react';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import OurWork from '../components/sections/OurWork';
import Contact from '../components/sections/Contact';
import { useThemeMotion } from '../lib/theme';

// Marquee strip — IDEA → EXPERIENCE → RESULT
function Strip() {
    const items = Array.from({ length: 8 }).flatMap(() => ['IDEA', 'EXPERIENCE', 'RESULT']);
    return (
        <div className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--surface)] py-4" aria-hidden>
            <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
                {[0, 1].map((half) => (
                    <div key={half} className="flex gap-8">
                        {items.map((t, i) => (
                            <span key={`${half}-${i}`} className="flex items-center gap-8 font-display text-[13px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                                {t}
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        background: t === 'IDEA' ? '#891FFB' : t === 'EXPERIENCE' ? '#507AF4' : '#1BE2EB',
                                    }}
                                />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const fx = useThemeMotion();
    return (
        <>
            <Head title="Marketorr — We Turn Attention Into Results" />
            <Hero />
            <Strip />
            <About />
            <Services />
            <OurWork glow={fx.barGlow} />
            <Contact />
        </>
    );
}
