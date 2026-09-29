/** Prefix a site path with the configured base (e.g. /chai-masala) so links work on GitHub Pages. */
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
