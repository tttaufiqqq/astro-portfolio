import { Globe, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import type { Experience } from '@/types/models';

interface Props {
    experience: Experience;
    isLast: boolean;
}

function formatMonthYear(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatPeriod(experience: Experience): string {
    const start = formatMonthYear(experience.startDate);
    const end = experience.current
        ? 'Present'
        : experience.endDate
          ? formatMonthYear(experience.endDate)
          : '—';
    return `${start} – ${end}`;
}

export default function TimelineItem({ experience, isLast }: Props) {
    const description = experience.description
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={['relative pl-8', isLast ? 'pb-0' : 'pb-12 border-l border-yinmn-blue/30'].join(' ')}
        >
            {experience.current && (
                <span className="absolute left-[-5px] top-2.5 w-2.5 h-2.5 rounded-full bg-cyan-accent/40 animate-ping" />
            )}
            <div
                className={[
                    'absolute left-[-5px] top-2.5 w-2.5 h-2.5 rounded-full',
                    experience.current
                        ? 'bg-cyan-accent shadow-[0_0_10px_rgba(111,255,233,0.5)]'
                        : 'bg-yinmn-blue',
                ].join(' ')}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{experience.role}</h3>
                <span className="text-cyan-accent font-mono text-sm">{formatPeriod(experience)}</span>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                    {experience.type === 'education' ? <GraduationCap size={14} /> : <Globe size={14} />}
                    {experience.company}
                </div>
            </div>

            {description.length > 0 && (
                <ul className="space-y-2">
                    {description.map((line, i) => (
                        <li key={i} className="text-slate-400 text-sm flex gap-2">
                            <span className="text-cyan-accent mt-1.5">•</span>
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}
