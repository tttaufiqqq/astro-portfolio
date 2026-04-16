import { useState, useEffect } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '@/types/models';
import ConfirmDelete from '@/components/admin/ConfirmDelete';

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function MessagesTab() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/messages', { credentials: 'include' })
            .then(r => r.json())
            .then((data: Message[]) => setMessages(data))
            .catch(() => toast.error('Failed to load messages'))
            .finally(() => setLoading(false));
    }, []);

    function handleDelete(id: number) {
        fetch(`/api/messages/${id}`, { method: 'DELETE', credentials: 'include' })
            .then(r => {
                if (!r.ok) throw new Error();
                setMessages(prev => prev.filter(m => m.id !== id));
                if (expanded === id) setExpanded(null);
                toast.success('Message deleted');
            })
            .catch(() => toast.error('Delete failed'));
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-cyan-accent" size={24} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <p className="text-sm text-slate-400 mt-0.5">{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
            </div>

            {messages.length === 0 ? (
                <div className="text-center py-16">
                    <Mail size={32} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No messages yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map(msg => (
                        <div key={msg.id}
                            className="bg-oxford-blue border border-yinmn-blue/30 rounded-xl overflow-hidden hover:border-yinmn-blue/50 transition-colors">
                            {/* Header row */}
                            <div
                                className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer"
                                onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-white">{msg.name}</span>
                                        <span className="text-xs text-slate-500">{msg.email}</span>
                                    </div>
                                    <p className={`text-sm text-slate-400 mt-1 ${expanded === msg.id ? '' : 'truncate'}`}>
                                        {msg.message}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-slate-600 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                                    <ConfirmDelete onConfirm={() => handleDelete(msg.id)} prompt="Delete this message?" />
                                </div>
                            </div>

                            {/* Expanded view */}
                            {expanded === msg.id && (
                                <div className="px-5 pb-4 border-t border-yinmn-blue/20">
                                    <p className="text-sm text-slate-300 mt-3 whitespace-pre-wrap leading-relaxed">
                                        {msg.message}
                                    </p>
                                    <a
                                        href={`mailto:${msg.email}?subject=Re: Your message`}
                                        className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-accent hover:underline"
                                    >
                                        <Mail size={12} />
                                        Reply via email
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
