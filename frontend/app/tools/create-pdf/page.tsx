"use client";

import { useState } from "react";
import { createPdf, createPdfFromImages, uploadFile, compressDocument, API_URL } from "../../services/api";
import FileUpload from "../../components/FileUpload";
import CameraCapture from "../../components/CameraCapture";

export default function CreatePdfPage() {
    const [mode, setMode] = useState<"text" | "images" | "compress">("text");

    // Text Mode State
    const [text, setText] = useState("");

    // Image Mode State
    const [imageIds, setImageIds] = useState<string[]>([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // Compress Mode State
    const [compressFileId, setCompressFileId] = useState<string | null>(null);

    // Shared State
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateFromText = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        try {
            const data = await createPdf(text);
            setDownloadUrl(`${API_URL}${data.download_url}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create PDF.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFromImages = async () => {
        if (imageIds.length === 0) return;
        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        try {
            const data = await createPdfFromImages(imageIds);
            setDownloadUrl(`${API_URL}${data.download_url}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create PDF from images.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompressPdf = async () => {
        if (!compressFileId) return;
        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        try {
            const data = await compressDocument(compressFileId);
            setDownloadUrl(`${API_URL}${data.download_url}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to compress PDF.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (data: { file_id: string }) => {
        setImageIds(prev => [...prev, data.file_id]);
    };

    const handleCameraCapture = async (file: File) => {
        setIsCameraOpen(false);
        setLoading(true); // Temporary loading state for upload
        try {
            const data = await uploadFile(file);
            setImageIds(prev => [...prev, data.file_id]);
        } catch (err) {
            console.error("Failed to upload captured image", err);
            setError("Failed to upload captured photo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create & Compress PDF</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Create PDF from Text, Images, or Compress existing PDFs.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => { setMode("text"); setDownloadUrl(null); setError(null); }}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${mode === "text"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                        }`}
                >
                    Text to PDF
                </button>
                <button
                    onClick={() => { setMode("images"); setDownloadUrl(null); setError(null); }}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${mode === "images"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                        }`}
                >
                    Images to PDF
                </button>
                <button
                    onClick={() => { setMode("compress"); setDownloadUrl(null); setError(null); }}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${mode === "compress"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                        }`}
                >
                    Compress PDF
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {mode === "text" && (
                    <div className="flex flex-col space-y-4 animate-fade-in">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Start typing your document here..."
                            className="w-full h-96 p-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono"
                        />
                        <div className="flex justify-center">
                            <button
                                onClick={handleCreateFromText}
                                disabled={loading || !text.trim()}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Generate PDF"}
                            </button>
                        </div>
                    </div>
                )}
                {mode === "images" && (
                    <div className="flex flex-col space-y-6 animate-fade-in">
                        {/* Camera Toggle */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setIsCameraOpen(!isCameraOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {isCameraOpen ? "Close Camera" : "Open Camera"}
                            </button>
                        </div>

                        {/* Camera Component */}
                        {isCameraOpen && (
                            <div className="p-4 bg-black rounded-xl">
                                <CameraCapture onCapture={handleCameraCapture} />
                            </div>
                        )}

                        {/* Upload Component */}
                        {!isCameraOpen && (
                            <FileUpload onUploadComplete={handleImageUpload} accept="image/*" />
                        )}

                        {/* Image List */}
                        {imageIds.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Selected Images ({imageIds.length})</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {imageIds.map((id, idx) => (
                                        <div key={idx} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded text-xs truncate">
                                            Image {idx + 1}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={handleCreateFromImages}
                                        disabled={loading}
                                        className="px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {loading ? "Creating..." : "Generate PDF from Images"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {imageIds.length === 0 && !isCameraOpen && (
                            <p className="text-center text-gray-500">No images selected yet.</p>
                        )}
                    </div>
                )}
                {mode === "compress" && (
                    <div className="flex flex-col space-y-6 animate-fade-in max-w-xl mx-auto">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-medium">Upload PDF to Compress</h3>
                            <p className="text-sm text-gray-500">Reduce file size while maintaining quality.</p>
                        </div>
                        <FileUpload onUploadComplete={(data) => { setCompressFileId(data.file_id); setUploadSuccess(true); }} accept=".pdf" />

                        {uploadSuccess && !downloadUrl && !loading && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg animate-fade-in text-center">
                                PDF uploaded successfully! Ready to compress.
                            </div>
                        )}

                        {compressFileId && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleCompressPdf}
                                    disabled={loading}
                                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? "Compressing..." : "Compress PDF"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="text-center text-red-500 font-medium">{error}</p>}

            {
                downloadUrl && (
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 animate-fade-in">
                        <h3 className="text-lg font-medium text-green-900 dark:text-green-300">PDF Created Successfully!</h3>
                        <a
                            href={downloadUrl}
                            className="inline-flex items-center px-6 py-3 mt-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            download
                        >
                            Download PDF
                        </a>
                    </div>
                )
            }
        </div >
    );
}
