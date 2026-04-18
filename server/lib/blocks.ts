/** Parse the DB content string into a typed object at the API boundary. */
export function serializeBlock(block: { content: string; [key: string]: unknown }) {
    return {
        ...block,
        content: typeof block.content === 'string' ? JSON.parse(block.content) : block.content,
    };
}
