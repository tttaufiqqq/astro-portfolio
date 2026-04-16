import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-space-cadet text-slate-200 font-sans">
            <Outlet />
        </div>
    );
}
