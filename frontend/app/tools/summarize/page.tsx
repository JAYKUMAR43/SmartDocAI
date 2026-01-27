"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import { summarizeDocument } from "../../services/api";

export default function SummarizePage() {
    const [fileId, setFileId] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleSummarize = async () => {
        if (!fileId) return;
        setLoading(true);
        try {
            const data = await summarizeDocument(fileId);
            setSummary(data.summary);
        } catch (error) {
            console.error("Summarization failed", error);
            alert("Summarization failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Summarize PDF</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Use AI to generate a concise summary of your document.</p>
            </div>

            <FileUpload onUploadComplete={(data) => { setFileId(data.file_id); setUploadSuccess(true); }} />

            {uploadSuccess && !summary && !loading && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg animate-fade-in text-center">
                    Document uploaded! Ready to summarize.
                </div>
            )}

            {fileId && !summary && (
                <div className="flex justify-center">
                    <button
                        onClick={handleSummarize}
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? "Summarizing..." : "Summarize with AI"}
                    </button>
                </div>
            )}

            {summary && (
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Summary</h2>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">{summary}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
