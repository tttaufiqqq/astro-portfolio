import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, FolderKanban, Wrench, Briefcase, MessageSquare, UserCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import RequireAuth from '@/components/admin/RequireAuth';

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
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 items-center h-14">
                        <span className="text-cyan-accent font-bold tracking-wider text-sm">ADMIN</span>
                        <nav className="flex items-center justify-center gap-1">
                            {tabs.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
                        <div className="flex items-center justify-end gap-2">
                            <a href="/" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-accent transition-colors text-sm">
                                <ExternalLink size={14} />
                                <span className="hidden sm:inline">View Site</span>
                            </a>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">Logout</span>
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
