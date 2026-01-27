"use client";

import { useState } from "react";
import { API_URL } from "../../services/api";

const TARGET_FORMATS = ["PDF", "DOCX", "XLSX", "PPTX", "JPG", "PNG", "TXT"];

interface ConversionJob {
    file: File;
    status: 'idle' | 'uploading' | 'converting' | 'success' | 'error';
    result?: {
        filename: string;
        download_url: string;
    };
    error?: string;
}

export default function UniversalConverter() {
    const [jobs, setJobs] = useState<ConversionJob[]>([]);
    const [targetFormat, setTargetFormat] = useState("PDF");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newJobs: ConversionJob[] = newFiles.map(file => ({
                file,
                status: 'idle'
            }));
            setJobs(prev => [...prev, ...newJobs]);
        }
    };

    const removeJob = (index: number) => {
        setJobs(prev => prev.filter((_, i) => i !== index));
    };

    const handleConvertAll = async () => {
        if (jobs.length === 0) return;
        setIsProcessing(true);

        const formData = new FormData();
        jobs.forEach(job => formData.append("files", job.file));
        formData.append("target_format", targetFormat);

        // Mark all as converting
        setJobs(prev => prev.map(job => ({ ...job, status: 'converting' })));

        try {
            const response = await fetch(`${API_URL}/converter/convert`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Conversion failed");

            const data = await response.json();

            // Map results back to jobs
            setJobs(prev => prev.map((job, idx) => {
                const result = data.conversions[idx];
                if (result.status === 'success') {
                    return {
                        ...job,
                        status: 'success',
                        result: {
                            filename: result.filename,
                            download_url: result.download_url
                        }
                    };
                } else {
                    return {
                        ...job,
                        status: 'error',
                        error: result.message
                    };
                }
            }));
        } catch (error: any) {
            setJobs(prev => prev.map(job => ({
                ...job,
                status: 'error',
                error: error.message
            })));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight">
                    Universal <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Document Converter</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    Convert between PDF, Office, and Images with high fidelity. Batch process multiple files instantly.
                </p>
            </div>

            {/* Main Selection Area */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-zinc-800 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Upload Zone */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Step 1: Upload Documents
                        </label>
                        <div className="relative group">
                            <input
                                type="file"
                                multiple
                                onChange={handleFilesAdded}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl p-10 text-center transition-all group-hover:border-blue-500 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">
                                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white">Click or drag files here</p>
                                <p className="text-sm text-gray-500">PDF, Word, Excel, Images, etc.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Format Target */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Step 2: Choose Target Format
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {TARGET_FORMATS.map(format => (
                                <button
                                    key={format}
                                    onClick={() => setTargetFormat(format)}
                                    className={`py-3 rounded-xl font-bold transition-all ${targetFormat === format
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-zinc-900"
                                        : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                        }`}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* File List/Queue */}
                {jobs.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 px-2 py-0.5 rounded text-sm">{jobs.length}</span>
                                Queue
                            </h3>
                            <button
                                onClick={handleConvertAll}
                                disabled={isProcessing}
                                className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${isProcessing
                                    ? "bg-gray-400 cursor-wait"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                                    }`}
                            >
                                {isProcessing ? "Converting..." : `Convert All to ${targetFormat}`}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {jobs.map((job, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800 group hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="bg-white dark:bg-zinc-700 p-2 rounded-lg shadow-sm">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="truncate">
                                            <p className="font-semibold text-gray-900 dark:text-white truncate">{job.file.name}</p>
                                            <p className="text-xs text-gray-500 uppercase">{(job.file.size / 1024 / 1024).toFixed(2)} MB • {job.status}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {job.status === 'success' && job.result && (
                                            <a
                                                href={`${API_URL}${job.result.download_url}`}
                                                download
                                                className="bg-green-100 dark:bg-green-900/30 text-green-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-600 hover:text-white transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </a>
                                        )}
                                        {job.status === 'error' && (
                                            <span className="text-red-500 text-sm font-medium">{job.error}</span>
                                        )}
                                        <button
                                            onClick={() => removeJob(idx)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Matrix View (Informational) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Smart OCR</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-500/80">Scanned documents are automatically reconstructed using AI.</p>
                </div>
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">High Fidelity</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-500/80">Layouts, fonts, and tables are preserved during conversion.</p>
                </div>
                <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                    <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-2">Secure</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-500/80">Files are processed in memory and never stored permanently.</p>
                </div>
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">Cloud-Ready</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-500/80">Fast processing even for large PowerPoint or PDF files.</p>
                </div>
            </div>
        </div>
    );
}
