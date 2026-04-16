import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import ProjectCard from '@/components/public/ProjectCard';
import type { Project } from '@/types/models';

const container = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/projects?status=published')
            .then(r => r.json())
            .then(data => { setProjects(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">All Projects</h1>
                <p className="text-slate-400 text-lg max-w-xl">
                    A collection of things I've built — from side projects to professional work.
                </p>
            </motion.div>

            {loading ? (
                <div className="text-center py-24 text-slate-500">Loading...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-24 text-slate-500">
                    <p className="text-lg">No projects published yet.</p>
                    <p className="text-sm mt-2">Check back soon.</p>
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
