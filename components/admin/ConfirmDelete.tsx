import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface Props {
    onConfirm: () => void;
    prompt?: string;
}

export default function ConfirmDelete({ onConfirm, prompt = 'This action cannot be undone.' }: Props) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    function handleConfirm() {
        setProcessing(true);
        setOpen(false);
        onConfirm();
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Delete"
                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/5"
            >
                {processing
                    ? <Loader2 size={14} className="animate-spin text-slate-500" />
                    : <Trash2 size={14} />
                }
            </button>

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                        <motion.div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            className="relative w-full max-w-sm bg-oxford-blue border border-yinmn-blue/30 rounded-xl shadow-xl p-6"
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center">
                                    <AlertTriangle size={20} className="text-red-400" />
                                </div>
                                <h3 className="text-white font-bold text-base">Delete?</h3>
                                <p className="text-slate-400 text-sm">{prompt}</p>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-yinmn-blue/40 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/30 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
