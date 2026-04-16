/**
 * Maps icon name strings (stored in the skills.icon DB column) to icon components.
 * Supports both Lucide icons (generic dev icons) and Simple Icons (brand logos via react-icons/si).
 * Admin enters a name like "react", "laravel", "database" — this resolves it to the component.
 */

import {
    Binary, Box, Circle, Cloud, Code, Code2, Cpu, Database,
    FileCode, FileJson, FileText, Flame, Globe, Hash, Layers,
    Layout, LayoutDashboard, Lock, Monitor, Network, Package,
    Palette, Server, Settings, Shield, Smartphone, Terminal,
    TestTube, Workflow, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import {
    SiReact, SiVuedotjs, SiAngular, SiSvelte, SiNextdotjs, SiNuxt, SiAstro,
    SiTypescript, SiJavascript, SiPhp, SiPython, SiRust, SiGo, SiDart, SiKotlin,
    SiSwift, SiCplusplus, SiC,
    SiLaravel, SiDjango, SiFastapi, SiExpress, SiSpring,
    SiMysql, SiPostgresql, SiMongodb, SiRedis, SiSqlite, SiSupabase, SiFirebase, SiPrisma,
    SiTailwindcss, SiBootstrap, SiSass, SiHtml5, SiCss,
    SiNodedotjs, SiDocker, SiKubernetes, SiGit, SiGithub, SiGitlab, SiBitbucket,
    SiLinux, SiUbuntu, SiNginx, SiApache,
    SiGooglecloud, SiVercel, SiNetlify, SiDigitalocean,
    SiFigma, SiPostman, SiJira, SiSlack, SiNotion, SiVite, SiWebpack,
    SiFlutter, SiIos, SiAndroid,
    SiWordpress, SiShopify,
    SiElasticsearch, SiRabbitmq,
} from 'react-icons/si';

// Generic icon type compatible with both Lucide and react-icons
export type SkillIcon = ComponentType<{ size?: number; className?: string }>;

// ─── Lucide (generic dev concepts) ────────────────────────────────────────────
export const iconMap: Record<string, LucideIcon> = {
    code: Code, code2: Code2, terminal: Terminal, binary: Binary,
    filecode: FileCode, filejson: FileJson, filetext: FileText, hash: Hash,
    server: Server, database: Database, cloud: Cloud, network: Network, cpu: Cpu,
    layout: Layout, monitor: Monitor, smartphone: Smartphone, palette: Palette,
    dashboard: LayoutDashboard, layers: Layers, box: Box, package: Package,
    workflow: Workflow, settings: Settings, globe: Globe, zap: Zap,
    flame: Flame, lock: Lock, shield: Shield, testtube: TestTube,
};

// ─── Brand icons (Simple Icons via react-icons/si) ────────────────────────────
export const brandIconMap: Record<string, SkillIcon> = {
    // Frontend frameworks
    react: SiReact, vue: SiVuedotjs, angular: SiAngular, svelte: SiSvelte,
    nextjs: SiNextdotjs, nuxtjs: SiNuxt, astro: SiAstro,
    // Languages
    typescript: SiTypescript, javascript: SiJavascript, php: SiPhp,
    python: SiPython, rust: SiRust, go: SiGo, dart: SiDart,
    kotlin: SiKotlin, swift: SiSwift, cpp: SiCplusplus, c: SiC,
    // Backend
    laravel: SiLaravel, django: SiDjango, fastapi: SiFastapi,
    express: SiExpress, spring: SiSpring,
    // Databases
    mysql: SiMysql, postgresql: SiPostgresql, mongodb: SiMongodb,
    redis: SiRedis, sqlite: SiSqlite, supabase: SiSupabase,
    firebase: SiFirebase, prisma: SiPrisma,
    // CSS / UI
    tailwind: SiTailwindcss, tailwindcss: SiTailwindcss,
    bootstrap: SiBootstrap, sass: SiSass, html: SiHtml5, html5: SiHtml5,
    css: SiCss, css3: SiCss,
    // Runtime / DevOps
    nodejs: SiNodedotjs, node: SiNodedotjs,
    docker: SiDocker, kubernetes: SiKubernetes,
    git: SiGit, github: SiGithub, gitlab: SiGitlab, bitbucket: SiBitbucket,
    linux: SiLinux, ubuntu: SiUbuntu, nginx: SiNginx, apache: SiApache,
    // Cloud
    gcp: SiGooglecloud, googlecloud: SiGooglecloud,
    vercel: SiVercel, netlify: SiNetlify, digitalocean: SiDigitalocean,
    // Tools
    figma: SiFigma, postman: SiPostman, jira: SiJira,
    slack: SiSlack, notion: SiNotion, vite: SiVite, webpack: SiWebpack,
    // Mobile
    flutter: SiFlutter, ios: SiIos, android: SiAndroid,
    // CMS / E-comm
    wordpress: SiWordpress, shopify: SiShopify,
    // Infra
    elasticsearch: SiElasticsearch, rabbitmq: SiRabbitmq,
};

export function resolveIcon(name: string | null | undefined): SkillIcon {
    if (!name) return Circle;
    const key = name.toLowerCase();
    return brandIconMap[key] ?? iconMap[key] ?? Circle;
}

/** All icon names available in the picker (Lucide names only — brands shown separately) */
export const LUCIDE_ICON_NAMES = Object.keys(iconMap);
export const BRAND_ICON_NAMES = Object.keys(brandIconMap);
