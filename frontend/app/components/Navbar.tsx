"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, LayoutDashboard, Languages, Menu, X, Rocket } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide Navbar on Dashboard and Tool pages to prevent overlap
    if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/tools")) {
        return null;
    }

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/tools/converter", label: "Converter", icon: Languages },
        { href: "/tools/edit-pdf", label: "AI Editor", icon: FileText },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl transition-all duration-500 rounded-2xl ${isScrolled ? "glass shadow-xl py-2 px-6" : "bg-transparent py-4 px-4"
                }`}
        >
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        <Rocket className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        SmartDoc <span className="gradient-text">AI</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1 bg-background/50 p-1 rounded-xl glass border-none">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive
                                    ? "text-primary"
                                    : "text-secondary hover:text-foreground"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="px-5 py-2.5 bg-foreground text-background rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg"
                    >
                        Try Professional →
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 glass rounded-xl overflow-hidden border-none"
                    >
                        <div className="flex flex-col p-4 gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-sm font-bold"
                                >
                                    <link.icon className="w-5 h-5 text-primary" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
