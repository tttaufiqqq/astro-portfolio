import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 max-w-md"
            >
                <p className="text-8xl font-bold text-cyan-accent/20 font-mono">404</p>
                <h1 className="text-2xl font-bold text-slate-200">Page not found</h1>
                <p className="text-slate-400">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-cyan-accent text-space-cadet px-6 py-2.5 rounded-lg font-bold hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent"
                    >
                        <Home size={15} /> Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 border border-yinmn-blue px-6 py-2.5 rounded-lg font-bold hover:bg-oxford-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-accent"
                    >
                        <ArrowLeft size={15} /> Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
