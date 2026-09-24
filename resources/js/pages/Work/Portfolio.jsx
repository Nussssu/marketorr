import { Head, Link } from '@inertiajs/react';
import { SectionLabel } from '../../components/ui/primitives';
import ScrollHeading from '../../components/motion/ScrollHeading';
import WorkShowcase from '../../components/sections/WorkShowcase';
import { transitionTo } from '../../components/motion/PageTransition';
import { useTapIntent } from '../../lib/tapIntent';

/**
 * One portfolio: every published project filed under that practice.
 *
 * The heading is the portfolio's own name, so the reader always knows which of
 * the two they are inside. The listing below is the same showcase the work
 * index has always used — only its contents are narrowed.
 */
export default function WorkPortfolio({ group, projects = [] }) {
    const tapIntent = useTapIntent();

    const goBack = (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo('/work');
    };

    return (
        <>
            <Head title={`${group.heading} — Marketorr`} />
            <div className="bg-[var(--bg)] pb-24 pt-32">
                <div className="container-x">
                    <SectionLabel index="03" name="OUR WORK" />
                    <ScrollHeading className="mt-8">
                        <h1 className="display-lg uppercase text-[var(--ink-strong)]">{group.heading}</h1>
                    </ScrollHeading>

                    <WorkShowcase projects={projects} />

                    <div className="mt-16">
                        <Link
                            href="/work"
                            data-cursor="explore"
                            onPointerDown={tapIntent.onPointerDown}
                            onPointerCancel={tapIntent.onPointerCancel}
                            onClick={goBack}
                            className="btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]"
                        >
                            ← All work
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
