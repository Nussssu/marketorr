import { useLayoutEffect, useRef } from 'react';

/**
 * A disclosure panel whose natural height is cached before interaction.
 *
 * Animating an explicit pixel height avoids the repeated intrinsic grid-track
 * calculation caused by `0fr`/`1fr`. ResizeObserver keeps the cache accurate
 * when copy wraps differently, fonts settle, or the viewport changes, without
 * doing a synchronous measurement in the click handler.
 */
export default function FastCollapse({ open, id, children, className = '' }) {
    const panelRef = useRef(null);
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        const panel = panelRef.current;
        const content = contentRef.current;

        if (!panel || !content) return undefined;

        const cacheHeight = () => {
            panel.style.setProperty('--collapse-height', `${content.getBoundingClientRect().height}px`);
        };

        cacheHeight();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', cacheHeight, { passive: true });

            return () => window.removeEventListener('resize', cacheHeight);
        }

        const observer = new ResizeObserver(cacheHeight);
        observer.observe(content);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={panelRef}
            id={id}
            aria-hidden={!open}
            className="overflow-hidden transition-[height] duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
                height: open ? 'var(--collapse-height, auto)' : '0px',
                contain: 'layout paint',
            }}
        >
            <div ref={contentRef} className={className}>
                {children}
            </div>
        </div>
    );
}
