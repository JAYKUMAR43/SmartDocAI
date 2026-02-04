import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    href: string;
    color: string;
}

export default function ToolCard({ title, description, icon, href, color }: ToolCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
        >
            <Link
                href={href}
                className="group relative flex flex-col h-full p-6 md:p-8 rounded-3xl md:rounded-[2rem] glass border-none shadow-sm transition-all hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
            >
                {/* Background Accent */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`} />

                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-black/5 ${color} text-white`}>
                    {icon}
                </div>

                <h3 className="text-lg md:text-xl font-black text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors">
                    {title}
                </h3>

                <p className="text-xs md:text-sm font-medium text-secondary leading-relaxed mb-4 md:mb-6 flex-1">
                    {description}
                </p>

                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    Open Tool <ArrowRight className="w-4 h-4" />
                </div>
            </Link>
        </motion.div>
    );
}
