import { Send } from 'lucide-react';
import { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function Contact() {
    const [data, setData] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setState('sending');
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: data.name, email: data.email, message: `${data.subject}\n\n${data.message}` }),
            });
            if (res.ok) {
                setState('sent');
                setData({ name: '', email: '', subject: '', message: '' });
            } else {
                setState('error');
            }
        } catch {
            setState('error');
        }
    }

    return (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
                <p className="text-slate-400 text-lg max-w-xl">
                    Have a project in mind or just want to say hello? My inbox is always open.
                </p>
            </div>

            {state === 'sent' && (
                <div className="mb-8 p-4 bg-cyan-accent/10 border border-cyan-accent/30 rounded-xl text-cyan-accent text-sm">
                    Message sent! I'll get back to you soon.
                </div>
            )}

            {state === 'error' && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    Something went wrong. Please try again.
                </div>
            )}

            <div className="bg-oxford-blue p-8 rounded-3xl border border-yinmn-blue/30">
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Name</label>
                            <input type="text" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} required placeholder="Your name"
                                className="w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg px-4 py-3 focus:border-cyan-accent outline-none transition-colors text-white placeholder-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Email</label>
                            <input type="email" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} required placeholder="you@example.com"
                                className="w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg px-4 py-3 focus:border-cyan-accent outline-none transition-colors text-white placeholder-slate-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Subject</label>
                        <input type="text" value={data.subject} onChange={e => setData(d => ({ ...d, subject: e.target.value }))} placeholder="What's this about?"
                            className="w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg px-4 py-3 focus:border-cyan-accent outline-none transition-colors text-white placeholder-slate-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Message</label>
                        <textarea rows={5} value={data.message} onChange={e => setData(d => ({ ...d, message: e.target.value }))} required placeholder="Tell me about your project or idea..."
                            className="w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg px-4 py-3 focus:border-cyan-accent outline-none transition-colors text-white placeholder-slate-600 resize-none" />
                    </div>
                    <button type="submit" disabled={state === 'sending'}
                        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-cyan-accent text-space-cadet hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed">
                        {state === 'sending' ? (
                            <div className="w-5 h-5 border-2 border-space-cadet border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Send size={18} /> Send Message</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
