import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    onConfirm: () => void;
    prompt?: string;
}

export default function ConfirmDelete({ onConfirm, prompt = 'Sure?' }: Props) {
    const [confirming,  setConfirming]  = useState(false);
    const [processing, setProcessing] = useState(false);

    if (processing) return <div className="p-1.5"><Loader2 size={14} className="animate-spin text-slate-500" /></div>;

    if (confirming) return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{prompt}</span>
            <button type="button" onClick={() => { setProcessing(true); setConfirming(false); onConfirm(); }}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">Yes</button>
            <button type="button" onClick={() => setConfirming(false)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors">No</button>
        </div>
    );

    return (
        <button type="button" onClick={() => setConfirming(true)} aria-label="Delete"
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/5">
            <Trash2 size={14} />
        </button>
    );
}
