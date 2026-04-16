import {
  Github,
  Linkedin,
  Mail,
  Layout,
  Server,
  Terminal,
  Cpu,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const SKILLS = [
  {
    category: "Frontend",
    icon: Layout,
    items: ["React", "TypeScript", "Tailwind CSS", "Inertia.js", "Recharts"],
    color: "tiffany-blue",
  },
  {
    category: "Backend",
    icon: Server,
    items: ["Laravel", "PHP", "MySQL", "REST API", "Pest"],
    color: "midnight-green",
  },
  {
    category: "Hardware & IoT",
    icon: Cpu,
    items: ["ESP32", "Sensor Integration", "HTTP POST", "Arduino IDE"],
    color: "gamboge",
  },
  {
    category: "Tools & DevOps",
    icon: Terminal,
    items: ["Git", "GitHub Actions", "Azure", "Power BI", "CI/CD"],
    color: "alloy-orange",
  },
];

export const PROJECTS = [
  {
    title: "BuzzyHive 2.0",
    description:
      "IoT-based harvest readiness prediction system for kelulut (stingless bee) farming. ESP32 sensors stream live temperature, humidity, and smoke data to a Laravel backend. ML model classifies hive readiness. Power BI dashboard for analytics.",
    tags: ["IoT", "Laravel", "React", "ML", "Power BI"],
    link: "https://github.com/tttaufiqqq",
    liveUrl: "https://buzzyhive.urban-alert.com",
    color: "blue-munsell",
  },
];

export const SOCIAL_LINKS = [
  { icon: Github, href: "https://github.com/tttaufiqqq", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/taufiq", label: "LinkedIn" },
  { icon: Mail, href: "mailto:taufiq33992@gmail.com", label: "Email" },
];
