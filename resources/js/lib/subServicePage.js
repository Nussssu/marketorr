/**
 * Fills a sub-service page's editable copy: `{name}` becomes the
 * sub-service's name and `{category}` its tab's name, as set in the admin.
 *
 * @param {string|undefined|null} text
 * @param {{ name: string, category: { name: string } }} item
 * @return {string}
 */
export function fillPageText(text, item) {
    return String(text ?? '')
        .replaceAll('{name}', item.name)
        .replaceAll('{category}', item.category?.name ?? '');
}
