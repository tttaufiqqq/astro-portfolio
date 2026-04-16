import { motion } from "motion/react";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { NAV_LINKS, SKILLS, PROJECTS, SOCIAL_LINKS } from "./constants";

export default function App() {
  return (
    <div className="layout-grid bg-c0 text-c4 font-sans selection:bg-c5 selection:text-c0">
      {/* Header */}
      <header className="theme-header">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-2xl font-bold text-c3"
        >
          taufiq.dev
        </motion.div>
        <nav className="flex gap-6">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-xs uppercase tracking-[2px] text-c5 hover:text-c3 transition-colors"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>
      </header>

      {/* Sidebar */}
      <aside className="theme-sidebar">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-[32px] leading-[1.1] font-bold text-c5 mb-2">
            Full Stack<br />+ IoT<br />Developer
          </h1>
          <p className="font-mono text-sm text-c2">IT Undergrad @ UTeM</p>
        </motion.div>

        <div>
          <div className="text-[10px] uppercase tracking-[2px] text-c1 font-extrabold mb-3">Stack</div>
          <div className="flex flex-wrap gap-2">
            {SKILLS.flatMap(s => s.items).slice(0, 10).map((skill) => (
              <span key={skill} className="text-[11px] px-2.5 py-1 bg-c1 text-c3 rounded font-mono">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="text-[10px] uppercase tracking-[2px] text-c1 font-extrabold mb-3">Connect</div>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-c2 hover:text-c5 transition-colors"
                aria-label={social.label}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="theme-main">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-c1/10 border border-c1 p-6 flex flex-col justify-between group hover:border-c2 transition-colors"
          >
            <div>
              <h3 className="text-lg font-semibold text-c4 mb-2 group-hover:text-c5 transition-colors">
                {project.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-c3 opacity-80">
                {project.description}
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {project.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-mono text-c2">{tag}</span>
                ))}
              </div>
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-c5 flex items-center gap-1 hover:text-c3 transition-colors"
                  >
                    Live <ExternalLink size={12} />
                  </a>
                )}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-c6 flex items-center gap-1 hover:text-c5 transition-colors"
                >
                  Source <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </main>

      {/* Footer */}
      <footer className="theme-footer">
        <div className="text-xs font-bold text-c0 uppercase tracking-wider">
          Available for Internship / 2026
        </div>
        <div className="bg-c0 text-c4 px-4 py-1.5 rounded-full text-[11px] font-mono border border-c1/50">
          taufiq33992@gmail.com
        </div>
      </footer>
    </div>
  );
}
