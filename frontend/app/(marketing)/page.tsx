"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    FileText,
    Shield,
    Zap,
    Workflow,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Search,
    MessageSquare,
    FileSearch,
    Layers,
    Scissors,
    Rocket
} from "lucide-react";

export default function Home() {
    const features = [
        { title: "AI Summarization", desc: "Instantly extract key insights from long PDFs.", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
        { title: "Smart Edits", desc: "Modify text and objects with original font matching.", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Encryption", desc: "Secure your documents with bank-grade protection.", icon: Shield, color: "text-rose-500", bg: "bg-rose-500/10" },
        { title: "Batch Actions", desc: "Merge, split, and convert hundreds of files at once.", icon: Workflow, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--primary-glow)_0%,_transparent_70%)] opacity-30 pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8 animate-float">
                            <Sparkles className="w-4 h-4" />
                            <span>Next-Gen Document Intelligence</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.05]">
                            Document Work <br />
                            <span className="gradient-text tracking-tighter">— Automated.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-secondary font-medium mb-12">
                            The ultimate AI platform for your documents. Merge, split, summarize, and edit with professional precision in one seamless workspace.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                href="/dashboard"
                                className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary/40 hover:scale-105 transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started for Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                            <Link
                                href="/tools/converter"
                                className="px-8 py-4 glass text-foreground rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors"
                            >
                                Explore All Tools
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="premium-card p-8 rounded-3xl glass border-none shadow-sm"
                            >
                                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                                <p className="text-secondary font-medium text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Stats */}
            <section className="py-20 border-y border-glass-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Daily Processing", value: "50k+" },
                            { label: "Uptime", value: "99.9%" },
                            { label: "Encryption", value: "AES-256" },
                            { label: "AI Models", value: "Pro" },
                        ].map((stat, idx) => (
                            <div key={idx}>
                                <div className="text-4xl font-black mb-2 gradient-text">{stat.value}</div>
                                <div className="text-xs uppercase tracking-widest font-black text-secondary">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sub-Feature Section */}
            <section className="py-24 px-6 bg-secondary/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative aspect-video rounded-3xl overflow-hidden glass shadow-2xl border-none p-4">
                            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                                <Zap className="w-20 h-20 text-primary animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                            Built for Speed.<br />Designed for Professionals.
                        </h2>
                        <div className="space-y-6">
                            {[
                                "No Registration required for basic tools.",
                                "End-to-End Encryption on every upload.",
                                "Privacy First: Files auto-deleted after 2 hours.",
                                "Multi-format support (PDF, DOCX, ZIP, MP4)."
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-3 h-3 text-primary" />
                                    </div>
                                    <p className="font-bold text-secondary">{item}</p>
                                </div>
                            ))}
                        </div>
                        <Link
                            href="/dashboard"
                            className="mt-12 inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-2xl font-bold hover:scale-105 transition-transform"
                        >
                            Start Processing Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer (Simplified) */}
            <footer className="py-20 px-6 border-t border-glass-border">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-2">
                        <Rocket className="text-primary w-6 h-6" />
                        <span className="text-2xl font-black tracking-tighter">SmartDoc AI</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-secondary">
                        <Link href="#" className="hover:text-primary">Terms</Link>
                        <Link href="#" className="hover:text-primary">Privacy</Link>
                        <Link href="#" className="hover:text-primary">API Documentation</Link>
                        <Link href="#" className="hover:text-primary">Support</Link>
                    </div>
                    <p className="text-xs font-bold text-gray-400">© 2026 SmartDoc AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
