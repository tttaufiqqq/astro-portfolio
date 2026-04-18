import sanitizeHtml from 'sanitize-html';

/**
 * Allowed tags and attributes for rich text (text blocks).
 * Covers everything the block editor textarea can produce.
 * Script tags, event handlers, and style attributes are blocked.
 */
const ALLOWED_TAGS = [
    'p', 'br',
    'strong', 'em', 'u', 's',
    'h2', 'h3', 'h4',
    'a',
    'ul', 'ol', 'li',
    'blockquote',
    'code', 'pre',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
    a: ['href', 'target', 'rel'],
};

/**
 * Sanitizes HTML from a text block content string.
 * Strips dangerous tags and attributes while preserving safe formatting.
 */
export function sanitizeBlockHtml(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
        // Force external links to open in a new tab safely
        transformTags: {
            a: (_tagName, attribs) => ({
                tagName: 'a',
                attribs: {
                    ...attribs,
                    rel: 'noopener noreferrer',
                },
            }),
        },
    });
}

/**
 * If block content is a text block (has an `html` field), sanitize it.
 * Returns the content string unchanged for all other block types.
 */
export function sanitizeBlockContent(type: string, rawContent: string): string {
    if (type !== 'text') return rawContent;
    try {
        const parsed = JSON.parse(rawContent);
        if (typeof parsed?.html === 'string') {
            return JSON.stringify({ ...parsed, html: sanitizeBlockHtml(parsed.html) });
        }
    } catch {
        // not valid JSON — fall through unchanged
    }
    return rawContent;
}
