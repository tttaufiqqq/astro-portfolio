import { useState, useEffect } from 'react';
import { Mail, Loader2, Send } from 'lucide-react';
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
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        fetch('/api/messages', { credentials: 'include' })
            .then(r => r.json())
            .then((data: Message[]) => {
                setMessages(data);
                if (data.some(m => !m.read)) {
                    fetch('/api/messages/read-all', { method: 'POST', credentials: 'include' })
                        .then(() => window.dispatchEvent(new Event('messages-read')))
                        .catch(() => {});
                }
            })
            .catch(() => toast.error('Failed to load messages'))
            .finally(() => setLoading(false));
    }, []);

    function handleExpand(id: number) {
        setExpanded(prev => prev === id ? null : id);
        setReplyText('');
    }

    function handleReply(id: number) {
        if (!replyText.trim()) return;
        setReplying(true);
        fetch(`/api/messages/${id}/reply`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: replyText.trim() }),
        })
            .then(r => {
                if (!r.ok) throw new Error();
                setReplyText('');
                toast.success('Reply sent');
            })
            .catch(() => toast.error('Failed to send reply'))
            .finally(() => setReplying(false));
    }

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
        <div className="max-w-4xl mx-auto">
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
                                onClick={() => handleExpand(msg.id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {!msg.read && (
                                            <span className="w-2 h-2 rounded-full bg-cyan-accent flex-shrink-0" />
                                        )}
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
                                    <div className="mt-4 space-y-2">
                                        <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Write a reply..."
                                            rows={3}
                                            className="w-full bg-space-cadet border border-yinmn-blue/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-accent/50"
                                        />
                                        <button
                                            onClick={() => handleReply(msg.id)}
                                            disabled={replying || !replyText.trim()}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-accent/10 text-cyan-accent text-xs font-medium rounded-lg hover:bg-cyan-accent/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {replying ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                            {replying ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
