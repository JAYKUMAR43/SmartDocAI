"use client";

import { useState } from "react";
import { uploadFile } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Cloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function FileUpload({ onUploadComplete, accept }: { onUploadComplete: (data: { file_id: string, filename: string, file: File }) => void, accept?: string }) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processFile = async (file: File) => {
        setUploading(true);
        setError(null);

        try {
            const data = await uploadFile(file);
            onUploadComplete({ ...data, file });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleCloudUpload = (provider: string) => {
        alert(`${provider} integration coming soon!`);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <motion.div
                initial={false}
                animate={{
                    scale: dragActive ? 1.02 : 1,
                    borderColor: dragActive ? "var(--primary)" : "var(--glass-border)",
                    backgroundColor: dragActive ? "rgba(79, 70, 229, 0.05)" : "var(--glass-bg)"
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center w-full min-h-[320px] border-4 border-dashed rounded-[2.5rem] cursor-pointer transition-colors glass shadow-sm overflow-hidden`}
            >
                <div className="flex flex-col items-center justify-center p-10 text-center relative z-10 w-full">
                    <AnimatePresence mode="wait">
                        {uploading ? (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Processing File...</h3>
                                <p className="text-sm font-bold text-secondary">Our AI is preparing your document for the next step.</p>

                                <div className="w-64 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full mt-8 overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "100%" }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        className="w-full h-full bg-primary"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center"
                            >
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 shadow-xl ${dragActive ? 'bg-primary text-white scale-110 rotate-6 shadow-primary/20' : 'bg-primary/10 text-primary'
                                    }`}>
                                    <Upload className="w-10 h-10" />
                                </div>

                                <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight leading-none">
                                    <span className="text-primary">Click to upload</span> <br />
                                    <span className="text-secondary/50 font-medium text-lg">or drag and drop your file here</span>
                                </h3>

                                <p className="text-xs font-black text-secondary tracking-widest uppercase opacity-40">
                                    PDF, DOCX, ZIP, MP4 (MAX. 50MB)
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <input
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept={accept}
                    disabled={uploading}
                    id="file-upload-input"
                />

                {!uploading && (
                    <label htmlFor="file-upload-input" className="absolute inset-0 cursor-pointer z-20" />
                )}

                {/* Decorative Elements */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
            </motion.div>

            {/* Cloud Integrations */}
            {!uploading && (
                <div className="flex flex-col items-center gap-6 pt-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="h-[1px] flex-1 bg-glass-border" />
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Remote Sources</span>
                        <div className="h-[1px] flex-1 bg-glass-border" />
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleCloudUpload('Google Drive')}
                            className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-foreground glass hover:bg-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95 group shadow-sm border-none"
                        >
                            <div className="w-6 h-6 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <svg className="w-full h-full" viewBox="0 0 87.3 78"><path d="M6.6 66.85l25.3-43.8 23.2 38.2H9.06c-3.1 0-4.8 1.9-2.46 5.6z" fill="#0066da" /><path d="M23.9 13L0 55.4l8.3 14.5L34.1 27.2c2.4-4 1.1-14.2-10.2-14.2z" fill="#00ac47" /><path d="M87.3 26.5L62 72.15c-3.7 6.3-10.5 5.85-13.6 0l-25.1-45.65z" fill="#ea4335" /><path d="M22.1 21.4l20.3-35.1c2-3.46 6.1-3.46 8.1 0l18.4 35.1H34.4c-8.9 0-11.4 0-12.3 0z" fill="#ffba00" /></svg>
                            </div>
                            Google Drive
                        </button>
                        <button
                            onClick={() => handleCloudUpload('Dropbox')}
                            className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-foreground glass hover:bg-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95 group shadow-sm border-none"
                        >
                            <div className="w-6 h-6 flex items-center justify-center group-hover:-rotate-12 transition-transform">
                                <svg className="w-full h-full text-[#0061FE]" fill="currentColor" viewBox="0 0 24 24"><path d="M6 2L1 6.5L6 11L11 6.5L6 2ZM18 2L13 6.5L18 11L23 6.5L18 2ZM1 17.5L6 22L11 17.5L6 13L1 17.5ZM18 13L13 17.5L18 22L23 17.5L18 13ZM11 11L6 6.5L11 2L13 2L18 6.5L13 11L18 15.5L13 20L11 20L6 15.5L11 11Z" /></svg>
                            </div>
                            Dropbox
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 justify-center font-bold text-sm"
                >
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </motion.div>
            )}
        </div>
    );
}
