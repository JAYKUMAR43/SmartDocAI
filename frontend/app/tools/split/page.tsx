"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import { splitDocument, API_URL } from "../../services/api";
import dynamic from "next/dynamic";

// Dynamically import the PDF Viewer with NO SSR to avoid "DOMMatrix is not defined"
const SplitPDFViewer = dynamic(() => import("./SplitPDFViewer"), { ssr: false });

export default function SplitPage() {
    const [fileId, setFileId] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "completed">("idle");
    const [splitFiles, setSplitFiles] = useState<{ filename: string; download_url: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Advanced Split
    const [splitMode, setSplitMode] = useState<"all" | "select">("all");
    const [numPages, setNumPages] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

    const handleUpload = (data: { file_id: string }) => {
        setFileId(data.file_id);
    };

    const togglePage = (pageNum: number) => {
        const newSet = new Set(selectedPages);
        if (newSet.has(pageNum)) {
            newSet.delete(pageNum);
        } else {
            newSet.add(pageNum);
        }
        setSelectedPages(newSet);
    };

    const handleSplit = async () => {
        if (!fileId) return;

        let pagesToSend: number[] | undefined = undefined;
        if (splitMode === 'select') {
            if (selectedPages.size === 0) {
                setError("Please select at least one page.");
                return;
            }
            pagesToSend = Array.from(selectedPages).sort((a, b) => a - b);
        }

        setStatus("processing");
        setError(null);

        try {
            const data = await splitDocument(fileId, pagesToSend);
            setSplitFiles(data.files);
            setStatus("completed");
        } catch (err: any) {
            setError(err.message || "Failed to split PDF");
            setStatus("idle");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Split PDF</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Separate pages from your PDF.</p>
            </div>

            {!fileId ? (
                <FileUpload onUploadComplete={handleUpload} />
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">File uploaded ready to split</span>
                        <button
                            onClick={() => { setFileId(null); setNumPages(0); setStatus("idle"); setSplitFiles([]); }}
                            className="text-red-500 text-sm hover:underline"
                        >
                            Remove
                        </button>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <button
                            onClick={() => setSplitMode("all")}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg border-2 transition-all ${splitMode === "all"
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                        >
                            Split All Pages
                        </button>
                        <button
                            onClick={() => setSplitMode("select")}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg border-2 transition-all ${splitMode === "select"
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                        >
                            Select Pages
                        </button>
                    </div>

                    {/* Page Grid (Only load if mode is select) */}
                    {splitMode === "select" && (
                        <SplitPDFViewer
                            fileUrl={`${API_URL}/documents/download/${fileId}/original.pdf`}
                            onPagesLoaded={setNumPages}
                            selectedPages={selectedPages}
                            onTogglePage={togglePage}
                        />
                    )}

                    <button
                        onClick={handleSplit}
                        disabled={status === "processing"}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {status === "processing" ? "Splitting..." : "Split PDF"}
                    </button>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {status === "completed" && splitFiles.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generated Pages</h3>
                    <div className="grid gap-2">
                        {splitFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                                <span className="text-sm truncate max-w-xs text-gray-700 dark:text-gray-300">
                                    {file.filename}
                                </span>
                                <a
                                    href={`${API_URL}${file.download_url}`}
                                    download
                                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
