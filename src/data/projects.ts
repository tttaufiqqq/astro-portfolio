export interface Project {
  slug: string;
  title: string;
  description: string;
  year: number;
  stack: string[];
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
}

const projects: Project[] = [
  {
    slug: "buzzyhive",
    title: "BuzzyHive 2.0",
    description:
      "IoT-based harvest readiness prediction system for kelulut (stingless bee) farming. ESP32 sensors stream live temperature, humidity, and smoke data to a Laravel backend. ML model classifies hive readiness. Power BI dashboard for analytics.",
    year: 2026,
    stack: ["Laravel", "React", "TypeScript", "Inertia.js", "MySQL", "ESP32", "Power BI"],
    tags: ["IoT", "Machine Learning", "Agriculture", "Full Stack"],
    liveUrl: "https://buzzyhive.urban-alert.com",
    featured: true,
  },
];

export default projects;
