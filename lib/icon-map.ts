/**
 * Maps icon name strings (stored in the skills.icon DB column) to Lucide components.
 * Admin enters a name like "code", "database", "globe" — this resolves it to the component.
 */

import {
    Binary, Box, Circle, Cloud, Code, Code2, Cpu, Database,
    FileCode, FileJson, FileText, Flame, Globe, Hash, Layers,
    Layout, LayoutDashboard, Lock, Monitor, Network, Package,
    Palette, Server, Settings, Shield, Smartphone, Terminal,
    TestTube, Workflow, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
    code: Code, code2: Code2, terminal: Terminal, binary: Binary,
    filecode: FileCode, filejson: FileJson, filetext: FileText, hash: Hash,
    server: Server, database: Database, cloud: Cloud, network: Network, cpu: Cpu,
    layout: Layout, monitor: Monitor, smartphone: Smartphone, palette: Palette,
    dashboard: LayoutDashboard, layers: Layers, box: Box, package: Package,
    workflow: Workflow, settings: Settings, globe: Globe, zap: Zap,
    flame: Flame, lock: Lock, shield: Shield, testtube: TestTube,
};

export function resolveIcon(name: string | null | undefined): LucideIcon {
    if (!name) return Circle;
    return iconMap[name.toLowerCase()] ?? Circle;
}
