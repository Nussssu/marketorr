/**
 * The standard grey placeholder plate.
 *
 * Every media slot on the site that is waiting for a real file renders this
 * exact graphic, so an unfilled slot is unmistakably an unfilled slot rather
 * than a design choice. It is drawn inline instead of loaded as a file: it
 * costs no request, stays crisp at hero size, and disappears from the bundle
 * the moment the last slot is filled.
 *
 * The plate is deliberately the familiar light-grey scene, not a branded
 * panel — it should never be mistaken for finished work, and it should read
 * the same way inside a dark hero as it does inside a light card.
 *
 * `slice` is what makes one drawing serve a 16:9 hero and a 16:10 card
 * without distorting: the scene fills the frame and crops, exactly as a
 * photograph with `object-cover` would, so swapping a real file in changes
 * nothing about the geometry.
 *
 * @param {{ kind?: 'image'|'video', label?: string, className?: string }} props
 */
export default function MediaPlaceholder({ kind = 'image', label, className = '' }) {
    const isVideo = kind === 'video';

    return (
        <div
            className={`absolute inset-0 h-full w-full overflow-hidden ${className}`}
            role="img"
            aria-label={label ?? (isVideo ? 'Video placeholder' : 'Image placeholder')}
        >
            <svg
                viewBox="0 0 1200 800"
                preserveAspectRatio="xMidYMid slice"
                className="h-full w-full"
                aria-hidden
                focusable="false"
            >
                <rect width="1200" height="800" fill="#c9ced7" />
                <circle cx="348" cy="352" r="52" fill="#eff1f4" />
                <path
                    d="M0 800V506c66-78 182-92 286 26 52 59 92 56 138-8 58-80 124-196 196-274 60-65 130-70 194-12 86 78 194 274 386 462v100z"
                    fill="#eff1f4"
                />
            </svg>

            {isVideo && (
                /* The only thing that tells a waiting film apart from a
                   waiting photograph. Kept as a single quiet glyph so the
                   plate still reads as empty space, not as a player. */
                <span aria-hidden className="absolute inset-0 grid place-items-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-[#6b7280]/85 md:h-20 md:w-20">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-[2px] md:h-7 md:w-7" fill="#eff1f4" aria-hidden>
                            <path d="M8 5.14v13.72L19 12z" />
                        </svg>
                    </span>
                </span>
            )}
        </div>
    );
}
