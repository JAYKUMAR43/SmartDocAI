"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import { generateReport } from "../../services/api";

const MarkdownDisplay = ({ content }: { content: string }) => (
    <div className="prose dark:prose-invert max-w-none p-8 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">{content}</pre>
    </div>
);

export default function ReportPage() {
    const [fileId, setFileId] = useState<string | null>(null);
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!fileId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await generateReport(fileId);
            setReport(data.report);
        } catch (err) {
            console.error(err);
            setError("Failed to generate report. Ensure you uploaded a PDF.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Report Generator</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Transform your documents into professional business reports.</p>
            </div>

            <FileUpload onUploadComplete={(data) => { setFileId(data.file_id); setUploadSuccess(true); }} />

            {uploadSuccess && !report && !loading && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg animate-fade-in text-center">
                    File uploaded successfully!
                </div>
            )}

            {fileId && !report && (
                <div className="flex flex-col items-center space-y-4">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:shadow-lg transform transition hover:-translate-y-1 disabled:opacity-50"
                    >
                        {loading ? "Analyzing Document..." : "Generate Professional Report"}
                    </button>
                    {loading && <p className="text-sm text-gray-500 animate-pulse">AI is reading and formatting your report...</p>}
                </div>
            )}

            {error && <p className="text-center text-red-500">{error}</p>}

            {report && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Generated with Gemini Pro</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(report)}
                            className="px-4 py-2 text-sm bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600 transition"
                        >
                            Copy Report
                        </button>
                    </div>
                    <MarkdownDisplay content={report} />
                </div>
            )}
        </div>
    );
}
