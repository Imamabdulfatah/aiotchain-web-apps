"use client";

import Navbar from "@/components/Navbar";
import ResumeEditor from "@/components/ResumeEditor";
import { fetchAPI } from "@/lib/api";
import { getUserRole, isLoggedIn } from "@/lib/auth";
import { Award, Briefcase, Code, Cpu, Download, Edit2, ExternalLink, Github, Globe, Linkedin, Mail, Rocket, Star, Twitter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEFAULT_DATA = {
  hero: {
    name: "John Doe",
    role: "Expert Fullstack Engineer",
    intro: "Crafting premium digital experiences where Artificial Intelligence meets the precision of IoT.",
    socials: {
      twitter: "#",
      github: "#",
      linkedin: "#",
      mail: "mailto:hello@example.com"
    }
  },
  stats: [
    {"label": "Experience", "value": "5+ Years", "type": "experience"},
    {"label": "Projects Completed", "value": "40+", "type": "projects"},
    {"label": "Clients Globally", "value": "12", "type": "clients"},
    {"label": "Technologies", "value": "24+", "type": "tech"}
  ],
  experience: [
    {
      company: "TechInno Solutions",
      role: "Senior Fullstack Developer",
      period: "2023 - Present",
      description: "Leading the development of AI-driven IoT dashboard modules. Optimized data processing pipelines resulting in 40% faster real-time updates.",
      tags: ["Next.js", "Go", "MQTT"]
    },
    {
      company: "Digital Horizon Digital",
      role: "Frontend Specialist",
      period: "2021 - 2023",
      description: "Refactored legacy React applications into high-performance Next.js ecosystems. Mentored 5 junior developers in modern CSS methodologies.",
      tags: ["React", "Typescript", "Tailwind"]
    },
    {
      company: "SmartSystems Lab",
      role: "Backend Engineer Intern",
      period: "2020 - 2021",
      description: "Contributed to the development of microservices for smart city infrastructure. Improved API response times by implementation of Redis caching.",
      tags: ["Node.js", "Redis", "Docker"]
    }
  ],
  organizations: [
    {
      name: "Indonesian IoT Community",
      role: "Lead Technical Contributor",
      period: "2022 - Present",
      description: "Sharing insights on edge computing and organizing monthly webinars for 500+ members."
    },
    {
      name: "Open Source Collective",
      role: "Regional Ambassador",
      period: "2021 - 2023",
      description: "Promoting open source adoption and managing local hackathons for student developers."
    }
  ],
  skills: [
    {"name": "React / Next.js", "level": 95, "category": "frontend"},
    {"name": "TypeScript", "level": 90, "category": "frontend"},
    {"name": "Node.js / Express", "level": 85, "category": "backend"},
    {"name": "Go (Golang)", "level": 80, "category": "backend"},
    {"name": "Tailwind CSS", "level": 98, "category": "design"},
    {"name": "PostgreSQL / MongoDB", "level": 82, "category": "backend"},
    {"name": "Docker / Kubernetes", "level": 75, "category": "devops"},
    {"name": "UI/UX Design (Figma)", "level": 85, "category": "design"}
  ],
  certificates: [
    {"title": "Solutions Architect Associate", "issuer": "Amazon Web Services (AWS)", "date": "2023", "type": "aws"},
    {"title": "Google Cloud Professional Engineer", "issuer": "Google Cloud", "date": "2022", "type": "gcp"},
    {"title": "Certified Ethical Hacker (CEH)", "issuer": "EC-Council", "date": "2022", "type": "security"}
  ],
  projects: [
    {"title": "AIOT Chain Ecosystem", "category": "Core Development", "icon": "🌐"},
    {"title": "Smart City MQTT Grid", "category": "IoT Solution", "icon": "🏙️"}
  ]
};

export default function CVPage() {
  const [activeSegment, setActiveSegment] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(DEFAULT_DATA);
  const [isAuth, setIsAuth] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
    loadResume();
  }, []);

  const checkAuth = () => {
    const auth = isLoggedIn();
    setIsAuth(auth);
    if (auth) {
      setIsSuperAdmin(getUserRole() === "super_admin");
    }
  };

  const loadResume = async () => {
    try {
      const resume = await fetchAPI<{ data: string }>("/resume");
      if (resume && resume.data) {
        setData(JSON.parse(resume.data));
      }
    } catch (err) {
      console.log("Using default resume data");
    }
  };

  const handleSave = async (newData: any) => {
    try {
      await fetchAPI("/admin/resume", {
        method: "PUT",
        body: JSON.stringify({ data: JSON.stringify(newData) }),
      });
      setData(newData);
    } catch (err: any) {
      alert("Gagal menyimpan perubahan: " + err.message);
      throw err;
    }
  };

  if (!mounted) return null;

  const skillIcons: any = {
    "frontend": <Code className="w-5 h-5" />,
    "backend": <Globe className="w-5 h-5" />,
    "design": <Star className="w-5 h-5" />,
    "devops": <Rocket className="w-5 h-5" />,
    "default": <Cpu className="w-5 h-5" />
  };

  const statIcons: any = {
    "experience": <Briefcase className="w-5 h-5 text-blue-600"/>,
    "projects": <Star className="w-5 h-5 text-amber-500"/>,
    "clients": <Globe className="w-5 h-5 text-emerald-500"/>,
    "tech": <Cpu className="w-5 h-5 text-purple-600"/>
  };

  const certIcons: any = {
    "aws": <Award className="w-8 h-8 text-orange-500" />,
    "gcp": <Award className="w-8 h-8 text-blue-500" />,
    "security": <Award className="w-8 h-8 text-emerald-500" />,
    "default": <Award className="w-8 h-8 text-blue-600" />
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <Navbar />

      {isSuperAdmin && (
        <button
          onClick={() => setIsEditing(true)}
          className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        >
          <Edit2 className="w-6 h-6" />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Edit Resume Content
          </span>
        </button>
      )}

      {isEditing && (
        <ResumeEditor
          initialData={data}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="relative mb-32 flex flex-col md:flex-row items-center gap-16">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] -z-10 animate-bounce-slow"></div>

          <div className="relative group">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[4rem] bg-muted overflow-hidden ring-8 ring-background shadow-2xl transition-transform duration-1000 group-hover:scale-[1.02] group-hover:rotate-2 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-full h-full flex items-center justify-center text-8xl grayscale-0 group-hover:grayscale-0 transition-all font-sans">
                  👤
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 px-6 py-3 bg-white dark:bg-slate-900 text-foreground border border-border rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-1000">
               <span className="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
               <span className="text-[10px] font-black uppercase tracking-widest font-sans">Available for hire</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-8">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-600/5 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic font-sans">
                   {data.hero.role}
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tight leading-none font-sans">
                    {data.hero.name.split(' ')[0]} <span className="text-blue-600">{data.hero.name.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl font-sans">
                   {data.hero.intro}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-sans">
                <Link href="#" className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
                    Let's Build Something
                </Link>
                <button className="flex items-center gap-3 px-10 py-5 bg-card text-foreground border border-border rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-muted transition-all">
                    <Download className="w-4 h-4" /> Download CV
                </button>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8 pt-4 opacity-70">
                <a href={data.hero.socials.twitter} className="hover:text-blue-600 transition-colors"><Twitter className="w-6 h-6" /></a>
                <a href={data.hero.socials.github} className="hover:text-blue-600 transition-colors"><Github className="w-6 h-6" /></a>
                <a href={data.hero.socials.linkedin} className="hover:text-blue-600 transition-colors"><Linkedin className="w-6 h-6" /></a>
                <a href={data.hero.socials.mail} className="hover:text-blue-600 transition-colors"><Mail className="w-6 h-6" /></a>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
            {data.stats.map((stat: any, i: number) => (
                <div key={i} className="bg-card border border-border p-8 rounded-[3rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 font-sans">
                    <div className="mb-4">{statIcons[stat.type] || statIcons.experience}</div>
                    <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
            ))}
        </section>

        {/* EXPERIENCE */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16 font-sans">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Professional Journey</h2>
            </div>

            <div className="space-y-12">
                {data.experience.map((exp: any, i: number) => (
                    <div key={i} className="relative pl-12 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-1 before:bg-muted before:rounded-full group font-sans">
                        <div className="absolute left-[-6px] top-4 w-4 h-4 rounded-full bg-muted border-4 border-background group-hover:bg-blue-600 group-hover:scale-150 transition-all duration-500"></div>
                        <div className="bg-card border border-border p-8 md:p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-700">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">{exp.role}</h3>
                                    <p className="text-blue-600 dark:text-blue-400 font-bold italic">{exp.company}</p>
                                </div>
                                <span className="px-5 py-2 bg-muted text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest self-start md:self-auto font-sans">
                                    {exp.period}
                                </span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-lg mb-8 max-w-3xl">
                                {exp.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {exp.tags.map((tag: any, j: number) => (
                                    <span key={j} className="px-4 py-1.5 bg-background border border-border rounded-xl text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* ORGANIZATIONS */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16 font-sans">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Pengalaman Organisasi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                {data.organizations.map((org: any, i: number) => (
                    <div key={i} className="bg-card border border-border p-10 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-foreground group-hover:text-blue-600 transition-colors">{org.name}</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{org.role}</p>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 italic whitespace-nowrap">{org.period}</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed italic">
                           " {org.description} "
                        </p>
                    </div>
                ))}
            </div>
        </section>

        {/* SKILLS */}
        <section className="mb-32">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 font-sans">
                <div className="flex items-center gap-6">
                    <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                    <h2 className="text-4xl font-black text-foreground tracking-tight">Technical Arsenal</h2>
                </div>
                <div className="flex gap-2 font-sans font-bold">
                    {["all", "frontend", "backend", "design"].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveSegment(cat)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeSegment === cat ? "bg-blue-600 text-white shadow-lg" : "bg-muted text-muted-foreground hover:bg-card border border-transparent hover:border-border"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                {data.skills.filter((s: any) => activeSegment === "all" || s.category === activeSegment).map((skill: any, i: number) => (
                    <div key={i} className="bg-card border border-border p-8 rounded-[2.5rem] group hover:shadow-2xl transition-all duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {skillIcons[skill.category] || skillIcons.default}
                                </div>
                                <h4 className="font-black text-foreground tracking-tight">{skill.name}</h4>
                            </div>
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 italic">{skill.level}%</span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:scale-x-105"
                                style={{ width: `${skill.level}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* CERTIFICATES */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16 font-sans">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Sertifikat Keahlian</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
                {data.certificates.map((cert: any, i: number) => (
                    <div key={i} className="bg-card border border-border p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center group">
                        <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-blue-600/10 group-hover:scale-110 transition-all">
                            {certIcons[cert.type] || certIcons.default}
                        </div>
                        <h3 className="text-lg font-black text-foreground mb-2 leading-tight">{cert.title}</h3>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{cert.issuer}</p>
                        <span className="mt-auto px-4 py-1.5 bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest font-sans">
                            Issued: {cert.date}
                        </span>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16 font-sans">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Featured Creations</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-sans">
                {data.projects.map((p: any, i: number) => (
                    <div key={i} className="relative aspect-[16/10] bg-muted rounded-[4rem] overflow-hidden group border border-border">
                        <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                            {p.icon}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent p-12 flex flex-col justify-end">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">{p.category}</span>
                            <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{p.title}</h3>
                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <button className="p-4 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                                <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:scale-110 transition-transform">
                                    <Github className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* CTA BOX */}
        <section className="bg-blue-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20 font-sans">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -z-0"></div>
            <div className="relative z-10 space-y-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                    Interested in starting <br /> a project together?
                </h2>
                <p className="text-blue-100 text-lg font-medium max-w-xl mx-auto opacity-80">
                    I'm currently accepting new freelance projects and full-time opportunities. Send me a message and I'll get back to you within 24 hours.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <Link href="#" className="px-12 py-6 bg-white text-blue-600 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-110 hover:shadow-2xl transition-all">
                        Let's Talk Business
                    </Link>
                    <a href={data.hero.socials.mail} className="text-white hover:underline decoration-white/30 underline-offset-8 font-black text-xs uppercase tracking-widest">
                        {data.hero.socials.mail.startsWith('mailto:') ? data.hero.socials.mail.split(':')[1] : data.hero.socials.mail}
                    </a>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border text-center font-sans">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
           © 2026 {data.hero.name} Portfolio • Built with Next.js & AIoT Soul
        </p>
      </footer>
    </div>
  );
}
