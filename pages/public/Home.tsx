import { Link } from 'react-router-dom';
import { Download, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import ProjectCard from '@/components/public/ProjectCard';
import SkillBadge from '@/components/public/SkillBadge';
import TimelineItem from '@/components/public/TimelineItem';
import type { Project, Skill, Experience, Profile } from '@/types/models';

function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    return (
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className={className}>
            {children}
        </motion.div>
    );
}

function Section({ title, id, children, className = '' }: { title: string; id: string; children: React.ReactNode; className?: string }) {
    return (
        <section id={id} className={`py-24 px-6 max-w-7xl mx-auto ${className}`}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
                <h2 className="text-3xl font-bold inline-block border-b-2 border-cyan-accent pb-2">{title}</h2>
            </motion.div>
            {children}
        </section>
    );
}

export default function Home() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);

    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactState, setContactState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch('/api/profile').then(r => r.json()).then(setProfile).catch(() => {});
        fetch('/api/projects?featured=true&status=published')
            .then(r => r.json()).then(setFeaturedProjects).catch(() => {});
        fetch('/api/skills')
            .then(r => r.json()).then(setSkills).catch(() => {});
        fetch('/api/experiences')
            .then(r => r.json()).then(setExperiences).catch(() => {});
    }, []);

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function submitContact(e: React.FormEvent) {
        e.preventDefault();
        setContactErrors({});
        if (!EMAIL_RE.test(contactForm.email)) {
            setContactErrors({ email: 'Please enter a valid email address.' });
            return;
        }
        setContactState('sending');
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactForm),
            });
            if (res.ok) {
                setContactState('sent');
                setContactForm({ name: '', email: '', message: '' });
            } else {
                setContactState('error');
            }
        } catch {
            setContactState('error');
        }
    }

    return (
        <>
            {/* Hero */}
            <header className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                    className="mb-6 inline-block px-4 py-1.5 rounded-full border border-cyan-accent/30 bg-cyan-accent/5 text-cyan-accent text-xs font-mono uppercase tracking-widest">
                    Available for new opportunities
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    {profile?.role ?? 'Software Engineer & Full-Stack Developer'}
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                    {profile?.bio ?? 'I build high-quality web applications with modern technologies, turning complex ideas into clean, documented, and scalable software.'}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-4">
                    <Link to="/projects" className="bg-cyan-accent text-space-cadet px-8 py-3 rounded-lg font-bold hover:bg-white transition-colors shadow-lg shadow-cyan-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent focus-visible:ring-offset-2 focus-visible:ring-offset-space-cadet">
                        View Projects
                    </Link>
                    <a href="#contact" className="border border-yinmn-blue px-8 py-3 rounded-lg font-bold hover:bg-oxford-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent focus-visible:ring-offset-2 focus-visible:ring-offset-space-cadet">
                        Get In Touch
                    </a>
                </motion.div>
            </header>

            {/* About */}
            <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid sm:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <div className="w-full max-w-sm mx-auto rounded-2xl aspect-square bg-oxford-blue border border-yinmn-blue/30 overflow-hidden flex items-center justify-center">
                            {profile?.avatarUrl
                                ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                : <span className="text-slate-500 text-6xl font-bold">T</span>
                            }
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
                        <h2 className="text-3xl font-bold border-b-2 border-cyan-accent pb-2 inline-block">About Me</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            {profile?.bio ?? 'IT undergrad at UTeM, building full-stack web and IoT solutions. Passionate about clean code, scalable architecture, and shipping things that work.'}
                        </p>
                        {profile?.resumeUrl && (
                            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-cyan-accent text-space-cadet px-6 py-2.5 rounded-lg font-bold hover:bg-white transition-colors shadow-lg shadow-cyan-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent">
                                <Download size={16} /> Download CV
                            </a>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
                <Section title="Featured Projects" id="projects">
                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </StaggerContainer>
                    <div className="mt-10 text-center">
                        <Link to="/projects" className="inline-block border border-yinmn-blue px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-oxford-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent">
                            View All Projects →
                        </Link>
                    </div>
                </Section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <Section title="Technical Arsenal" id="skills">
                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {skills.map((skill) => (
                            <SkillBadge key={skill.id} skill={skill} />
                        ))}
                    </StaggerContainer>
                </Section>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
                <Section title="Professional Journey" id="experience">
                    <div className="max-w-3xl">
                        {experiences.map((exp, i) => (
                            <TimelineItem key={exp.id} experience={exp} isLast={i === experiences.length - 1} />
                        ))}
                    </div>
                </Section>
            )}

            {/* Contact */}
            <Section title="Let's Connect" id="contact" className="mb-20">
                <div className="max-w-xl mx-auto">
                    <p className="text-slate-400 leading-relaxed mb-8">
                        I'm currently open to new opportunities and collaborations.
                        Whether you have a project in mind or just want to say hello — reach out!
                    </p>

                    {contactState === 'sent' ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-cyan-accent/30 bg-cyan-accent/5 px-6 py-5 text-cyan-accent text-center">
                            Message sent! I'll be in touch soon.
                        </motion.div>
                    ) : (
                        <form onSubmit={submitContact} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <label className="text-sm text-slate-400">Name</label>
                                    <input type="text" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required placeholder="Your name"
                                        className="bg-oxford-blue border border-yinmn-blue/40 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-accent/60 focus:ring-1 focus:ring-cyan-accent/30 transition-colors" />
                                    {contactErrors.name && <p className="text-xs text-red-400">{contactErrors.name}</p>}
                                </div>
                                <div className="grid gap-1.5">
                                    <label className="text-sm text-slate-400">Email</label>
                                    <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required placeholder="your@email.com"
                                        className="bg-oxford-blue border border-yinmn-blue/40 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-accent/60 focus:ring-1 focus:ring-cyan-accent/30 transition-colors" />
                                    {contactErrors.email && <p className="text-xs text-red-400">{contactErrors.email}</p>}
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm text-slate-400">Message</label>
                                <textarea rows={4} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required placeholder="What's on your mind?"
                                    className="bg-oxford-blue border border-yinmn-blue/40 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-accent/60 focus:ring-1 focus:ring-cyan-accent/30 transition-colors resize-none" />
                                {contactErrors.message && <p className="text-xs text-red-400">{contactErrors.message}</p>}
                            </div>
                            {contactState === 'error' && <p className="text-sm text-red-400">Something went wrong. Please try again.</p>}
                            <div className="flex items-center gap-4">
                                <button type="submit" disabled={contactState === 'sending'}
                                    className="inline-flex items-center gap-2 bg-cyan-accent text-space-cadet px-6 py-2.5 rounded-lg font-bold hover:bg-white transition-colors shadow-lg shadow-cyan-accent/10 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent">
                                    <Send size={15} />
                                    {contactState === 'sending' ? 'Sending…' : 'Send Message'}
                                </button>
                                <Link to="/contact" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                                    Open full contact page →
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </Section>
        </>
    );
}
