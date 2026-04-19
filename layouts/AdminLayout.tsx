import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, FolderKanban, Wrench, Briefcase, MessageSquare, UserCircle, ExternalLink, Palette, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import RequireAuth from '@/components/admin/RequireAuth';
import { themes, applyTheme, loadSavedTheme, type ThemeId } from '@/lib/theme';

const tabs = [
    { to: '/admin/projects',    label: 'Projects',    icon: FolderKanban },
    { to: '/admin/skills',      label: 'Skills',      icon: Wrench },
    { to: '/admin/experiences', label: 'Experience',  icon: Briefcase },
    { to: '/admin/messages',    label: 'Messages',    icon: MessageSquare },
    { to: '/admin/profile',     label: 'Profile',     icon: UserCircle },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentTheme, setCurrentTheme] = useState<ThemeId>('navy-cyan');
    const [paletteOpen, setPaletteOpen] = useState(false);
    const paletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = loadSavedTheme();
        setCurrentTheme(saved);
        applyTheme(saved);
    }, []);

    useEffect(() => {
        if (!paletteOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
                setPaletteOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [paletteOpen]);

    function handleThemeChange(id: ThemeId) {
        setCurrentTheme(id);
        applyTheme(id);
    }

    function refreshUnread() {
        fetch('/api/messages/unread-count', { credentials: 'include' })
            .then(r => r.json())
            .then(data => setUnreadCount(data.count ?? 0))
            .catch(() => {});
    }

    useEffect(() => {
        refreshUnread();
        window.addEventListener('messages-read', refreshUnread);
        return () => window.removeEventListener('messages-read', refreshUnread);
    }, []);

    function handleLogout() {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .then(() => { navigate('/admin/login'); })
            .catch(() => toast.error('Logout failed'));
    }

    return (
        <RequireAuth>
            <div className="min-h-screen bg-space-cadet text-slate-200 font-sans">
                {/* Top bar */}
                <header className="sticky top-0 z-40 bg-oxford-blue border-b border-yinmn-blue/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-[auto_1fr_auto] items-center h-14 gap-2">
                        <span className="text-cyan-accent font-bold tracking-wider text-sm">ADMIN</span>
                        <nav className="flex items-center justify-center gap-1">
                            {tabs.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-cyan-accent/10 text-cyan-accent'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <Icon size={14} />
                                    <span className="hidden sm:inline relative">
                                        {label}
                                        {to === '/admin/messages' && unreadCount > 0 && (
                                            <span className="absolute -top-2.5 -right-3.5 bg-cyan-accent text-space-cadet text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </NavLink>
                            ))}
                        </nav>
                        <div className="flex items-center justify-end gap-1">
                            {/* Palette picker */}
                            <div ref={paletteRef} className="relative">
                                <button
                                    onClick={() => setPaletteOpen(o => !o)}
                                    title="Switch theme"
                                    className={`p-2 rounded-lg transition-colors ${
                                        paletteOpen
                                            ? 'bg-cyan-accent/10 text-cyan-accent'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                                >
                                    <Palette size={15} />
                                </button>
                                {paletteOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-oxford-blue border border-yinmn-blue/40 rounded-xl shadow-xl overflow-hidden z-50">
                                        <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500">Color Palette</p>
                                        {themes.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => { handleThemeChange(t.id); setPaletteOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                                                    currentTheme === t.id
                                                        ? 'bg-white/5 text-slate-100'
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                }`}
                                            >
                                                {/* Split swatch bar */}
                                                <span className="flex h-4 w-10 rounded overflow-hidden shrink-0 border border-white/10">
                                                    <span className="flex-1" style={{ backgroundColor: t.bg }} />
                                                    <span className="flex-1" style={{ backgroundColor: t.accent }} />
                                                </span>
                                                <span className="flex-1 text-left">{t.label}</span>
                                                {t.id === 'navy-cyan' && currentTheme !== 'navy-cyan' && (
                                                    <span className="text-[9px] uppercase tracking-wider text-slate-600">default</span>
                                                )}
                                                {currentTheme === t.id && <Check size={13} className="text-slate-300 shrink-0" />}
                                            </button>
                                        ))}
                                        {currentTheme !== 'navy-cyan' && (
                                            <>
                                                <div className="mx-3 my-1 border-t border-yinmn-blue/20" />
                                                <button
                                                    onClick={() => { handleThemeChange('navy-cyan'); setPaletteOpen(false); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                    <RotateCcw size={11} />
                                                    Reset to default
                                                </button>
                                            </>
                                        )}
                                        <div className="h-1.5" />
                                    </div>
                                )}
                            </div>

                            {/* View Site */}
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View Site"
                                className="p-2 rounded-lg text-slate-400 hover:text-cyan-accent hover:bg-white/5 transition-colors"
                            >
                                <ExternalLink size={15} />
                            </a>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="max-w-7xl mx-auto px-6 py-8">
                    <Outlet />
                </main>
            </div>
        </RequireAuth>
    );
}
