"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import CameraCapture from "../../components/CameraCapture";
import { recreateDocument, uploadFile, createDocumentFromContent, API_URL } from "../../services/api";

// Simple Markdown display if package not available, or use a pre-tag
const MarkdownDisplay = ({ content }: { content: string }) => (
    <div className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
        <pre className="whitespace-pre-wrap font-sans">{content}</pre>
    </div>
);

export default function RecreatePage() {
    const [fileId, setFileId] = useState<string | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRecreate = async () => {
        if (!fileId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await recreateDocument(fileId);
            setContent(data.content);
        } catch (err) {
            console.error(err);
            setError("Failed to recreate document. Ensure you uploaded an image (JPG, PNG).");
        } finally {
            setLoading(false);
        }
    };

    const handleCapture = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Upload the captured photo
            const data = await uploadFile(file);
            setFileId(data.file_id);
            setUploadSuccess(true);
            setLoading(true); // Keep loading for recreate
            // 2. Automatically recreate (optional, but good UX)
            const recreateData = await recreateDocument(data.file_id);
            setContent(recreateData.content);
        } catch (err) {
            console.error(err);
            setError("Failed to process captured photo.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format: "docx" | "pdf") => {
        if (!content) return;
        setDownloading(true);
        try {
            const data = await createDocumentFromContent(content, format);
            // Trigger download
            const link = document.createElement('a');
            link.href = `${API_URL}${data.download_url}`;
            link.download = `handwriting_converted.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Download failed.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Handwriting to Word</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Upload an image of a document, AI will convert it to editable text.</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <FileUpload onUploadComplete={(data) => { setFileId(data.file_id); setUploadSuccess(true); }} accept="image/*,.pdf" />
                <div className="text-gray-400 text-sm">- OR -</div>
                <CameraCapture onCapture={handleCapture} />
            </div>

            {uploadSuccess && !content && !loading && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg animate-fade-in">
                    Image uploaded successfully! Ready to convert.
                </div>
            )}

            {fileId && !content && !loading && (
                <div className="flex flex-col items-center space-y-4">
                    <button
                        onClick={handleRecreate}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transform transition hover:-translate-y-1 disabled:opacity-50"
                    >
                        {loading ? "Converting Handwriting..." : "✨ Convert to Text"}
                    </button>
                    {loading && <p className="text-sm text-gray-500 animate-pulse">This may take a few seconds...</p>}
                </div>
            )}

            {error && <p className="text-center text-red-500">{error}</p>}

            {content && (
                <div className="space-y-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Converted Text</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDownload("docx")}
                                disabled={downloading}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Word
                            </button>
                            <button
                                onClick={() => handleDownload("pdf")}
                                disabled={downloading}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download PDF
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(content)}
                                className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600"
                            >
                                Copy Text
                            </button>
                        </div>
                    </div>
                    <MarkdownDisplay content={content} />
                </div>
            )}
        </div>
    );
}
