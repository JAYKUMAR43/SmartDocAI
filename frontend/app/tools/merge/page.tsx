"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload"; // We need a way to upload multiple files, or use this component multiple times
import { mergeDocuments, API_URL } from "../../services/api";

export default function MergePage() {
    const [files, setFiles] = useState<{ id: string; name: string }[]>([]);
    const [status, setStatus] = useState<"idle" | "processing" | "completed">("idle");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = (data: { file_id: string; filename: string }) => {
        setFiles((prev) => [...prev, { id: data.file_id, name: data.filename }]);
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        if (direction === 'up' && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        } else if (direction === 'down' && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        }
        setFiles(newFiles);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setError("Please upload at least 2 PDF files.");
            return;
        }

        setStatus("processing");
        setError(null);

        try {
            const response = await mergeDocuments(files.map(f => f.id));
            setDownloadUrl(response.download_url);
            setStatus("completed");
        } catch (err: any) {
            setError(err.message || "Failed to merge PDFs");
            setStatus("idle");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Merge PDF</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Combine multiple PDFs into one.</p>
            </div>

            <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uploaded Files: {files.length}
                </p>

                {/* File List with Reordering */}
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm">
                            <span className="truncate text-sm font-medium flex-1 mr-4">{file.name}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => moveFile(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                </button>
                                <button
                                    onClick={() => moveFile(index, 'down')}
                                    disabled={index === files.length - 1}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <FileUpload onUploadComplete={handleUpload} />

                {files.length >= 2 && (
                    <button
                        onClick={handleMerge}
                        disabled={status === "processing"}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {status === "processing" ? "Merging..." : "Merge PDFs"}
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {status === "completed" && downloadUrl && (
                <div className="p-6 bg-green-50 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Success!</h3>
                    <a
                        href={`${API_URL}${downloadUrl}`}
                        download
                        className="inline-block py-2 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Download Merged PDF
                    </a>
                </div>
            )}
        </div>
    );
}
