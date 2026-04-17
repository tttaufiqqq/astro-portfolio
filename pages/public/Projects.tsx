import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Loader2, FolderOpen, AlertCircle } from 'lucide-react';
import ProjectCard from '@/components/public/ProjectCard';
import type { Project } from '@/types/models';

const container = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/projects?status=published')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => setProjects(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pt-24 pb-14 md:pt-32 md:pb-20 px-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">All Projects</h1>
                <p className="text-slate-400 text-lg max-w-xl">
                    A collection of things I've built — from side projects to professional work.
                </p>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 size={32} className="animate-spin text-cyan-accent" />
                </div>
            ) : error ? (
                <div className="text-center py-24 text-slate-500">
                    <AlertCircle size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Failed to load projects.</p>
                    <p className="text-sm mt-2 text-slate-600">Please refresh the page.</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-24 text-slate-500">
                    <FolderOpen size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No projects published yet.</p>
                    <p className="text-sm mt-2 text-slate-600">Check back soon.</p>
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
