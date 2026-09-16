const PURPLE = '#891FFB';
const BLUE = '#507AF4';
const CYAN = '#1BE2EB';

/**
 * Every face is drawn on the same 320x400 stage so the deck's layers are
 * interchangeable, and every face is built from the same three ingredients:
 * a neutral ground and structure taken from the theme tokens, and the brand
 * trio used only for the one element that carries the idea.
 *
 * No `<defs>`, gradients or ids anywhere: both decks mount every face at once,
 * and duplicated ids in a document are how SVG symbols start rendering each
 * other's fills.
 */
const VIEW_BOX = '0 0 320 400';

/** Shared structural colours, resolved from the active theme. */
const LINE = 'var(--line)';
const STRUCT = 'var(--ink-faint)';

/**
 * The plate every face sits on, plus the faint construction grid that ties the
 * two decks together visually.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
function Plate({ children }) {
    return (
        <svg viewBox={VIEW_BOX} className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="presentation">
            <rect x="0" y="0" width="320" height="400" fill="var(--surface-2)" />
            <g stroke={LINE} strokeWidth="1" opacity="0.7">
                {[80, 160, 240].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="400" />)}
                {[100, 200, 300].map((y) => <line key={y} x1="0" y1={y} x2="320" y2={y} />)}
            </g>
            {children}
        </svg>
    );
}

/* ---------------------------------------------------------------- Branding */

/** Brand Strategy — a position chosen on a field of options. */
function StrategyFace() {
    return (
        <Plate>
            <g fill="none" stroke={STRUCT} strokeWidth="1.5" opacity="0.55">
                <circle cx="160" cy="196" r="112" />
                <circle cx="160" cy="196" r="76" />
                <circle cx="160" cy="196" r="40" />
            </g>
            <circle cx="160" cy="196" r="112" fill="none" stroke={PURPLE} strokeWidth="2" strokeDasharray="6 10" opacity="0.8" />
            <line x1="48" y1="196" x2="272" y2="196" stroke={STRUCT} strokeWidth="1" opacity="0.4" />
            <line x1="160" y1="84" x2="160" y2="308" stroke={STRUCT} strokeWidth="1" opacity="0.4" />
            <line x1="160" y1="196" x2="214" y2="142" stroke={CYAN} strokeWidth="2.5" />
            <circle cx="214" cy="142" r="11" fill={CYAN} />
            <circle cx="214" cy="142" r="21" fill="none" stroke={CYAN} strokeWidth="1.5" opacity="0.5" />
        </Plate>
    );
}

/** Brand Identity — a mark drawn on its own construction. */
function IdentityFace() {
    return (
        <Plate>
            <g stroke={STRUCT} strokeWidth="1" opacity="0.45">
                <rect x="72" y="108" width="176" height="176" fill="none" />
                <line x1="72" y1="196" x2="248" y2="196" />
                <line x1="160" y1="108" x2="160" y2="284" />
                <line x1="72" y1="108" x2="248" y2="284" />
                <line x1="248" y1="108" x2="72" y2="284" />
            </g>
            <g>
                <rect x="104" y="196" width="26" height="60" rx="5" fill={PURPLE} />
                <rect x="146" y="164" width="26" height="92" rx="5" fill={BLUE} />
                <rect x="188" y="132" width="26" height="124" rx="5" fill={CYAN} />
            </g>
            <g stroke={CYAN} strokeWidth="2" opacity="0.9">
                <path d="M72 128V108h20" fill="none" />
                <path d="M248 264v20h-20" fill="none" />
            </g>
        </Plate>
    );
}

/** Rebranding — the old mark handed over to the new one. */
function RebrandFace() {
    return (
        <Plate>
            <g opacity="0.35">
                <rect x="40" y="150" width="92" height="92" rx="16" fill="none" stroke={STRUCT} strokeWidth="2" />
                <rect x="70" y="180" width="32" height="32" fill={STRUCT} />
            </g>
            <path d="M148 196h30m0 0-9-9m9 9-9 9" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="190" y="150" width="92" height="92" rx="24" fill="none" stroke={PURPLE} strokeWidth="2.5" />
            <circle cx="236" cy="196" r="17" fill={PURPLE} />
            <path d="M236 179a17 17 0 0 1 0 34z" fill={CYAN} />
            <g stroke={STRUCT} strokeWidth="1" opacity="0.5">
                <line x1="40" y1="272" x2="132" y2="272" />
                <line x1="190" y1="272" x2="282" y2="272" />
            </g>
        </Plate>
    );
}

/** Packaging — the mark carried onto a physical object. */
function PackagingFace() {
    return (
        <Plate>
            <g>
                <path d="M160 108l86 44v104l-86 44-86-44V152z" fill="var(--surface)" stroke={STRUCT} strokeWidth="1.5" />
                <path d="M160 108l86 44-86 44-86-44z" fill={STRUCT} opacity="0.14" />
                <path d="M160 196v104l86-44V152z" fill={PURPLE} opacity="0.16" />
                <path d="M160 196v104l-86-44V152z" fill={BLUE} opacity="0.12" />
            </g>
            <path d="M160 196v104" stroke={STRUCT} strokeWidth="1.2" opacity="0.6" />
            <rect x="176" y="206" width="54" height="10" rx="5" fill={CYAN} />
            <rect x="176" y="224" width="34" height="6" rx="3" fill={STRUCT} opacity="0.6" />
        </Plate>
    );
}

/** Motion Branding — the mark given timing. */
function MotionFace() {
    return (
        <Plate>
            <path d="M52 288C112 288 148 128 268 128" fill="none" stroke={STRUCT} strokeWidth="1.5" opacity="0.45" />
            <path d="M52 288C112 288 148 128 268 128" fill="none" stroke={BLUE} strokeWidth="2.5" strokeDasharray="150 400" />
            <g opacity="0.55">
                <circle cx="96" cy="272" r="16" fill="none" stroke={PURPLE} strokeWidth="1.5" />
                <circle cx="136" cy="238" r="16" fill="none" stroke={PURPLE} strokeWidth="1.5" opacity="0.7" />
                <circle cx="176" cy="192" r="16" fill="none" stroke={PURPLE} strokeWidth="1.5" opacity="0.4" />
            </g>
            <circle cx="52" cy="288" r="7" fill={PURPLE} />
            <circle cx="268" cy="128" r="10" fill={CYAN} />
            <g stroke={STRUCT} strokeWidth="1" opacity="0.4">
                {[52, 124, 196, 268].map((x) => <line key={x} x1={x} y1="316" x2={x} y2="330" />)}
                <line x1="52" y1="323" x2="268" y2="323" />
            </g>
        </Plate>
    );
}

/** Brand Guidelines — the system written down. */
function GuidelinesFace() {
    return (
        <Plate>
            <rect x="56" y="92" width="208" height="216" rx="10" fill="var(--surface)" stroke={STRUCT} strokeWidth="1.5" opacity="0.9" />
            <g>
                <rect x="78" y="116" width="52" height="52" rx="8" fill={PURPLE} />
                <rect x="138" y="116" width="52" height="52" rx="8" fill={BLUE} />
                <rect x="198" y="116" width="44" height="52" rx="8" fill={CYAN} />
            </g>
            <g fill={STRUCT}>
                <rect x="78" y="192" width="164" height="12" rx="3" opacity="0.75" />
                <rect x="78" y="216" width="122" height="9" rx="3" opacity="0.55" />
                <rect x="78" y="236" width="140" height="6" rx="3" opacity="0.4" />
                <rect x="78" y="252" width="96" height="6" rx="3" opacity="0.4" />
            </g>
            <path d="M78 276h20m-20 0v12m0-12v-12" fill="none" stroke={CYAN} strokeWidth="2" />
            <path d="M242 276h-20m20 0v12m0-12v-12" fill="none" stroke={CYAN} strokeWidth="2" />
        </Plate>
    );
}

/* ------------------------------------------------------------------- UI/UX */

/** Website UI/UX — a page composed in the browser. */
function WebsiteFace() {
    return (
        <Plate>
            <rect x="40" y="96" width="240" height="208" rx="12" fill="var(--surface)" stroke={STRUCT} strokeWidth="1.5" />
            <path d="M40 130h240" stroke={STRUCT} strokeWidth="1.5" opacity="0.7" />
            <g>
                <circle cx="60" cy="113" r="4" fill={PURPLE} />
                <circle cx="74" cy="113" r="4" fill={BLUE} />
                <circle cx="88" cy="113" r="4" fill={CYAN} />
                <rect x="108" y="108" width="150" height="10" rx="5" fill={STRUCT} opacity="0.25" />
            </g>
            <rect x="60" y="148" width="130" height="16" rx="4" fill={STRUCT} opacity="0.75" />
            <rect x="60" y="172" width="94" height="8" rx="4" fill={STRUCT} opacity="0.45" />
            <rect x="60" y="192" width="64" height="20" rx="10" fill={BLUE} />
            <g>
                <rect x="60" y="230" width="66" height="54" rx="8" fill={STRUCT} opacity="0.16" />
                <rect x="136" y="230" width="66" height="54" rx="8" fill={STRUCT} opacity="0.16" />
                <rect x="212" y="230" width="48" height="54" rx="8" fill={CYAN} opacity="0.22" />
            </g>
        </Plate>
    );
}

/** Mobile App UI/UX — the same system at thumb scale. */
function MobileFace() {
    return (
        <Plate>
            <rect x="104" y="72" width="112" height="256" rx="22" fill="var(--surface)" stroke={STRUCT} strokeWidth="1.5" />
            <rect x="142" y="84" width="36" height="6" rx="3" fill={STRUCT} opacity="0.4" />
            <rect x="120" y="106" width="80" height="44" rx="8" fill={PURPLE} opacity="0.22" />
            <g fill={STRUCT}>
                <rect x="120" y="164" width="80" height="8" rx="4" opacity="0.6" />
                <rect x="120" y="180" width="56" height="6" rx="3" opacity="0.4" />
                <rect x="120" y="200" width="80" height="34" rx="8" opacity="0.14" />
                <rect x="120" y="242" width="80" height="34" rx="8" opacity="0.14" />
            </g>
            <path d="M104 294h112" stroke={STRUCT} strokeWidth="1.2" opacity="0.6" />
            <g>
                <rect x="122" y="304" width="16" height="10" rx="3" fill={CYAN} />
                <rect x="152" y="304" width="16" height="10" rx="3" fill={STRUCT} opacity="0.35" />
                <rect x="182" y="304" width="16" height="10" rx="3" fill={STRUCT} opacity="0.35" />
            </g>
        </Plate>
    );
}

/** SaaS Product Design — dense product surfaces that still read. */
function SaaSFace() {
    return (
        <Plate>
            <rect x="40" y="96" width="240" height="208" rx="12" fill="var(--surface)" stroke={STRUCT} strokeWidth="1.5" />
            <path d="M96 96v208" stroke={STRUCT} strokeWidth="1.2" opacity="0.6" />
            <g fill={STRUCT} opacity="0.35">
                <rect x="56" y="120" width="24" height="6" rx="3" />
                <rect x="56" y="140" width="24" height="6" rx="3" />
                <rect x="56" y="160" width="24" height="6" rx="3" />
            </g>
            <rect x="56" y="120" width="24" height="6" rx="3" fill={PURPLE} />
            <rect x="116" y="118" width="64" height="10" rx="5" fill={STRUCT} opacity="0.6" />
            <g>
                <rect x="116" y="146" width="66" height="40" rx="8" fill={BLUE} opacity="0.2" />
                <rect x="192" y="146" width="66" height="40" rx="8" fill={CYAN} opacity="0.2" />
            </g>
            <g>
                <rect x="116" y="252" width="18" height="32" rx="4" fill={PURPLE} />
                <rect x="144" y="232" width="18" height="52" rx="4" fill={BLUE} />
                <rect x="172" y="212" width="18" height="72" rx="4" fill={CYAN} />
                <rect x="200" y="242" width="18" height="42" rx="4" fill={STRUCT} opacity="0.3" />
                <rect x="228" y="222" width="18" height="62" rx="4" fill={STRUCT} opacity="0.3" />
            </g>
            <path d="M116 284h142" stroke={STRUCT} strokeWidth="1.2" opacity="0.5" />
        </Plate>
    );
}

/** UX Research & Strategy — the path a real person takes. */
function ResearchFace() {
    return (
        <Plate>
            <path d="M56 244c40 0 32-84 72-84s32 60 72 60 24-72 64-72" fill="none" stroke={STRUCT} strokeWidth="1.5" opacity="0.45" />
            <path d="M56 244c40 0 32-84 72-84s32 60 72 60" fill="none" stroke={BLUE} strokeWidth="2.5" />
            <g>
                <circle cx="56" cy="244" r="8" fill={PURPLE} />
                <circle cx="128" cy="160" r="8" fill={BLUE} />
                <circle cx="200" cy="220" r="8" fill={CYAN} />
                <circle cx="264" cy="148" r="8" fill="none" stroke={STRUCT} strokeWidth="2" opacity="0.6" />
            </g>
            <g fill={STRUCT} opacity="0.4">
                <rect x="40" y="276" width="44" height="6" rx="3" />
                <rect x="108" y="276" width="44" height="6" rx="3" />
                <rect x="180" y="276" width="44" height="6" rx="3" />
                <rect x="244" y="276" width="36" height="6" rx="3" />
            </g>
            <g stroke={STRUCT} strokeWidth="1" opacity="0.35">
                <line x1="40" y1="300" x2="280" y2="300" />
            </g>
        </Plate>
    );
}

/** Wireframing & Prototyping — structure before surface, wired together. */
function WireframeFace() {
    return (
        <Plate>
            <g stroke={STRUCT} strokeWidth="1.5" fill="none">
                <rect x="40" y="128" width="104" height="128" rx="8" />
                <rect x="176" y="128" width="104" height="128" rx="8" />
            </g>
            <g fill={STRUCT} opacity="0.28">
                <rect x="54" y="144" width="76" height="30" rx="4" />
                <rect x="54" y="182" width="50" height="7" rx="3" />
                <rect x="54" y="196" width="66" height="7" rx="3" />
                <rect x="54" y="216" width="32" height="14" rx="7" />
                <rect x="190" y="144" width="76" height="16" rx="4" />
                <rect x="190" y="168" width="36" height="36" rx="4" />
                <rect x="234" y="168" width="32" height="36" rx="4" />
                <rect x="190" y="212" width="76" height="8" rx="4" />
            </g>
            <path d="M144 192h32m0 0-10-9m10 9-10 9" fill="none" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="144" cy="192" r="5" fill={CYAN} />
            <g stroke={PURPLE} strokeWidth="1.5" opacity="0.7" strokeDasharray="4 6">
                <path d="M92 256v28h136v-28" fill="none" />
            </g>
        </Plate>
    );
}

/** Design System — the parts, once, in one place. */
function SystemFace() {
    return (
        <Plate>
            <g>
                <rect x="52" y="120" width="52" height="52" rx="10" fill={PURPLE} />
                <rect x="114" y="120" width="52" height="52" rx="10" fill={BLUE} />
                <rect x="176" y="120" width="52" height="52" rx="10" fill={CYAN} />
                <rect x="238" y="120" width="30" height="52" rx="10" fill={STRUCT} opacity="0.25" />
            </g>
            <rect x="52" y="192" width="86" height="28" rx="14" fill={BLUE} />
            <rect x="150" y="192" width="86" height="28" rx="14" fill="none" stroke={STRUCT} strokeWidth="1.5" />
            <g>
                <rect x="52" y="238" width="48" height="24" rx="12" fill={STRUCT} opacity="0.2" />
                <circle cx="88" cy="250" r="9" fill={CYAN} />
            </g>
            <g fill={STRUCT} opacity="0.45">
                <rect x="120" y="242" width="60" height="7" rx="3" />
                <rect x="120" y="256" width="42" height="7" rx="3" />
            </g>
            <g fill="none" stroke={STRUCT} strokeWidth="1.5" opacity="0.5">
                <path d="M196 238h-16v16" />
                <path d="M240 238h16v16" />
                <path d="M196 282h-16v-16" />
                <path d="M240 282h16v-16" />
            </g>
        </Plate>
    );
}

/**
 * The two visual systems, each one a distinct vocabulary: Branding works in
 * marks, construction and physical objects; UI/UX works in frames, components
 * and flows. Faces are matched to sub-services by slug, with the array order
 * as the fallback so a new sub-service still gets a face.
 *
 * @type {Record<string, { bySlug: Record<string, () => import('react').ReactElement>, order: Array<() => import('react').ReactElement> }>}
 */
export const DECKS = {
    branding: {
        bySlug: {
            'brand-strategy': StrategyFace,
            'brand-identity-design': IdentityFace,
            rebranding: RebrandFace,
            'packaging-design': PackagingFace,
            'motion-branding': MotionFace,
            'brand-guidelines': GuidelinesFace,
        },
        order: [StrategyFace, IdentityFace, RebrandFace, PackagingFace, MotionFace, GuidelinesFace],
    },
    'ui-ux': {
        bySlug: {
            'website-ui-ux-design': WebsiteFace,
            'mobile-app-ui-ux': MobileFace,
            'saas-product-design': SaaSFace,
            'ux-research-strategy': ResearchFace,
            'wireframing-prototyping': WireframeFace,
            'design-system': SystemFace,
        },
        order: [WebsiteFace, MobileFace, SaaSFace, ResearchFace, WireframeFace, SystemFace],
    },
};

/**
 * Resolves the face for one sub-service.
 *
 * @param {string} categorySlug
 * @param {string} itemSlug
 * @param {number} index
 * @return {() => import('react').ReactElement}
 */
export function faceFor(categorySlug, itemSlug, index) {
    const deck = DECKS[categorySlug] ?? DECKS.branding;

    return deck.bySlug[itemSlug] ?? deck.order[index % deck.order.length];
}
