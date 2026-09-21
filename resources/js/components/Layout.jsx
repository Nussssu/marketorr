import { Link } from '@inertiajs/react';
import AnnouncementBanner from './layout/AnnouncementBanner';
import Header from './layout/Header';
import Footer from './layout/Footer';
import SmoothScroll from './motion/SmoothScroll';
import CustomCursor from './motion/CustomCursor';
import ScrollProgress from './motion/ScrollProgress';
import PageTransition, { transitionTo } from './motion/PageTransition';
import ShowcaseTransition from './motion/ShowcaseTransition';

function navigateToContact(event) {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();
    transitionTo('/contact');
}

/**
 * Phone-only vertical CTA, pinned to the middle of the right edge.
 *
 * Anchored from the top at 50% with a half-height pull-back rather than from
 * the bottom: the centre of the viewport is the one point that stays put on
 * every phone size and as the browser chrome collapses, so the button sits in
 * the same place on a small device as on a tall one and never drifts down over
 * the content it is floating above.
 */
function MobileProjectButton() {
    return (
        <Link
            href="/contact"
            onClick={navigateToContact}
            data-cursor="cta"
            aria-label="Start a project"
            className="btn-press fixed right-2 top-1/2 z-[120] flex w-10 -translate-y-1/2 flex-col items-center rounded-full py-3.5 text-white shadow-[0_10px_28px_-12px_rgba(80,122,244,0.75)] lg:hidden"
            style={{ background: 'linear-gradient(180deg,#891FFB,#507AF4,#1BE2EB)' }}
        >
            <span className="rotate-180 text-[9px] font-extrabold uppercase leading-none tracking-[0.16em] [writing-mode:vertical-rl]">
                Start a Project
            </span>
            <span aria-hidden className="mt-2 text-xs leading-none">
                ↗
            </span>
        </Link>
    );
}

export default function Layout({ children }) {
    return (
        <>
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
            >
                Skip to content
            </a>
            <ScrollProgress />
            <CustomCursor />
            <SmoothScroll />
            <AnnouncementBanner />
            <Header />
            <MobileProjectButton />
            <PageTransition>
                <main id="main">{children}</main>
                <Footer />
            </PageTransition>
            <ShowcaseTransition />
        </>
    );
}
