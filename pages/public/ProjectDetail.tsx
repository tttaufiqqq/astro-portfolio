import { Link, useParams } from 'react-router-dom';
import { Github, ExternalLink, ArrowLeft, ArrowRight, ChevronDown, List } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import CodeRenderer from '@/components/public/blocks/CodeRenderer';
import HeadingRenderer from '@/components/public/blocks/HeadingRenderer';
import ImageRenderer from '@/components/public/blocks/ImageRenderer';
import TextRenderer from '@/components/public/blocks/TextRenderer';
import VideoRenderer from '@/components/public/blocks/VideoRenderer';
import type { Project, ContentBlock, HeadingBlock } from '@/types/models';
import { projects as projectsApi } from '@/api';

import type { ProjectDetailResponse } from '@/api/projects';
type ProjectResponse = ProjectDetailResponse;

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function renderBlock(block: ContentBlock) {
    switch (block.type) {
        case 'heading': return <HeadingRenderer key={block.id} block={block} />;
        case 'text':    return <TextRenderer key={block.id} block={block} />;
        case 'image':   return <ImageRenderer key={block.id} block={block} />;
        case 'video':   return <VideoRenderer key={block.id} block={block} />;
        case 'code':    return <CodeRenderer key={block.id} block={block} />;
        default:        return null;
    }
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ProjectDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<ProjectResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [tocOpen, setTocOpen] = useState(false);

    useEffect(() => {
        if (!slug) return;
        window.scrollTo({ top: 0, behavior: 'instant' });
        setLoading(true);
        projectsApi.get(slug)
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <div className="pt-32 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!data) return (
        <div className="pt-32 text-center text-slate-500">
            <p className="text-lg font-medium">Project not found.</p>
            <a href="/projects" className="mt-4 inline-block text-sm text-cyan-accent hover:underline">← Back to Projects</a>
        </div>
    );

    const { project, prev, next } = data;
    const blocks: ContentBlock[] = project.contentBlocks ?? [];
    const techStack = project.tech_stack ?? (project.techStack ? project.techStack.split(',').map(t => t.trim()) : []);
    const summary = project.summary ?? project.description;
    const headings = blocks.filter((b): b is HeadingBlock => b.type === 'heading');
    const hasToc = headings.length >= 2;

    return (
        <>
            {/* Hero */}
            <div className="relative h-72 md:h-[28rem] overflow-hidden">
                {project.imageUrl ? (
                    <>
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-space-cadet via-space-cadet/60 to-space-cadet/10" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-oxford-blue via-yinmn-blue/40 to-space-cadet" />
                )}
                <Link to="/projects"
                    className="absolute top-20 left-6 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-accent transition-colors bg-space-cadet/60 backdrop-blur-sm rounded-full px-4 py-2 z-10">
                    <ArrowLeft size={14} /> Back to Projects
                </Link>
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
                    <div className="max-w-4xl mx-auto">
                        <motion.h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            {project.title}
                        </motion.h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Meta strip */}
                <motion.div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-8 border-b border-yinmn-blue/30"
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                    <div className="flex flex-wrap gap-2">
                        {techStack.map((tag: string) => (
                            <span key={tag} className="text-[10px] sm:text-xs font-mono uppercase tracking-wider bg-space-cadet px-2 py-1 rounded text-cyan-accent/80 border border-cyan-accent/20">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-accent transition-colors">
                                <Github size={16} /> GitHub
                            </a>
                        )}
                        {project.demoUrl && (
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-accent transition-colors">
                                <ExternalLink size={16} /> Live Demo
                            </a>
                        )}
                    </div>
                </motion.div>

                {/* Summary */}
                <motion.p className="text-base md:text-xl text-slate-300 leading-relaxed mb-12 border-l-2 border-cyan-accent pl-4 md:pl-6"
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                    {summary}
                </motion.p>

                {/* TOC */}
                {hasToc && (
                    <motion.div className="mb-10 rounded-xl border border-yinmn-blue/30 bg-oxford-blue overflow-hidden"
                        variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <button type="button" onClick={() => setTocOpen(o => !o)}
                            className="flex items-center justify-between w-full px-5 py-4 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                            <span className="flex items-center gap-2"><List size={15} /> Table of Contents</span>
                            <ChevronDown size={15} className={`md:hidden transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <ol className={`${tocOpen ? 'block' : 'hidden'} md:block px-5 pb-4 space-y-1`}>
                            {headings.map((h, i) => (
                                <li key={h.id} className={h.content.level === 3 ? 'pl-4' : ''}>
                                    <a href={`#${slugify(h.content.text)}`} onClick={() => setTocOpen(false)}
                                        className="text-sm text-slate-400 hover:text-cyan-accent transition-colors">
                                        {i + 1}. {h.content.text}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </motion.div>
                )}

                {/* Blocks */}
                {blocks.length > 0 ? (
                    <div className="flex flex-col gap-8">
                        {blocks.map((block, i) => (
                            <motion.div key={block.id} variants={fadeUp} initial="hidden" whileInView="show"
                                viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
                                {renderBlock(block)}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-16">Detailed documentation coming soon.</p>
                )}

                {/* Prev / Next */}
                {(prev || next) && (
                    <nav className="mt-16 pt-8 border-t border-yinmn-blue/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prev ? (
                            <Link to={`/projects/${prev.slug}`}
                                className="group flex flex-col gap-1 rounded-xl border border-yinmn-blue/30 bg-oxford-blue px-5 py-4 hover:border-cyan-accent/30 transition-colors">
                                <span className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                    <ArrowLeft size={12} /> Previous
                                </span>
                                <span className="text-sm font-semibold text-slate-300 group-hover:text-cyan-accent transition-colors line-clamp-1">{prev.title}</span>
                            </Link>
                        ) : <div />}
                        {next ? (
                            <Link to={`/projects/${next.slug}`}
                                className="group flex flex-col gap-1 rounded-xl border border-yinmn-blue/30 bg-oxford-blue px-5 py-4 hover:border-cyan-accent/30 transition-colors sm:items-end">
                                <span className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                    Next <ArrowRight size={12} />
                                </span>
                                <span className="text-sm font-semibold text-slate-300 group-hover:text-cyan-accent transition-colors line-clamp-1">{next.title}</span>
                            </Link>
                        ) : <div />}
                    </nav>
                )}
            </div>
        </>
    );
}
