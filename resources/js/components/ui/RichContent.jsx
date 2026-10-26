const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

/** Whether a body field holds HTML from the rich text editor rather than plain text. */
export function isHtml(value) {
    return /<\/?[a-z][^>]*>/i.test(String(value ?? ''));
}

/** A body field as plain words, for places that animate the text word by word. */
export function plainText(value) {
    const text = String(value ?? '');
    if (!isHtml(text)) return text;

    return text
        .replace(/<\/(p|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * A page-builder body field. Plain text renders in the given element exactly
 * as before; HTML from the rich text editor (cleaned by the server on save)
 * renders in `htmlAs` with the site's rich text styles.
 *
 * @param {{ value?: string, as?: any, htmlAs?: any, className?: string } & Record<string, any>} props
 */
export default function RichContent({ value, as: Tag = 'p', htmlAs: HtmlTag = 'div', className = '', ...rest }) {
    if (!value) return null;

    if (!isHtml(value)) {
        return <Tag className={className} {...rest}>{value}</Tag>;
    }

    return <HtmlTag className={`prose-cms ${className}`} {...rest} dangerouslySetInnerHTML={{ __html: value }} />;
}
