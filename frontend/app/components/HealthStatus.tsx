"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

import { API_URL } from "../services/api";

export default function HealthStatus() {
    const [isOnline, setIsOnline] = useState<boolean | null>(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch(`${API_URL}/health`);
                setIsOnline(res.ok);
            } catch (e) {
                setIsOnline(false);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    if (isOnline === null) return null;

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
                >
                    <div className="flex items-center gap-4 px-6 py-4 bg-rose-500 text-white rounded-[2rem] shadow-2xl shadow-rose-500/30 font-bold border-none">
                        <AlertTriangle className="w-6 h-6 animate-bounce" />
                        <div className="flex flex-col">
                            <span className="text-sm">Connection Lost</span>
                            <span className="text-[10px] opacity-80 uppercase tracking-widest font-black">Backend Offline • Check server console</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {isOnline && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed bottom-8 left-8 z-[200]"
                >
                    <div className="flex items-center gap-3 px-4 py-2 glass rounded-full shadow-lg border-none">
                        <div className="relative">
                            <Wifi className="w-4 h-4 text-emerald-500" />
                            <div className="absolute inset-0 bg-emerald-500 blur-sm rounded-full animate-pulse opacity-50" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Secure • Online</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
