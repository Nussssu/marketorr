import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import { useThemeMotion } from '../../lib/theme';
import CinematicScene from '../motion/CinematicScene';
import SectionAppear from '../motion/SectionAppear';
import About from './About';
import Contact from './Contact';
import Cta from './Cta';
import Faq from './Faq';
import Features from './Features';
import Hero from './Hero';
import Marquee from './Marquee';
import OurWork from './OurWork';
import RichText from './RichText';
import Services from './Services';
import Testimonials from './Testimonials';

/**
 * How each widget is wrapped for scroll animation. The three exceptions are
 * not stylistic — each would visibly break inside the wrong wrapper:
 *
 * - `none` for Hero: it owns the opening frame and its own parallax, and a
 *   scene that animated in on load would fight both.
 * - `none` for Our Work: it drives a sticky scroll stage, and a transformed
 *   ancestor would move its supposedly fixed layer with the page.
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
        render: (section, { standalone }) => <About content={section.content} heroHeading={standalone} />,
    },
    services: {
        scene: SCENE.Depth,
        render: (section, { props }) => (
            <Services subservices={props.subservices ?? []} showTransition={false} scrollAnimation />
        ),
    },
    work: {
        scene: SCENE.None,
        render: (section, { props, fx }) => (
            <OurWork glow={fx.barGlow} projects={props.featuredProjects ?? []} />
        ),
    },
    contact: {
        scene: SCENE.Flat,
        render: (section, { standalone }) => <Contact heroHeading={standalone} />,
    },
    rich_text: { scene: SCENE.Depth, render: (section) => <RichText content={section.content} /> },
    features: { scene: SCENE.Depth, render: (section) => <Features content={section.content} /> },
    testimonials: { scene: SCENE.Depth, render: (section) => <Testimonials content={section.content} /> },
    faq: { scene: SCENE.Depth, render: (section) => <Faq content={section.content} /> },
    cta: { scene: SCENE.Depth, render: (section) => <Cta content={section.content} /> },
};

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

    return sections.map((section) => {
        const widget = WIDGETS[section.type];

        if (!widget) return null;

        const element = widget.render(section, { props, fx, standalone });

        if (widget.scene === SCENE.None) {
            return <Fragment key={section.id}>{element}</Fragment>;
        }

        if (appearance === 'reveal') {
            return <SectionAppear key={section.id}>{element}</SectionAppear>;
        }

        return (
            <CinematicScene key={section.id} depth={widget.scene === SCENE.Depth}>
                {element}
            </CinematicScene>
        );
    });
}
