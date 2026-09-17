const PURPLE = '#891FFB';
const BLUE = '#507AF4';
const CYAN = '#1BE2EB';

/**
 * Every mockup is drawn on the same 320x400 stage so the showcase rail can
 * treat them as interchangeable screens, and every one reads as a real piece
 * of work — a deck slide, a packaging render, a dashboard — rather than a
 * logo-style pictogram.
 *
 * Structure and copy come from the theme tokens, so the same drawing is a
 * light document in the light theme and a dark glass panel in the dark one.
 * The brand trio is reserved for highlights: the one element per screen that
 * carries the idea.
 *
 * No `<defs>`, gradients or ids anywhere: both rails mount every mockup at
 * once, several times over, and duplicated ids in a document are how SVG
 * symbols start rendering each other's fills.
 */
const VIEW_BOX = '0 0 320 400';

const LINE = 'var(--line)';
const STRUCT = 'var(--ink-faint)';
const PANEL = 'var(--surface-2)';
const CHIP = 'var(--chip)';

/**
 * @param {{ children: import('react').ReactNode }} props
 */
function Stage({ children }) {
    return (
        <svg viewBox={VIEW_BOX} className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="presentation">
            {children}
        </svg>
    );
}

/**
 * A soft content bar — the stand-in for one line of real copy.
 *
 * @param {{ x: number, y: number, w: number, h?: number, o?: number, fill?: string, r?: number }} props
 */
function Bar({ x, y, w, h = 8, o = 0.34, fill = STRUCT, r }) {
    return <rect x={x} y={y} width={w} height={h} rx={r ?? h / 2} fill={fill} opacity={o} />;
}

/**
 * The paper a document-style mockup is printed on.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
function Sheet({ children }) {
    return (
        <>
            <rect x="20" y="22" width="280" height="356" rx="18" fill={PANEL} stroke={LINE} />
            {children}
        </>
    );
}

/* ---------------------------------------------------------------- Branding */

/** Brand Strategy — a positioning slide with the chosen territory marked. */
function StrategyDeckMockup() {
    return (
        <Stage>
            <Sheet>
                <Bar x={44} y={50} w={58} h={7} fill={PURPLE} o={0.95} />
                <Bar x={44} y={68} w={168} h={12} o={0.5} />
                <Bar x={44} y={86} w={116} h={12} o={0.28} />

                <rect x="44" y="120" width="232" height="176" rx="12" fill="none" stroke={LINE} />
                <line x1="160" y1="120" x2="160" y2="296" stroke={STRUCT} strokeWidth="1" opacity="0.28" />
                <line x1="44" y1="208" x2="276" y2="208" stroke={STRUCT} strokeWidth="1" opacity="0.28" />
                <g fill={STRUCT} opacity="0.3">
                    <circle cx="92" cy="170" r="7" />
                    <circle cx="124" cy="252" r="7" />
                    <circle cx="206" cy="264" r="7" />
                    <circle cx="246" cy="190" r="7" />
                </g>
                <circle cx="212" cy="156" r="26" fill="none" stroke={CYAN} strokeWidth="1.5" opacity="0.55" />
                <circle cx="212" cy="156" r="10" fill={CYAN} />

                <Bar x={44} y={322} w={70} h={9} fill={PURPLE} o={0.85} />
                <Bar x={124} y={322} w={52} h={9} o={0.24} />
                <Bar x={186} y={322} w={52} h={9} o={0.24} />
                <Bar x={44} y={344} w={200} h={7} o={0.2} />
            </Sheet>
        </Stage>
    );
}

/** Brand Identity Design — an identity board: mark, specimen, palette. */
function IdentityBoardMockup() {
    return (
        <Stage>
            <Sheet>
                <rect x="44" y="46" width="118" height="118" rx="22" fill={PURPLE} />
                <path
                    d="M76 126V84l27 30 27-30v42"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                />

                <rect x="174" y="46" width="102" height="118" rx="14" fill={CHIP} stroke={LINE} />
                <text
                    x="225"
                    y="122"
                    textAnchor="middle"
                    fontSize="60"
                    fontWeight="800"
                    fill="var(--ink-strong)"
                    opacity="0.9"
                    fontFamily="Georgia, 'Times New Roman', serif"
                >
                    Aa
                </text>

                <Bar x={44} y={186} w={78} h={8} o={0.45} />
                <Bar x={44} y={204} w={232} h={7} o={0.2} />
                <Bar x={44} y={218} w={196} h={7} o={0.2} />
                <Bar x={44} y={232} w={214} h={7} o={0.2} />

                <rect x="44" y="262" width="52" height="52" rx="12" fill={PURPLE} />
                <rect x="104" y="262" width="52" height="52" rx="12" fill={BLUE} />
                <rect x="164" y="262" width="52" height="52" rx="12" fill={CYAN} />
                <rect x="224" y="262" width="52" height="52" rx="12" fill={STRUCT} opacity="0.3" />

                <Bar x={44} y={330} w={52} h={6} o={0.22} />
                <Bar x={104} y={330} w={52} h={6} o={0.22} />
                <Bar x={164} y={330} w={52} h={6} o={0.22} />
                <Bar x={224} y={330} w={52} h={6} o={0.22} />
            </Sheet>
        </Stage>
    );
}

/** Rebranding — the retired mark handed over to the new one. */
function RebrandMockup() {
    return (
        <Stage>
            <Sheet>
                <Bar x={44} y={50} w={44} h={7} fill={CYAN} o={0.9} />

                <g opacity="0.4">
                    <rect x="44" y="82" width="104" height="104" rx="18" fill={CHIP} stroke={LINE} />
                    <circle cx="96" cy="134" r="28" fill="none" stroke={STRUCT} strokeWidth="6" />
                    <line x1="58" y1="182" x2="134" y2="90" stroke={STRUCT} strokeWidth="2" />
                </g>
                <rect x="172" y="82" width="104" height="104" rx="18" fill={CHIP} stroke={CYAN} strokeOpacity="0.5" />
                <path
                    d="M200 162V106l24 28 24-28v56"
                    fill="none"
                    stroke={CYAN}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path d="M148 134h24" stroke={STRUCT} strokeWidth="2" opacity="0.5" />
                <path d="M166 128l6 6-6 6" fill="none" stroke={STRUCT} strokeWidth="2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />

                <rect x="44" y="210" width="232" height="1" fill={LINE} />
                <Bar x={44} y={228} w={60} h={7} o={0.45} />
                <Bar x={44} y={246} w={152} h={6} o={0.2} />
                <Bar x={44} y={260} w={120} h={6} o={0.2} />

                <rect x="44" y="288" width="232" height="8" rx="4" fill={STRUCT} opacity="0.16" />
                <rect x="44" y="288" width="158" height="8" rx="4" fill={CYAN} />

                <g fill={STRUCT} opacity="0.22">
                    <rect x="44" y="314" width="104" height="44" rx="10" />
                    <rect x="160" y="314" width="116" height="44" rx="10" />
                </g>
            </Sheet>
        </Stage>
    );
}

/** Packaging Design — a carton render with its label system. */
function PackagingMockup() {
    return (
        <Stage>
            <Sheet>
                <ellipse cx="160" cy="316" rx="108" ry="18" fill={STRUCT} opacity="0.16" />

                <path d="M108 118l52-26 52 26v144l-52 26-52-26z" fill={CHIP} stroke={LINE} />
                <path d="M108 118l52 26 52-26-52-26z" fill={STRUCT} opacity="0.14" />
                <path d="M160 144v144" stroke={LINE} />
                <path d="M108 118v144l52 26V144z" fill={PURPLE} opacity="0.16" />

                <path d="M108 176l52 26v30l-52-26z" fill={PURPLE} />
                <path d="M212 176l-52 26v30l52-26z" fill={BLUE} opacity="0.85" />
                <g opacity="0.55" stroke="var(--ink-strong)" strokeWidth="3" strokeLinecap="round">
                    <path d="M120 218l30 15" />
                    <path d="M120 232l22 11" />
                </g>

                <path d="M232 196c14 0 22 10 22 24v60c0 10-8 16-22 16s-22-6-22-16v-60c0-14 8-24 22-24z" fill={CHIP} stroke={LINE} />
                <rect x="214" y="232" width="36" height="22" rx="6" fill={CYAN} opacity="0.85" />

                <rect x="48" y="196" width="34" height="34" rx="8" fill="none" stroke={LINE} />
                <rect x="48" y="240" width="34" height="34" rx="8" fill="none" stroke={LINE} />
                <path d="M54 210h22M54 218h14" stroke={STRUCT} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
                <circle cx="65" cy="257" r="9" fill="none" stroke={CYAN} strokeWidth="2" />

                <Bar x={48} y={334} w={92} h={8} o={0.4} />
                <Bar x={152} y={334} w={120} h={8} o={0.18} />
            </Sheet>
        </Stage>
    );
}

/** Motion Branding — a render frame over its keyframe timeline. */
function MotionMockup() {
    return (
        <Stage>
            <Sheet>
                <rect x="44" y="48" width="232" height="146" rx="12" fill="var(--bg)" stroke={LINE} />
                <g opacity="0.75">
                    <circle cx="160" cy="121" r="44" fill="none" stroke={BLUE} strokeWidth="2" strokeDasharray="5 9" />
                    <circle cx="160" cy="121" r="26" fill={BLUE} opacity="0.2" />
                    <path d="M152 108l24 13-24 13z" fill={CYAN} />
                </g>
                <g stroke={PURPLE} strokeWidth="2" fill="none" opacity="0.6">
                    <path d="M76 158c26-26 58-38 84-38" />
                    <path d="M92 172c22-20 48-30 68-30" />
                </g>

                <Bar x={44} y={212} w={66} h={7} fill={PURPLE} o={0.9} />
                <Bar x={120} y={212} w={44} h={7} o={0.2} />

                <rect x="44" y="238" width="232" height="86" rx="10" fill={CHIP} stroke={LINE} />
                {[258, 282, 306].map((y, row) => (
                    <g key={y}>
                        <Bar x={56} y={y - 4} w={30} h={8} o={0.2} />
                        <rect x="96" y={y - 3} width="168" height="6" rx="3" fill={STRUCT} opacity="0.12" />
                        <rect
                            x={96 + row * 18}
                            y={y - 3}
                            width={110 - row * 22}
                            height="6"
                            rx="3"
                            fill={row === 1 ? CYAN : BLUE}
                            opacity={row === 1 ? 0.9 : 0.45}
                        />
                    </g>
                ))}
                <line x1="186" y1="242" x2="186" y2="320" stroke={CYAN} strokeWidth="1.5" />
                <circle cx="186" cy="242" r="4" fill={CYAN} />

                <Bar x={44} y={344} w={126} h={7} o={0.2} />
            </Sheet>
        </Stage>
    );
}

/** Brand Guidelines — an open spread: the rule and its do / don't. */
function GuidelinesMockup() {
    return (
        <Stage>
            <Sheet>
                <line x1="160" y1="46" x2="160" y2="354" stroke={LINE} />

                <Bar x={40} y={62} w={40} h={6} fill={PURPLE} o={0.9} />
                <Bar x={40} y={80} w={92} h={11} o={0.45} />
                <Bar x={40} y={106} w={104} h={6} o={0.2} />
                <Bar x={40} y={120} w={88} h={6} o={0.2} />
                <Bar x={40} y={134} w={98} h={6} o={0.2} />
                <rect x="40" y="158" width="104" height="72" rx="10" fill={CHIP} stroke={LINE} />
                <circle cx="70" cy="194" r="16" fill={PURPLE} opacity="0.85" />
                <Bar x={94} y={186} w={38} h={6} o={0.3} />
                <Bar x={94} y={200} w={26} h={6} o={0.2} />
                <Bar x={40} y={248} w={104} h={6} o={0.18} />
                <Bar x={40} y={262} w={78} h={6} o={0.18} />
                <Bar x={40} y={290} w={104} h={6} o={0.18} />
                <Bar x={40} y={304} w={62} h={6} o={0.18} />

                <rect x="176" y="62" width="104" height="104" rx="12" fill={CHIP} stroke={CYAN} strokeOpacity="0.45" />
                <circle cx="228" cy="108" r="24" fill={BLUE} opacity="0.85" />
                <circle cx="266" cy="76" r="11" fill={CYAN} />
                <path d="M261 76l4 4 7-8" stroke="var(--bg)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                <rect x="176" y="182" width="104" height="104" rx="12" fill={CHIP} stroke={LINE} />
                <circle cx="228" cy="230" r="24" fill={STRUCT} opacity="0.28" />
                <path d="M206 254l44-48" stroke={STRUCT} strokeWidth="3" opacity="0.4" strokeLinecap="round" />
                <circle cx="266" cy="196" r="11" fill={STRUCT} opacity="0.35" />
                <path d="M262 192l8 8M270 192l-8 8" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" />

                <Bar x={176} y={304} w={104} h={6} o={0.18} />
                <Bar x={176} y={318} w={72} h={6} o={0.18} />
            </Sheet>
        </Stage>
    );
}

/* ------------------------------------------------------------------ UI/UX */

/** Website UI/UX Design — a browser window on a marketing layout. */
function WebsiteMockup() {
    return (
        <Stage>
            <Sheet>
                <path d="M20 40a18 18 0 0 1 18-18h244a18 18 0 0 1 18 18v16H20z" fill={CHIP} />
                <line x1="20" y1="56" x2="300" y2="56" stroke={LINE} />
                <g fill={STRUCT} opacity="0.3">
                    <circle cx="42" cy="39" r="4.5" />
                    <circle cx="58" cy="39" r="4.5" />
                    <circle cx="74" cy="39" r="4.5" />
                </g>
                <rect x="96" y="31" width="150" height="16" rx="8" fill={STRUCT} opacity="0.12" />

                <rect x="40" y="74" width="24" height="10" rx="5" fill={PURPLE} />
                <Bar x={76} y={75} w={30} h={8} o={0.22} />
                <Bar x={116} y={75} w={30} h={8} o={0.22} />
                <Bar x={156} y={75} w={30} h={8} o={0.22} />
                <rect x="232" y="70" width="48" height="18" rx="9" fill={BLUE} />

                <Bar x={40} y={112} w={196} h={16} o={0.5} />
                <Bar x={40} y={138} w={150} h={16} o={0.5} />
                <Bar x={40} y={170} w={212} h={7} o={0.2} />
                <Bar x={40} y={184} w={176} h={7} o={0.2} />
                <rect x="40" y="206" width="84" height="26" rx="13" fill={CYAN} />
                <rect x="134" y="206" width="76" height="26" rx="13" fill="none" stroke={LINE} />

                <rect x="40" y="256" width="72" height="92" rx="12" fill={CHIP} stroke={LINE} />
                <rect x="124" y="256" width="72" height="92" rx="12" fill={CHIP} stroke={LINE} />
                <rect x="208" y="256" width="72" height="92" rx="12" fill={CHIP} stroke={LINE} />
                <rect x="52" y="268" width="26" height="26" rx="8" fill={PURPLE} opacity="0.85" />
                <rect x="136" y="268" width="26" height="26" rx="8" fill={BLUE} opacity="0.85" />
                <rect x="220" y="268" width="26" height="26" rx="8" fill={CYAN} opacity="0.85" />
                {[40, 124, 208].map((x) => (
                    <g key={x}>
                        <Bar x={x + 12} y={306} w={48} h={6} o={0.28} />
                        <Bar x={x + 12} y={320} w={36} h={6} o={0.18} />
                    </g>
                ))}
            </Sheet>
        </Stage>
    );
}

/** Mobile App UI/UX — a handset screen with its live tab bar. */
function MobileMockup() {
    return (
        <Stage>
            <Sheet>
                <rect x="86" y="44" width="148" height="312" rx="28" fill="var(--bg)" stroke={LINE} />
                <rect x="136" y="54" width="48" height="8" rx="4" fill={STRUCT} opacity="0.3" />

                <circle cx="110" cy="92" r="11" fill={STRUCT} opacity="0.22" />
                <Bar x={128} y={82} w={46} h={7} o={0.35} />
                <Bar x={128} y={95} w={30} h={6} o={0.18} />
                <circle cx="212" cy="92" r="9" fill={PURPLE} opacity="0.85" />

                <rect x="100" y="118" width="120" height="66" rx="14" fill={BLUE} />
                <Bar x={112} y={132} w={38} h={6} fill="#ffffff" o={0.6} />
                <Bar x={112} y={148} w={68} h={12} fill="#ffffff" o={0.95} />
                <circle cx="200" cy="166" r="9" fill={CYAN} />

                {[196, 234, 272].map((y, row) => (
                    <g key={y}>
                        <rect x="100" y={y} width="120" height="30" rx="10" fill={CHIP} stroke={LINE} />
                        <circle cx="116" cy={y + 15} r="8" fill={row === 0 ? CYAN : STRUCT} opacity={row === 0 ? 0.9 : 0.22} />
                        <Bar x={132} y={y + 8} w={52} h={6} o={0.3} />
                        <Bar x={132} y={y + 19} w={34} h={5} o={0.18} />
                    </g>
                ))}

                <line x1="86" y1="316" x2="234" y2="316" stroke={LINE} />
                <rect x="104" y="328" width="18" height="14" rx="4" fill={PURPLE} />
                <rect x="142" y="328" width="18" height="14" rx="4" fill={STRUCT} opacity="0.22" />
                <rect x="180" y="328" width="18" height="14" rx="4" fill={STRUCT} opacity="0.22" />
                <circle cx="113" cy="350" r="2.5" fill={PURPLE} />
            </Sheet>
        </Stage>
    );
}

/** SaaS Product Design — a data-dense dashboard with its chart. */
function SaaSMockup() {
    return (
        <Stage>
            <Sheet>
                <path d="M20 40a18 18 0 0 1 18-18h44v356H38a18 18 0 0 1-18-18z" fill={CHIP} />
                <line x1="82" y1="22" x2="82" y2="378" stroke={LINE} />
                <rect x="34" y="42" width="20" height="20" rx="7" fill={PURPLE} />
                {[86, 116, 146, 176].map((y, row) => (
                    <rect key={y} x="34" y={y} width="34" height="8" rx="4" fill={row === 0 ? BLUE : STRUCT} opacity={row === 0 ? 0.9 : 0.2} />
                ))}

                <line x1="82" y1="66" x2="300" y2="66" stroke={LINE} />
                <Bar x={100} y={38} w={74} h={10} o={0.45} />
                <rect x="238" y="34" width="46" height="18" rx="9" fill={CYAN} />

                <rect x="100" y="84" width="58" height="52" rx="10" fill={CHIP} stroke={LINE} />
                <rect x="164" y="84" width="58" height="52" rx="10" fill={CHIP} stroke={LINE} />
                <rect x="228" y="84" width="56" height="52" rx="10" fill={CHIP} stroke={LINE} />
                <Bar x={110} y={96} w={26} h={5} o={0.2} />
                <Bar x={174} y={96} w={26} h={5} o={0.2} />
                <Bar x={238} y={96} w={26} h={5} o={0.2} />
                <Bar x={110} y={110} w={34} h={12} fill={PURPLE} o={0.9} />
                <Bar x={174} y={110} w={30} h={12} o={0.4} />
                <Bar x={238} y={110} w={26} h={12} o={0.4} />

                <rect x="100" y="150" width="184" height="120" rx="12" fill={CHIP} stroke={LINE} />
                <g stroke={STRUCT} strokeWidth="1" opacity="0.18">
                    {[178, 206, 234].map((y) => <line key={y} x1="112" y1={y} x2="272" y2={y} />)}
                </g>
                <path d="M112 236l28-22 28 12 30-34 28 16 36-38v52H112z" fill={BLUE} opacity="0.14" />
                <path d="M112 236l28-22 28 12 30-34 28 16 36-38" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="262" cy="170" r="5" fill={CYAN} />

                {[288, 310, 332].map((y) => (
                    <g key={y}>
                        <rect x="100" y={y} width="184" height="1" fill={LINE} />
                        <circle cx="112" cy={y + 12} r="6" fill={STRUCT} opacity="0.2" />
                        <Bar x={128} y={y + 8} w={62} h={6} o={0.22} />
                        <Bar x={200} y={y + 8} w={40} h={6} o={0.14} />
                        <rect x="252" y={y + 6} width="30" height="11" rx="5.5" fill={CYAN} opacity={y === 288 ? 0.8 : 0.22} />
                    </g>
                ))}
            </Sheet>
        </Stage>
    );
}

/** UX Research & Strategy — a synthesis wall over the journey it produced. */
function ResearchMockup() {
    return (
        <Stage>
            <Sheet>
                <Bar x={44} y={48} w={52} h={7} fill={PURPLE} o={0.9} />
                <Bar x={44} y={66} w={140} h={11} o={0.45} />

                {[0, 1, 2, 3].map((col) => (
                    <g key={col}>
                        <rect x={44 + col * 60} y="98" width="52" height="52" rx="6" fill={col === 1 ? CYAN : STRUCT} opacity={col === 1 ? 0.85 : 0.16} />
                        <rect x={44 + col * 60} y="158" width="52" height="52" rx="6" fill={col === 2 ? PURPLE : STRUCT} opacity={col === 2 ? 0.8 : 0.16} />
                        <g fill="var(--ink-strong)" opacity="0.32">
                            <rect x={52 + col * 60} y="112" width="34" height="4" rx="2" />
                            <rect x={52 + col * 60} y="122" width="24" height="4" rx="2" />
                            <rect x={52 + col * 60} y="172" width="34" height="4" rx="2" />
                            <rect x={52 + col * 60} y="182" width="20" height="4" rx="2" />
                        </g>
                    </g>
                ))}

                <line x1="44" y1="240" x2="276" y2="240" stroke={LINE} />
                <path d="M56 300c40-34 76 10 112-22s52-6 52-6" fill="none" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="56" cy="300" r="6" fill={BLUE} />
                <circle cx="112" cy="286" r="6" fill={BLUE} opacity="0.6" />
                <circle cx="168" cy="278" r="6" fill={BLUE} opacity="0.6" />
                <circle cx="220" cy="272" r="7" fill={CYAN} />

                <g opacity="0.2" fill={STRUCT}>
                    <rect x="44" y="322" width="46" height="6" rx="3" />
                    <rect x="102" y="322" width="46" height="6" rx="3" />
                    <rect x="160" y="322" width="46" height="6" rx="3" />
                    <rect x="218" y="322" width="46" height="6" rx="3" />
                </g>
                <Bar x={44} y={344} w={168} h={6} o={0.18} />
            </Sheet>
        </Stage>
    );
}

/** Wireframing & Prototyping — lo-fi frames wired into a flow. */
function WireframeMockup() {
    return (
        <Stage>
            <Sheet>
                <g stroke={LINE} strokeWidth="1" opacity="0.6">
                    {[80, 140, 200, 260].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="378" />)}
                    {[110, 200, 290].map((y) => <line key={y} x1="20" y1={y} x2="300" y2={y} />)}
                </g>

                <rect x="40" y="52" width="104" height="128" rx="10" fill="var(--bg)" stroke={STRUCT} strokeOpacity="0.4" strokeDasharray="5 5" />
                <rect x="52" y="64" width="80" height="34" rx="6" fill={STRUCT} opacity="0.16" />
                <path d="M52 64l80 34M132 64l-80 34" stroke={STRUCT} strokeWidth="1" opacity="0.28" />
                <Bar x={52} y={108} w={68} h={6} o={0.2} />
                <Bar x={52} y={120} w={52} h={6} o={0.2} />
                <rect x="52" y="140" width="44" height="16" rx="8" fill={BLUE} opacity="0.75" />

                <rect x="176" y="52" width="104" height="128" rx="10" fill="var(--bg)" stroke={STRUCT} strokeOpacity="0.4" strokeDasharray="5 5" />
                <Bar x={188} y={66} w={56} h={7} o={0.24} />
                <rect x="188" y="84" width="80" height="12" rx="6" fill={STRUCT} opacity="0.12" />
                <rect x="188" y="102" width="80" height="12" rx="6" fill={STRUCT} opacity="0.12" />
                <rect x="188" y="126" width="80" height="30" rx="8" fill={CYAN} opacity="0.8" />

                <path d="M144 116h32" stroke={PURPLE} strokeWidth="2" strokeDasharray="4 4" />
                <path d="M170 110l7 6-7 6" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                <rect x="40" y="216" width="104" height="128" rx="10" fill="var(--bg)" stroke={STRUCT} strokeOpacity="0.4" strokeDasharray="5 5" />
                <circle cx="92" cy="258" r="18" fill="none" stroke={STRUCT} strokeWidth="2" opacity="0.35" />
                <Bar x={58} y={290} w={68} h={6} o={0.2} />
                <Bar x={58} y={302} w={44} h={6} o={0.2} />
                <rect x="58" y="318" width="68" height="14" rx="7" fill={STRUCT} opacity="0.16" />

                <path d="M92 180v36" stroke={PURPLE} strokeWidth="2" strokeDasharray="4 4" />
                <path d="M86 208l6 8 6-8" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                <rect x="176" y="216" width="104" height="128" rx="10" fill="var(--bg)" stroke={CYAN} strokeOpacity="0.5" />
                <rect x="188" y="232" width="80" height="48" rx="8" fill={CYAN} opacity="0.16" />
                <path d="M214 248l22 12-22 12z" fill={CYAN} />
                <Bar x={188} y={294} w={62} h={6} o={0.22} />
                <Bar x={188} y={308} w={46} h={6} o={0.16} />

                <path d="M144 280h32" stroke={PURPLE} strokeWidth="2" strokeDasharray="4 4" />
                <path d="M170 274l7 6-7 6" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Sheet>
        </Stage>
    );
}

/** Design System — tokens, components and their documentation. */
function DesignSystemMockup() {
    return (
        <Stage>
            <Sheet>
                <Bar x={44} y={48} w={46} h={7} fill={CYAN} o={0.95} />
                <Bar x={44} y={66} w={124} h={11} o={0.45} />

                {[
                    [PURPLE, 1],
                    [BLUE, 1],
                    [CYAN, 1],
                    [STRUCT, 0.3],
                    [STRUCT, 0.18],
                ].map(([fill, o], col) => (
                    <g key={col}>
                        <rect x={44 + col * 48} y="96" width="38" height="38" rx="10" fill={fill} opacity={o} />
                        <rect x={44 + col * 48} y="140" width="38" height="5" rx="2.5" fill={STRUCT} opacity="0.2" />
                    </g>
                ))}

                <line x1="44" y1="164" x2="276" y2="164" stroke={LINE} />

                <rect x="44" y="182" width="82" height="28" rx="14" fill={PURPLE} />
                <rect x="136" y="182" width="82" height="28" rx="14" fill="none" stroke={STRUCT} strokeOpacity="0.4" />
                <rect x="228" y="182" width="48" height="28" rx="14" fill={STRUCT} opacity="0.14" />

                <rect x="44" y="222" width="52" height="26" rx="13" fill={CYAN} opacity="0.3" />
                <circle cx="83" cy="235" r="10" fill={CYAN} />
                <rect x="108" y="222" width="26" height="26" rx="8" fill={BLUE} />
                <path d="M114 235l5 5 9-11" stroke="#ffffff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="146" y="222" width="130" height="26" rx="8" fill={CHIP} stroke={LINE} />
                <Bar x={158} y={232} w={56} h={6} o={0.2} />

                <rect x="44" y="266" width="232" height="82" rx="12" fill={CHIP} stroke={LINE} />
                <Bar x={58} y={280} w={54} h={6} o={0.28} />
                <g fill={STRUCT} opacity="0.16">
                    <rect x="58" y="298" width="14" height="14" rx="3" />
                    <rect x="80" y="298" width="22" height="14" rx="3" />
                    <rect x="110" y="298" width="34" height="14" rx="3" />
                    <rect x="152" y="298" width="52" height="14" rx="3" />
                </g>
                <Bar x={58} y={324} w={150} h={6} o={0.16} />
                <Bar x={58} y={336} w={104} h={6} o={0.16} />
            </Sheet>
        </Stage>
    );
}

/**
 * The two visual systems. Branding works in decks, boards and physical
 * objects; UI/UX works in browsers, devices and product surfaces. Mockups are
 * matched to sub-services by slug, with the array order as the fallback so a
 * new sub-service still gets a screen.
 *
 * @type {Record<string, { bySlug: Record<string, () => import('react').ReactElement>, order: Array<() => import('react').ReactElement> }>}
 */
export const SHOWCASES = {
    branding: {
        bySlug: {
            'brand-strategy': StrategyDeckMockup,
            'brand-identity-design': IdentityBoardMockup,
            rebranding: RebrandMockup,
            'packaging-design': PackagingMockup,
            'motion-branding': MotionMockup,
            'brand-guidelines': GuidelinesMockup,
        },
        order: [StrategyDeckMockup, IdentityBoardMockup, RebrandMockup, PackagingMockup, MotionMockup, GuidelinesMockup],
    },
    'ui-ux': {
        bySlug: {
            'website-ui-ux-design': WebsiteMockup,
            'mobile-app-ui-ux': MobileMockup,
            'saas-product-design': SaaSMockup,
            'ux-research-strategy': ResearchMockup,
            'wireframing-prototyping': WireframeMockup,
            'design-system': DesignSystemMockup,
        },
        order: [WebsiteMockup, MobileMockup, SaaSMockup, ResearchMockup, WireframeMockup, DesignSystemMockup],
    },
};

/**
 * Resolves the mockup for one sub-service.
 *
 * @param {string} categorySlug
 * @param {string} itemSlug
 * @param {number} index
 * @return {() => import('react').ReactElement}
 */
export function showcaseFor(categorySlug, itemSlug, index) {
    const showcase = SHOWCASES[categorySlug] ?? SHOWCASES.branding;

    return showcase.bySlug[itemSlug] ?? showcase.order[index % showcase.order.length];
}
