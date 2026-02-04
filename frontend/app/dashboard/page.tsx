"use client";

import ToolCard from "../components/ToolCard";
import HealthStatus from "../components/HealthStatus";
import { motion } from "framer-motion";
import {
    Sparkles,
    FileText,
    Shield,
    Scissors,
    Image as ImageIcon,
    Video,
    Zap,
    Search,
    RefreshCw,
    MessageSquare,
    ClipboardList,
    PlusCircle,
    ArrowRight
} from "lucide-react";

export default function DashboardPage() {
    const categories = [
        {
            name: "AI Document Intelligence",
            description: "Advanced AI tools to analyze, summarize, and automate your workflow.",
            tools: [
                {
                    title: "Summarize PDF",
                    description: "Instantly extract key insights and action items with AI.",
                    href: "/tools/summarize",
                    color: "bg-purple-600",
                    icon: <MessageSquare className="w-6 h-6" />
                },
                {
                    title: "Chat with PDF",
                    description: "Interactive AI assistant to answer questions about any doc.",
                    href: "/tools/chat",
                    color: "bg-green-600",
                    icon: <Search className="w-6 h-6" />
                },
                {
                    title: "AI Report Generator",
                    description: "Turn raw data and documents into professional reports.",
                    href: "/tools/report",
                    color: "bg-slate-700",
                    icon: <ClipboardList className="w-6 h-6" />
                },
                {
                    title: "Handwriting to Text",
                    description: "State-of-the-art OCR to digitize handwritten docs.",
                    href: "/tools/recreate",
                    color: "bg-indigo-600",
                    icon: <Sparkles className="w-6 h-6" />
                }
            ]
        },
        {
            name: "Expert PDF Tools",
            description: "Everything you need to manage and secure your PDF documents.",
            tools: [
                {
                    title: "AI PDF Editor",
                    description: "Edit text, images, and layout directly in your browser.",
                    href: "/tools/edit-pdf",
                    color: "bg-amber-600",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Universal Converter",
                    description: "Switch between any document format with 100% accuracy.",
                    href: "/tools/converter",
                    color: "bg-blue-600",
                    icon: <RefreshCw className="w-6 h-6" />
                },
                {
                    title: "Protect PDF",
                    description: "Secure sensitivity with AES-256 encryption & passwords.",
                    href: "/tools/protect",
                    color: "bg-blue-500",
                    icon: <Shield className="w-6 h-6" />
                },
                {
                    title: "Merge & Split",
                    description: "Combine multiple docs or extract specific pages.",
                    href: "/tools/merge",
                    color: "bg-orange-500",
                    icon: <Scissors className="w-6 h-6" />
                }
            ]
        },
        {
            name: "Media & Optimization",
            description: "Smart compression and creation tools for your visual assets.",
            tools: [
                {
                    title: "Compress Video",
                    description: "Reduce file size without losing visual quality.",
                    href: "/tools/compress-video",
                    color: "bg-teal-600",
                    icon: <Video className="w-6 h-6" />
                },
                {
                    title: "Compress Image",
                    description: "Optimize JPEG/PNG for web use instantly.",
                    href: "/tools/compress-image",
                    color: "bg-pink-600",
                    icon: <ImageIcon className="w-6 h-6" />
                },
                {
                    title: "Create PDF",
                    description: "Write, format, and export new PDF documents.",
                    href: "/tools/create-pdf",
                    color: "bg-rose-600",
                    icon: <PlusCircle className="w-6 h-6" />
                }
            ]
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pt-16 md:pt-24 pb-20">
            <HealthStatus />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] md:text-xs mb-4"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Professional Workspace</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight"
                        >
                            Every tool you need.<br />
                            <span className="gradient-text tracking-tighter">— Optimized.</span>
                        </motion.h1>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-md text-secondary font-medium text-sm md:text-base"
                    >
                        Welcome back! Select a specialized tool below to start processing your documents with next-gen AI precision.
                    </motion.p>
                </div>

                {/* Categories */}
                <div className="space-y-16 md:space-y-24">
                    {categories.map((category, catIdx) => (
                        <div key={category.name}>
                            <div className="flex items-center justify-between mb-6 md:mb-10 border-b border-glass-border pb-4 md:pb-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-foreground mb-1">
                                        {category.name}
                                    </h2>
                                    <p className="text-secondary font-medium text-xs md:text-sm">
                                        {category.description}
                                    </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs font-black text-secondary hover:text-primary cursor-pointer transition-colors">
                                    View All <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>

                            <motion.div
                                variants={container}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
                            >
                                {category.tools.map((tool) => (
                                    <motion.div key={tool.title} variants={item}>
                                        <ToolCard {...tool} />
                                    </motion.div>
                                ))}
                                {catIdx === 0 && (
                                    <motion.div variants={item} className="hidden lg:flex items-center justify-center p-8 border-2 border-dashed border-glass-border rounded-[2rem] hover:border-primary/50 transition-colors cursor-pointer group">
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                                                <PlusCircle className="w-6 h-6 text-secondary group-hover:text-primary" />
                                            </div>
                                            <span className="text-xs font-black text-secondary uppercase tracking-widest">More Coming Soon</span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
