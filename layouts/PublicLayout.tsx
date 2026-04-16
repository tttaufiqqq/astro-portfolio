import { Link, Outlet } from 'react-router-dom';
import { Github, Linkedin, Mail, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import type { Profile } from '@/types/models';

const NAV_LINKS = [
    { label: 'About',    href: '/#about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Contact',  href: '/contact' },
];

export default function PublicLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        fetch('/api/profile').then(r => r.json()).then(setProfile).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-space-cadet text-slate-200 font-sans antialiased">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-space-cadet/80 backdrop-blur-md border-b border-oxford-blue">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-cyan-accent font-mono font-bold text-xl"
                    >
                        <Link to="/">&lt;tttaufiqqq /&gt;</Link>
                    </motion.div>

                    <div className="hidden md:flex space-x-8 text-sm font-medium">
                        {NAV_LINKS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="hover:text-cyan-accent transition-colors relative group"
                            >
                                {item.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-accent transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="md:hidden text-slate-400 hover:text-cyan-accent transition-colors"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            key="mobile-menu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden bg-oxford-blue border-t border-yinmn-blue/30"
                        >
                            <div className="px-6 py-4 space-y-4">
                                {NAV_LINKS.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block text-sm font-medium text-slate-400 hover:text-cyan-accent transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main>
                <Outlet />
            </main>

            <footer className="bg-oxford-blue py-12 px-6 border-t border-yinmn-blue/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="text-cyan-accent font-mono font-bold text-xl mb-2">
                            &lt;tttaufiqqq /&gt;
                        </div>
                        <p className="text-slate-400 text-sm">
                            Building the future, one line of code at a time.
                        </p>
                    </div>

                    <div className="flex space-x-6">
                        {profile?.githubUrl && (
                            <motion.a whileHover={{ y: -3 }} href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-accent transition-colors" aria-label="GitHub">
                                <Github size={24} />
                            </motion.a>
                        )}
                        {profile?.linkedinUrl && (
                            <motion.a whileHover={{ y: -3 }} href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-accent transition-colors" aria-label="LinkedIn">
                                <Linkedin size={24} />
                            </motion.a>
                        )}
                        {profile?.twitterUrl && (
                            <motion.a whileHover={{ y: -3 }} href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-accent transition-colors" aria-label="Twitter / X">
                                <X size={24} />
                            </motion.a>
                        )}
                    </div>
                </div>

                <div className="text-center mt-12 text-slate-500 text-xs">
                    &copy; {new Date().getFullYear()} tttaufiqqq. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
