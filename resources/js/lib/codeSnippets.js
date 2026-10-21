/**
 * Runs the custom code snippets aimed at particular pages (Admin > Custom
 * Code) as the visitor moves between pages without a full reload.
 *
 * A snippet that applies to the new page and was not already running is
 * added; one that no longer applies is removed; one that applies to both
 * pages is left alone, so it never runs twice. Site-wide snippets are not
 * handled here: the server writes those into the page once.
 */

/** Snippet id -> the nodes it added to the document. */
const running = new Map();

/**
 * A parsed <script> never executes, so each one is rebuilt as a fresh
 * element with the same attributes and code.
 */
function revive(node) {
    const scripts = node.nodeName === 'SCRIPT' ? [node] : [...(node.querySelectorAll?.('script') ?? [])];

    scripts.forEach((old) => {
        const fresh = document.createElement('script');
        [...old.attributes].forEach((attribute) => fresh.setAttribute(attribute.name, attribute.value));
        fresh.text = old.text;
        if (old === node) {
            node = fresh;
        } else {
            old.replaceWith(fresh);
        }
    });

    return node;
}

function inject(snippet) {
    const template = document.createElement('template');
    template.innerHTML = snippet.html;

    const nodes = [...template.content.childNodes].map(revive);
    const parent = snippet.location === 'head' ? document.head : document.body;
    const before = snippet.location === 'body_start' ? document.body.firstChild : null;

    nodes.forEach((node) => parent.insertBefore(node, before));
    running.set(snippet.id, nodes);
}

/**
 * @param {Array<{ id: number, location: 'head'|'body_start'|'body_end', html: string }>} snippets
 */
export function applyPageSnippets(snippets = []) {
    const wanted = new Map((snippets ?? []).map((snippet) => [snippet.id, snippet]));

    running.forEach((nodes, id) => {
        if (wanted.has(id)) return;
        nodes.forEach((node) => node.remove());
        running.delete(id);
    });

    wanted.forEach((snippet, id) => {
        if (running.has(id)) return;

        try {
            inject(snippet);
        } catch (error) {
            // One broken snippet must never stop the page or the others.
            console.error(`[Custom code] Snippet ${id} could not be added.`, error);
        }
    });
}
