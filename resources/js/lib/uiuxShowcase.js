/** The UI/UX Portfolio page, where the six projects are previewed. */
export const PORTFOLIO_HREF = '/work/portfolio/uiux';

/**
 * A UI/UX project's own printer page.
 *
 * @param {string} slug
 */
export const projectHref = (slug) => `${PORTFOLIO_HREF}/${slug}`;
