import { Fragment } from 'react';
import PageMeta from '../components/PageMeta';
import LandingAbout from '../components/sections/About';
import MissionVision from '../components/sections/MissionVision';
import SectionRenderer from '../components/sections/SectionRenderer';
import Story from '../components/sections/Story';
import Awards from '../components/sections/Awards';
import Team from '../components/sections/Team';

/**
 * About page sections that render as they always have here — the About intro
 * as this page's hero, and the story, vision/mission and team sections
 * without the scene wrapper the shared renderer adds. Any other section an
 * editor adds goes through the shared renderer.
 */
const ABOUT_SECTIONS = {
    about: (section) => <LandingAbout content={section.content} heroHeading />,
    story: (section) => <Story content={section.content} />,
    mission_vision: (section) => <MissionVision content={section.content} />,
    team: (section) => <Team content={section.content} />,
    awards: (section) => <Awards content={section.content} />,
};

/**
 * The About page is a CMS page: its sections, their order and every word and
 * image in them come from the Pages module in the admin panel.
 */
export default function AboutPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="About | Marketorr" />
            {(page?.sections ?? []).map((section) => {
                const render = ABOUT_SECTIONS[section.type];

                return render ? (
                    <Fragment key={section.id}>{render(section)}</Fragment>
                ) : (
                    <SectionRenderer key={section.id} sections={[section]} />
                );
            })}
        </>
    );
}
