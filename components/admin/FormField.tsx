interface Props {
    label: React.ReactNode;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}

export default function FormField({ label, required, error, hint, children }: Props) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
                {label}
                {required && <span className="text-cyan-accent ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}
