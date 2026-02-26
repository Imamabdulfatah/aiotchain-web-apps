"use client";

import Navbar from "@/components/Navbar";
import { Award, Briefcase, Code, Cpu, Download, ExternalLink, Github, Globe, Linkedin, Mail, Rocket, ShieldCheck, Star, Twitter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CVPage() {
  const [activeSegment, setActiveSegment] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const skills = [
    { name: "React / Next.js", level: 95, icon: <Code className="w-5 h-5" />, category: "frontend" },
    { name: "TypeScript", level: 90, icon: <Cpu className="w-5 h-5" />, category: "frontend" },
    { name: "Node.js / Express", level: 85, icon: <Globe className="w-5 h-5" />, category: "backend" },
    { name: "Go (Golang)", level: 80, icon: <ShieldCheck className="w-5 h-5" />, category: "backend" },
    { name: "Tailwind CSS", level: 98, icon: <Star className="w-5 h-5" />, category: "design" },
    { name: "PostgreSQL / MongoDB", level: 82, icon: <ExternalLink className="w-5 h-5" />, category: "backend" },
    { name: "Docker / Kubernetes", level: 75, icon: <Rocket className="w-5 h-5" />, category: "devops" },
    { name: "UI/UX Design (Figma)", level: 85, icon: <Award className="w-5 h-5" />, category: "design" },
  ];

  const experience = [
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
  ];

  const organizations = [
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
  ];

  const professionalCertificates = [
    {
      title: "Solutions Architect Associate",
      issuer: "Amazon Web Services (AWS)",
      date: "2023",
      icon: <Award className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Google Cloud Professional Engineer",
      issuer: "Google Cloud",
      date: "2022",
      icon: <Award className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Certified Ethical Hacker (CEH)",
      issuer: "EC-Council",
      date: "2022",
      icon: <Award className="w-8 h-8 text-emerald-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* HERO SECTION - Premium Personal Branding */}
        <section className="relative mb-32 flex flex-col md:flex-row items-center gap-16">
          {/* Abstract Decorations */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] -z-10 animate-bounce-slow"></div>

          {/* Avatar Container */}
          <div className="relative group">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[4rem] bg-muted overflow-hidden ring-8 ring-background shadow-2xl transition-transform duration-1000 group-hover:scale-[1.02] group-hover:rotate-2 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-full h-full flex items-center justify-center text-8xl grayscale-0 group-hover:grayscale-0 transition-all">
                  👤
                </div>
            </div>
            {/* Status Badge */}
            <div className="absolute -bottom-4 -right-4 px-6 py-3 bg-white dark:bg-slate-900 text-foreground border border-border rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-1000">
               <span className="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">Available for hire</span>
            </div>
          </div>

          {/* Intro Text */}
          <div className="flex-1 text-center md:text-left space-y-8">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-600/5 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic">
                   Expert Fullstack Engineer
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tight leading-none">
                    John <span className="text-blue-600">Doe</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                    Crafting <span className="text-foreground font-bold italic underline decoration-blue-500/30">premium digital experiences</span> where Artificial Intelligence meets the precision of IoT.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link href="/contact" className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
                    Let's Build Something
                </Link>
                <button className="flex items-center gap-3 px-10 py-5 bg-card text-foreground border border-border rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-muted transition-all">
                    <Download className="w-4 h-4" /> Download CV
                </button>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8 pt-4 opacity-70">
                <a href="#" className="hover:text-blue-600 transition-colors"><Twitter className="w-6 h-6" /></a>
                <a href="#" className="hover:text-blue-600 transition-colors"><Github className="w-6 h-6" /></a>
                <a href="#" className="hover:text-blue-600 transition-colors"><Linkedin className="w-6 h-6" /></a>
                <a href="#" className="hover:text-blue-600 transition-colors"><Mail className="w-6 h-6" /></a>
            </div>
          </div>
        </section>

        {/* STATS BREADCRUMBS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
            {[
                { label: "Experience", value: "5+ Years", icon: <Briefcase className="w-5 h-5 text-blue-600"/> },
                { label: "Projects Completed", value: "40+", icon: <Star className="w-5 h-5 text-amber-500"/> },
                { label: "Clients Globally", value: "12", icon: <Globe className="w-5 h-5 text-emerald-500"/> },
                { label: "Technologies", value: "24+", icon: <Cpu className="w-5 h-5 text-purple-600"/> }
            ].map((stat, i) => (
                <div key={i} className="bg-card border border-border p-8 rounded-[3rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                    <div className="mb-4">{stat.icon}</div>
                    <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
            ))}
        </section>

        {/* EXPERIENCE TIMELINE */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Professional Journey</h2>
            </div>

            <div className="space-y-12">
                {experience.map((exp, i) => (
                    <div key={i} className="relative pl-12 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-1 before:bg-muted before:rounded-full group">
                        <div className="absolute left-[-6px] top-4 w-4 h-4 rounded-full bg-muted border-4 border-background group-hover:bg-blue-600 group-hover:scale-150 transition-all duration-500"></div>
                        <div className="bg-card border border-border p-8 md:p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-700">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">{exp.role}</h3>
                                    <p className="text-blue-600 dark:text-blue-400 font-bold italic">{exp.company}</p>
                                </div>
                                <span className="px-5 py-2 bg-muted text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest self-start md:self-auto">
                                    {exp.period}
                                </span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-lg mb-8 max-w-3xl">
                                {exp.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {exp.tags.map((tag, j) => (
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

        {/* ORGANISASI SECTION */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Pengalaman Organisasi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {organizations.map((org, i) => (
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

        {/* SKILLS VISUALIZATION */}
        <section className="mb-32">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                    <h2 className="text-4xl font-black text-foreground tracking-tight">Technical Arsenal</h2>
                </div>
                <div className="flex gap-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skills.filter(s => activeSegment === "all" || s.category === activeSegment).map((skill, i) => (
                    <div key={i} className="bg-card border border-border p-8 rounded-[2.5rem] group hover:shadow-2xl transition-all duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {skill.icon}
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

        {/* SERTIFIKAT KEAHLIAN SECTION */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Sertifikat Keahlian</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {professionalCertificates.map((cert, i) => (
                    <div key={i} className="bg-card border border-border p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center group">
                        <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-blue-600/10 group-hover:scale-110 transition-all">
                            {cert.icon}
                        </div>
                        <h3 className="text-lg font-black text-foreground mb-2 leading-tight">{cert.title}</h3>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{cert.issuer}</p>
                        <span className="mt-auto px-4 py-1.5 bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Issued: {cert.date}
                        </span>
                    </div>
                ))}
            </div>
        </section>

        {/* FEATURED PROJECTS PREVIEW */}
        <section className="mb-32">
            <div className="flex items-center gap-6 mb-16">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Featured Creations</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    { title: "AIOT Chain Ecosystem", category: "Core Development", icon: "🌐" },
                    { title: "Smart City MQTT Grid", category: "IoT Solution", icon: "🏙️" }
                ].map((p, i) => (
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
        <section className="bg-blue-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -z-0"></div>
            <div className="relative z-10 space-y-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                    Interested in starting <br /> a project together?
                </h2>
                <p className="text-blue-100 text-lg font-medium max-w-xl mx-auto opacity-80">
                    I'm currently accepting new freelance projects and full-time opportunities. Send me a message and I'll get back to you within 24 hours.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <Link href="/contact" className="px-12 py-6 bg-white text-blue-600 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-110 hover:shadow-2xl transition-all">
                        Let's Talk Business
                    </Link>
                    <a href="mailto:hello@example.com" className="text-white hover:underline decoration-white/30 underline-offset-8 font-black text-xs uppercase tracking-widest">
                        hello@example.com
                    </a>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border text-center">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
           © 2026 John Doe Portfolio • Built with Next.js & AIoT Soul
        </p>
      </footer>
    </div>
  );
}
