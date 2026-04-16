import { motion } from 'motion/react';
import { resolveIcon } from '@/lib/icon-map';
import type { Skill } from '@/types/models';

interface Props {
    skill: Skill;
}

const motionItem = {
    hidden: { opacity: 0, scale: 0.9 },
    show:   { opacity: 1, scale: 1 },
};

function isEmoji(icon: string): boolean {
    return [...icon].some((c) => (c.codePointAt(0) ?? 0) > 127);
}

export default function SkillBadge({ skill }: Props) {
    const iconIsEmoji = skill.icon ? isEmoji(skill.icon) : false;
    const Icon = iconIsEmoji ? null : resolveIcon(skill.icon);

    return (
        <motion.div
            variants={motionItem}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(111,255,233,0.05)' }}
            className="flex items-center space-x-3 bg-oxford-blue px-4 py-3 rounded-xl border border-yinmn-blue/20 hover:border-cyan-accent/30 transition-colors cursor-default"
        >
            {iconIsEmoji ? (
                <span className="text-lg shrink-0 leading-none">{skill.icon}</span>
            ) : Icon ? (
                <Icon size={18} className="text-cyan-accent shrink-0" />
            ) : null}
            <div className="overflow-hidden">
                <span className="text-sm font-medium block">{skill.name}</span>
                <span className="text-xs text-slate-500 block truncate">{skill.category}</span>
            </div>
        </motion.div>
    );
}
