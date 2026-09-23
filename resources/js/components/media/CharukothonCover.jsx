/**
 * Authentic Charukothon brand cover.
 *
 * Replaces the old generic "CASE STUDY / Bangladeshi Cloth Company / Learn
 * More" composite with the real brand's world: the brand's mint shade theme
 * melting into deep plum from the jam-purple saree, minimal fashion-house
 * typography (monogram, name, motto), and the actual saree photography.
 *
 * The source file still contains the baked generic panel on its left half, so
 * the photography is shown cropped to its right side only and the left is an
 * opaque brand panel — the old text can never peek through.
 *
 * Sizing/positioning contract: fills its relatively-positioned parent
 * (`absolute inset-0`), so card size, carousel slot and interaction stay
 * exactly as before. Type scales in `cqw`, which needs the parent (or an
 * ancestor) to carry `container-type: inline-size` — every usage below does.
 */
export const CHARUKOTHON_SLUG = 'charukothon-meta-ads';

/** @param {string|undefined} slug */
export function isCharukothon(slug) {
    return slug === CHARUKOTHON_SLUG;
}

const BLOCK_PRINT_TILE =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cg fill='none' stroke='%238DEBC6' stroke-opacity='0.32'%3E%3Cpath d='M28 30l5.5 7.5L28 45l-5.5-7.5z'/%3E%3Ccircle cx='28' cy='37.5' r='1.4' fill='%238DEBC6' fill-opacity='0.5' stroke='none'/%3E%3C/g%3E%3Cg fill='%238DEBC6' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='10' r='1.2'/%3E%3Ccircle cx='47' cy='12' r='1'/%3E%3Ccircle cx='12' cy='48' r='1'/%3E%3Ccircle cx='48' cy='46' r='1.2'/%3E%3C/g%3E%3C/svg%3E\")";

/**
 * @param {{ image: string }} props
 */
export default function CharukothonCover({ image }) {
    return (
        <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#2A0E28]">
            {/* Saree photography — right side of the source file only. */}
            <div
                className="absolute inset-y-0 right-0 w-[64%]"
                style={{
                    backgroundImage: `url("${image}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: '72% 50%',
                }}
            />
            {/* Cinematic blend so photo melts into the brand panel. */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(90deg, rgba(42,14,40,0) 36%, rgba(42,14,40,0.6) 52%, rgba(42,14,40,0) 72%), linear-gradient(180deg, rgba(42,14,40,0.28) 0%, transparent 30%, transparent 60%, rgba(20,6,19,0.6) 100%)',
                }}
            />

            {/* Brand panel — opaque, always covering the baked generic text. */}
            <div
                className="absolute inset-y-0 left-0 flex w-[57%] flex-col justify-center"
                style={{
                    background: 'linear-gradient(135deg, #331239 0%, #3B2A4D 38%, #17453D 100%)',
                    padding: '7% 7% 7% 7%',
                }}
            >
                <div className="absolute inset-0" style={{ backgroundImage: BLOCK_PRINT_TILE, opacity: 0.5 }} />
                <div
                    className="absolute inset-0"
                    style={{ background: 'radial-gradient(90% 60% at 15% 0%, rgba(141,235,198,0.18), transparent 60%)' }}
                />

                <div className="relative">
                    <span
                        className="flex items-center justify-center rounded-full border border-[#8DEBC6]/70 text-[#D9F7E8]"
                        style={{ width: '11cqw', height: '11cqw', fontSize: '5.5cqw', fontFamily: "'Tiro Bangla', Georgia, serif" }}
                    >
                        চ
                    </span>
                    <p
                        className="text-[#F9F1E3]"
                        style={{
                            marginTop: '4cqw',
                            fontSize: '9cqw',
                            lineHeight: 1.02,
                            letterSpacing: '0.01em',
                            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
                            fontWeight: 700,
                        }}
                    >
                        Charu
                        <span style={{ fontStyle: 'italic', fontWeight: 400 }}>kothon</span>
                    </p>
                    <span className="block bg-gradient-to-r from-[#8DEBC6] to-[#8DEBC6]/10" style={{ marginTop: '3.4cqw', height: '0.55cqw', width: '22%' }} />
                    <p
                        className="text-[#F9F1E3]/85"
                        style={{
                            marginTop: '2.8cqw',
                            fontSize: '3.5cqw',
                            fontStyle: 'italic',
                            fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                    >
                        Style with art &amp; elegance
                    </p>
                </div>
            </div>

            {/* Mint divider with a small medallion where panel meets photo. */}
            <div className="absolute inset-y-0" style={{ left: '57%' }}>
                <span className="absolute inset-y-0 block w-px bg-gradient-to-b from-[#8DEBC6]/0 via-[#8DEBC6]/80 to-[#8DEBC6]/0" />
                <span
                    className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#8DEBC6] bg-[#123B34] text-[#D9F7E8]"
                    style={{ width: '6.5cqw', height: '6.5cqw', minWidth: 22, minHeight: 22, fontSize: '3cqw' }}
                >
                    ✦
                </span>
            </div>
        </div>
    );
}
