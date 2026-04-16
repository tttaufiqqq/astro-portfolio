// Domain model types — mirrors the Prisma schema + Express API response shape.

export interface Project {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    description: string;
    techStack: string;           // comma-separated string from DB
    tech_stack?: string[];       // parsed array for UI
    githubUrl: string | null;
    demoUrl: string | null;
    imageUrl: string | null;
    featured: boolean;
    status: 'draft' | 'published';
    order: number;
    contentBlocks?: ContentBlock[];
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// ContentBlock discriminated union
// ---------------------------------------------------------------------------

interface ContentBlockBase {
    id: number;
    projectId: number;
    order: number;
    language: string | null;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface HeadingBlock extends ContentBlockBase {
    type: 'heading';
    content: { text: string; level: 2 | 3 };
}

export interface TextBlock extends ContentBlockBase {
    type: 'text';
    content: { html: string };
}

export interface ImageBlock extends ContentBlockBase {
    type: 'image';
    content: { alt: string; caption: string; url?: string };
}

export interface VideoBlock extends ContentBlockBase {
    type: 'video';
    content: { url: string | null; caption: string };
}

export interface CodeBlock extends ContentBlockBase {
    type: 'code';
    content: { code: string; language: string };
}

export type ContentBlock = HeadingBlock | TextBlock | ImageBlock | VideoBlock | CodeBlock;

export interface Skill {
    id: number;
    name: string;
    category: string;
    icon: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Experience {
    id: number;
    company: string;
    role: string;
    description: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: number;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

export interface Profile {
    id: number;
    name: string;
    role: string;
    bio: string;
    avatarUrl: string | null;
    resumeUrl: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    updatedAt: string;
}
