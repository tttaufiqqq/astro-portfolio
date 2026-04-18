import { Send } from 'lucide-react';
import { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors { name?: string; email?: string; message?: string; }

function validate(data: FormData): FormErrors {
    const e: FormErrors = {};
    if (!data.name.trim()) e.name = 'Name is required';
    if (!data.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(data.email)) e.email = 'Please enter a valid email address';
    if (!data.message.trim()) e.message = 'Message is required';
    return e;
}

export default function Contact() {
    const [data, setData] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errors, setErrors] = useState<FormErrors>({});

    function setField<K extends keyof FormData>(key: K, value: string) {
        setData(d => ({ ...d, [key]: value }));
        if (key in errors) setErrors(e => ({ ...e, [key]: undefined }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const errs = validate(data);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
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
        <div className="pt-24 pb-14 md:pt-32 md:pb-20 px-6 max-w-4xl mx-auto">
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

            <div className="bg-oxford-blue p-4 sm:p-6 md:p-8 rounded-3xl border border-yinmn-blue/30">
                <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Name</label>
                            <input type="text" value={data.name} onChange={e => setField('name', e.target.value)} placeholder="Your name"
                                className={`w-full bg-space-cadet border rounded-lg px-4 py-3 focus:ring-0 outline-none transition-colors text-white placeholder-slate-600 ${errors.name ? 'border-red-500/60 focus:border-red-500/80' : 'border-yinmn-blue/30 focus:border-cyan-accent'}`} />
                            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Email</label>
                            <input type="email" value={data.email} onChange={e => setField('email', e.target.value)} placeholder="you@example.com"
                                className={`w-full bg-space-cadet border rounded-lg px-4 py-3 focus:ring-0 outline-none transition-colors text-white placeholder-slate-600 ${errors.email ? 'border-red-500/60 focus:border-red-500/80' : 'border-yinmn-blue/30 focus:border-cyan-accent'}`} />
                            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Subject</label>
                        <input type="text" value={data.subject} onChange={e => setField('subject', e.target.value)} placeholder="What's this about?"
                            className="w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg px-4 py-3 focus:border-cyan-accent focus:ring-0 outline-none transition-colors text-white placeholder-slate-600" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Message</label>
                        <textarea rows={4} value={data.message} onChange={e => setField('message', e.target.value)} placeholder="Tell me about your project or idea..."
                            className={`w-full bg-space-cadet border rounded-lg px-4 py-3 focus:ring-0 outline-none transition-colors text-white placeholder-slate-600 resize-none ${errors.message ? 'border-red-500/60 focus:border-red-500/80' : 'border-yinmn-blue/30 focus:border-cyan-accent'}`} />
                        {errors.message && <p className="text-xs text-red-400">{errors.message}</p>}
                    </div>
                    <button type="submit" disabled={state === 'sending'}
                        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-cyan-accent text-space-cadet hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent">
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
