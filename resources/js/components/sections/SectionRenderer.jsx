import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import { useThemeMotion } from '../../lib/theme';
import CinematicScene from '../motion/CinematicScene';
import SectionAppear from '../motion/SectionAppear';
import About from './About';
import Awards from './Awards';
import ClosingPanel from './ClosingPanel';
import Contact, { ContactConnect, ContactFaq } from './Contact';
import Cta from './Cta';
import Faq from './Faq';
import Features from './Features';
import Hero from './Hero';
import Marquee from './Marquee';
import MissionVision from './MissionVision';
import OurWork from './OurWork';
import Process from './Process';
import Recognition from './Recognition';
import Results from './Results';
import RichText from './RichText';
import Services from './Services';
import Story from './Story';
import Team from './Team';
import Testimonials from './Testimonials';
import UiuxWork from './UiuxWork';

/**
 * How each widget is wrapped for scroll animation. The three exceptions are
 * not stylistic — each would visibly break inside the wrong wrapper:
 *
 * - `none` for Hero: it owns the opening frame and its own parallax, and a
 *   scene that animated in on load would fight both.
 * - `none` for Our Work, UI/UX Work and Process: each drives a sticky scroll stage, and a
 *   transformed ancestor would move its supposedly fixed layer with the page.
 * - `flat` for Contact: the office map does not survive a 3D ancestor.
 */
const SCENE = { None: 'none', Depth: 'depth', Flat: 'flat' };

/**
 * The widget registry. A `type` with no entry here renders nothing rather
 * than throwing, so a section added by a newer deploy cannot white-screen the
 * page for a visitor on a stale bundle.
 */
const WIDGETS = {
    hero: { scene: SCENE.None, render: (section) => <Hero content={section.content} /> },
    marquee: { scene: SCENE.Depth, render: (section) => <Marquee content={section.content} /> },
    about: {
        scene: SCENE.Depth,
        render: (section, { standalone, compactTop }) => (
            <About
                content={section.content}
                variant={standalone ? 'hero' : 'manifesto'}
                heroHeading={standalone}
                compactTop={compactTop}
            />
        ),
    },
    services: {
        scene: SCENE.Depth,
        render: (section, { props }) => (
            <Services content={section.content} subservices={props.subservices ?? []} showTransition={false} scrollAnimation />
        ),
    },
    work: {
        scene: SCENE.None,
        render: (section, { props, fx }) => (
            <OurWork content={section.content} glow={fx.barGlow} projects={props.featuredProjects ?? []} />
        ),
    },
    uiux_work: {
        scene: SCENE.None,
        render: (section, { props }) => <UiuxWork content={section.content} projects={props.uiuxShowcase ?? []} />,
    },
    // The Contact block, its FAQ and Let's connect are separate sections in the
    // admin, but consecutive ones share one scene so they read as the single
    // stage they always were.
    contact: {
        scene: SCENE.Flat,
        group: 'contact',
        render: (section) => <Contact content={section.content} />,
    },
    contact_faq: { scene: SCENE.Flat, group: 'contact', render: (section) => <ContactFaq content={section.content} /> },
    contact_connect: { scene: SCENE.Flat, group: 'contact', render: (section) => <ContactConnect content={section.content} /> },
    awards: { scene: SCENE.Depth, render: (section) => <Awards content={section.content} /> },
    closing_panel: { scene: SCENE.None, render: (section) => <ClosingPanel content={section.content} /> },
    rich_text: { scene: SCENE.Depth, render: (section) => <RichText content={section.content} /> },
    features: { scene: SCENE.Depth, render: (section) => <Features content={section.content} /> },
    testimonials: { scene: SCENE.Depth, render: (section) => <Testimonials content={section.content} /> },
    faq: { scene: SCENE.Depth, render: (section) => <Faq content={section.content} /> },
    cta: { scene: SCENE.Depth, render: (section) => <Cta content={section.content} /> },
    process: { scene: SCENE.None, render: (section) => <Process content={section.content} /> },
    results: { scene: SCENE.Depth, render: (section) => <Results content={section.content} /> },
    recognition: { scene: SCENE.Depth, render: (section) => <Recognition content={section.content} /> },
    // Story and Vision & Mission pin their own scroll stage, so they stay unwrapped.
    story: { scene: SCENE.None, render: (section) => <Story content={section.content} /> },
    mission_vision: { scene: SCENE.None, render: (section) => <MissionVision content={section.content} /> },
    team: { scene: SCENE.Depth, render: (section) => <Team content={section.content} /> },
};

/**
 * The editor's heading size, a percentage held to 50–200, as a multiplier
 * for the `--heading-scale` the display heading classes read. Blank means
 * the design's own size.
 *
 * @param {number|string|undefined|null} percent
 * @return {number}
 */
function headingScale(percent) {
    const value = Number(percent);

    if (!percent || Number.isNaN(value)) return 1;

    return Math.min(Math.max(value, 50), 200) / 100;
}

/**
 * Renders one page's widget stack.
 *
 * `appearance` chooses how a section arrives, and nothing else — every widget
 * keeps its own internal motion either way:
 *
 * - `depth` (the default, and what every page other than the landing page
 *   uses): the full `CinematicScene` stage, where a section comes forward out
 *   of 3D depth, rests, then falls back and dims as the next one arrives.
 * - `reveal`: the section lifts into place once and then holds still. No
 *   perspective, no rotation, no dimming on the way out.
 *
 * Widgets registered as `SCENE.None` are unwrapped under both, so the hero
 * and Our Work's sticky stage are untouched by this choice.
 *
 * @param {{
 *   sections?: Array<{ id: number, type: string, content: object }>,
 *   appearance?: 'depth'|'reveal',
 * }} props
 */
export default function SectionRenderer({ sections = [], appearance = 'depth' }) {
    const { props } = usePage();
    const fx = useThemeMotion();
    // A page built from a single section reads as that section's own page, so
    // it gets the larger hero treatment where the component supports one.
    const standalone = sections.length === 1;

    // Consecutive sections of the same `group` share one wrapper; every other
    // section gets its own.
    const runs = [];
    sections.forEach((section, index) => {
        const widget = WIDGETS[section.type];

        if (!widget) return;

        const compactTop = appearance === 'reveal' && sections[index - 1]?.type === 'marquee';
        const rendered = widget.render(section, { props, fx, standalone, compactTop });
        const scale = headingScale(section.content?.headingScale);
        // `display: contents` adds no box, so only the size variable reaches
        // the section and its layout, sticky stages included, is untouched.
        const element = scale === 1
            ? <Fragment key={section.id}>{rendered}</Fragment>
            : <div key={section.id} style={{ display: 'contents', '--heading-scale': scale }}>{rendered}</div>;
        const previous = runs[runs.length - 1];

        if (widget.group && previous?.group === widget.group) {
            previous.elements.push(element);
        } else {
            runs.push({ key: section.id, widget, group: widget.group, elements: [element] });
        }
    });

    return runs.map(({ key, widget, elements }) => {
        if (widget.scene === SCENE.None) {
            return <Fragment key={key}>{elements}</Fragment>;
        }

        if (appearance === 'reveal') {
            return <SectionAppear key={key}>{elements}</SectionAppear>;
        }

        return (
            <CinematicScene key={key} depth={widget.scene === SCENE.Depth}>
                {elements}
            </CinematicScene>
        );
    });
}
