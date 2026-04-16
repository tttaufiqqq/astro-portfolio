import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import ThemedInput from '@/components/admin/ThemedInput';
import ThemedButton from '@/components/admin/ThemedButton';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                navigate('/admin', { replace: true });
            } else {
                const data = await res.json().catch(() => ({}));
                setError((data as { error?: string }).error ?? 'Invalid password');
            }
        } catch {
            setError('Network error — please try again');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-space-cadet flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <p className="text-cyan-accent font-bold tracking-widest text-sm uppercase">Admin</p>
                    <h1 className="text-white text-2xl font-bold mt-1">Welcome back</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-oxford-blue border border-yinmn-blue/30 rounded-xl p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <ThemedInput
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                required
                                className="pr-10 w-full"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
                    </div>

                    <ThemedButton type="submit" disabled={loading} className="w-full justify-center">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign in'}
                    </ThemedButton>
                </form>
            </div>
        </div>
    );
}
