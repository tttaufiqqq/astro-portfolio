import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { auth } from '@/api';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        auth.check()
            .then(data => {
                if (!data.authenticated) navigate('/admin/login', { replace: true });
                else setChecking(false);
            })
            .catch(() => navigate('/admin/login', { replace: true }));
    }, [navigate]);

    if (checking) {
        return (
            <div className="min-h-screen bg-space-cadet flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-accent" size={28} />
            </div>
        );
    }

    return <>{children}</>;
}
