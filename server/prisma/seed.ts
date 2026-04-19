import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.contentBlock.deleteMany();
    await prisma.project.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.message.deleteMany();
    await prisma.profile.deleteMany();

    await prisma.profile.create({
        data: {
            name: 'Taufiq',
            role: 'Full-Stack Developer',
            bio: 'Final-year CS student at UTeM, building production-grade full-stack web apps and IoT systems. Currently working on BuzzyHive — a smart beehive monitoring platform with ESP32, Laravel, and machine learning. Clean code, real deployments, things that actually work.',
            githubUrl: 'https://github.com/tttaufiqqq',
            linkedinUrl: 'https://linkedin.com/in/tttaufiqqq',
        },
    });

    const buzzyhive = await prisma.project.create({
        data: {
            title: 'BuzzyHive 2.0',
            slug: 'buzzyhive',
            summary: 'Smart beehive monitoring platform with real-time IoT data, HRI scoring, and ML predictions.',
            description: 'ESP32-based IoT system with Laravel backend, real-time sensor dashboards, and machine learning health predictions.',
            techStack: 'Laravel,ESP32,React,Recharts,MySQL,Python',
            githubUrl: 'https://github.com/tttaufiqqq/buzzyhive',
            featured: true,
            status: 'published',
            order: 1,
        },
    });

    const portfolio = await prisma.project.create({
        data: {
            title: 'Full-Stack Portfolio CMS',
            slug: 'portfolio',
            summary: 'A dynamic developer portfolio with a custom CMS, block editor, and Azure deployment.',
            description: 'React + Vite frontend with Express + Prisma backend deployed on Azure App Service with CI/CD via GitHub Actions.',
            techStack: 'React 19,TypeScript,Express,Prisma,Azure SQL,Azure Blob Storage,Tailwind CSS v4,Framer Motion,Vitest,GitHub Actions',
            githubUrl: 'https://github.com/tttaufiqqq/astro-portfolio',
            demoUrl: 'https://tttaufiqq-portfolio-ahhgd6gfg8dzdddc.southeastasia-01.azurewebsites.net',
            featured: true,
            status: 'published',
            order: 2,
        },
    });

    const fantaz = await prisma.project.create({
        data: {
            title: 'Personal AI Workflow System',
            slug: 'personal-ai-workflow-system',
            summary: 'A persistent memory and session-continuity layer built on top of a local AI CLI — designed to solve the stateless AI problem across multiple concurrent projects.',
            description: 'Markdown-based memory architecture with keyword triggers, session dashboards, and skill pipelines for AI-assisted development.',
            techStack: 'Markdown,CLI Tooling,Prompt Engineering,Agent',
            featured: true,
            status: 'published',
            order: 3,
        },
    });

    // Blocks for BuzzyHive — tests heading + text with lists
    await prisma.contentBlock.createMany({
        data: [
            {
                projectId: buzzyhive.id,
                type: 'heading',
                order: 1,
                content: JSON.stringify({ level: 2, text: 'The Problem' }),
            },
            {
                projectId: buzzyhive.id,
                type: 'text',
                order: 2,
                content: JSON.stringify({
                    html: '<p>Traditional beehive monitoring relies on manual inspections — time-consuming, disruptive, and infrequent. BuzzyHive 2.0 solves this with continuous sensor data and ML-driven health predictions.</p>',
                }),
            },
            {
                projectId: buzzyhive.id,
                type: 'heading',
                order: 3,
                content: JSON.stringify({ level: 2, text: 'System Architecture' }),
            },
            {
                projectId: buzzyhive.id,
                type: 'text',
                order: 4,
                content: JSON.stringify({
                    html: '<ul><li>ESP32 reads temperature, humidity, weight, and smoke sensors every 30 seconds</li><li>Data sent via HTTP POST to Laravel API and stored in MySQL</li><li>HRI score computed from weighted sensor thresholds</li><li>ML model (Python) trained on historical logs to predict colony health</li><li>React dashboard renders live gauges via Recharts</li></ul>',
                }),
            },
        ],
    });

    // Blocks for Fantaz — tests list rendering fix specifically
    await prisma.contentBlock.createMany({
        data: [
            {
                projectId: fantaz.id,
                type: 'heading',
                order: 1,
                content: JSON.stringify({ level: 2, text: 'Memory Architecture' }),
            },
            {
                projectId: fantaz.id,
                type: 'text',
                order: 2,
                content: JSON.stringify({
                    html: '<ul><li>Typed memory files (user, feedback, project, reference) stored as structured markdown with frontmatter</li><li>MEMORY.md index with a keyword trigger map — relevant files load automatically when a topic is detected</li><li>Session dashboard tracks last project, blockers, and deadlines across sessions</li><li>Cold storage layer for heavy references loaded only when the topic arises</li></ul>',
                }),
            },
            {
                projectId: fantaz.id,
                type: 'heading',
                order: 3,
                content: JSON.stringify({ level: 2, text: 'Skill Pipelines' }),
            },
            {
                projectId: fantaz.id,
                type: 'text',
                order: 4,
                content: JSON.stringify({
                    html: '<p>Skills are markdown files with a frontmatter trigger condition. When the user types a slash command, the skill expands into a full prompt pipeline — keeping the main CLAUDE.md clean.</p>',
                }),
            },
        ],
    });

    // Blocks for Portfolio — tests heading renderer
    await prisma.contentBlock.createMany({
        data: [
            {
                projectId: portfolio.id,
                type: 'heading',
                order: 1,
                content: JSON.stringify({ level: 2, text: 'Stack' }),
            },
            {
                projectId: portfolio.id,
                type: 'text',
                order: 2,
                content: JSON.stringify({
                    html: '<ul><li><strong>Frontend:</strong> React 19 + Vite + Tailwind CSS v4 + Framer Motion</li><li><strong>Backend:</strong> Express + TypeScript + Prisma ORM</li><li><strong>Database:</strong> Azure SQL (Basic tier, Southeast Asia)</li><li><strong>Storage:</strong> Azure Blob Storage for images and resumes</li><li><strong>CI/CD:</strong> GitHub Actions → Azure App Service</li></ul>',
                }),
            },
        ],
    });

    await prisma.skill.createMany({
        data: [
            { name: 'TypeScript', category: 'Language', icon: 'SiTypescript', order: 1 },
            { name: 'React', category: 'Frontend', icon: 'SiReact', order: 2 },
            { name: 'Tailwind CSS', category: 'Frontend', icon: 'SiTailwindcss', order: 3 },
            { name: 'Node.js', category: 'Backend', icon: 'SiNodedotjs', order: 4 },
            { name: 'Express', category: 'Backend', icon: 'SiExpress', order: 5 },
            { name: 'Laravel', category: 'Backend', icon: 'SiLaravel', order: 6 },
            { name: 'Prisma', category: 'Backend', icon: 'SiPrisma', order: 7 },
            { name: 'MySQL', category: 'Database', icon: 'SiMysql', order: 8 },
            { name: 'Azure', category: 'DevOps', icon: 'SiMicrosoftazure', order: 9 },
            { name: 'GitHub Actions', category: 'DevOps', icon: 'SiGithubactions', order: 10 },
        ],
    });

    await prisma.experience.createMany({
        data: [
            {
                company: 'UTeM',
                role: 'Final Year Project — BuzzyHive 2.0',
                startDate: new Date('2025-09-01'),
                description: 'Designing and building a full IoT + ML beehive monitoring system. Covers hardware assembly, backend API, real-time dashboards, and machine learning pipeline.',
                current: true,
                order: 1,
            },
            {
                company: 'Self-initiated',
                role: 'Full-Stack Developer — Portfolio CMS',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-04-01'),
                description: 'Built a dynamic developer portfolio with a custom block-based CMS, Azure deployment, and full CI/CD pipeline via GitHub Actions.',
                current: false,
                order: 2,
            },
        ],
    });

    console.log('Seed complete.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
