import PageMeta from '../../components/PageMeta';
import CategoryHero from '../../components/sections/CategoryHero';
import SectionRenderer from '../../components/sections/SectionRenderer';

function ServicesDirectory({ subservices }) {
    return (
        <div className="bg-[var(--bg)]">
            {subservices.map((category, index) => (
                <div key={category.slug} id={category.slug}>
                    <CategoryHero category={category} blendTop={index > 0} />
                </div>
            ))}
        </div>
    );
}

export default function ServicesIndex({ page, subservices }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="Services | Marketorr" />
            {(page?.sections ?? []).map((section) => (
                section.type === 'services' ? (
                    <ServicesDirectory key={section.id} subservices={subservices} />
                ) : (
                    <SectionRenderer key={section.id} sections={[section]} />
                )
            ))}
        </>
    );
}
