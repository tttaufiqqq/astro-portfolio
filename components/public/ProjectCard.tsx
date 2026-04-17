import { Link } from 'react-router-dom';
import { Code2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import type { Project } from '@/types/models';

interface Props {
    project: Project;
}

const motionItem = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0 },
};

function parseTechStack(project: Project): string[] {
    if (project.tech_stack) return project.tech_stack;
    return project.techStack ? project.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
}

export default function ProjectCard({ project }: Props) {
    const summary = project.summary ?? project.description;
    const displaySummary = summary.length > 150 ? summary.slice(0, 150) + '…' : summary;
    const techStack = parseTechStack(project);

    return (
        <motion.div
            variants={motionItem}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-oxford-blue p-6 rounded-xl border border-yinmn-blue/30 hover:border-cyan-accent/50 transition-all group h-full flex flex-col"
        >
            {/* Thumbnail placeholder */}
            {project.imageUrl ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-space-cadet">
                    <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-space-cadet flex items-center justify-center">
                    <Code2 size={40} className="text-cyan-accent opacity-30" />
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold group-hover:text-cyan-accent transition-colors">
                    {project.title}
                </h3>
                {project.demoUrl && (
                    <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-cyan-accent transition-colors shrink-0 ml-2"
                        aria-label="Live demo"
                    >
                        <ExternalLink size={18} />
                    </a>
                )}
            </div>

            <p className="text-slate-400 text-sm mb-4 leading-relaxed flex-grow">{displaySummary}</p>

            <div className="flex flex-wrap gap-2 mt-auto mb-4">
                {techStack.map((tag) => (
                    <span
                        key={tag}
                        className="text-[10px] font-mono uppercase tracking-wider bg-space-cadet px-2 py-1 rounded text-cyan-accent/80 border border-cyan-accent/20"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <Link
                to={`/projects/${project.slug}`}
                className="text-sm text-cyan-accent font-medium hover:underline mt-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent rounded"
            >
                Read More →
            </Link>
        </motion.div>
    );
}
