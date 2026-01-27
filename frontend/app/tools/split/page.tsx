"use client";

import { useState, useEffect, useRef } from "react";
import FileUpload from "../../components/FileUpload";
import { splitDocument, API_URL } from "../../services/api";
import * as pdfjsLib from 'pdfjs-dist';

// Set worker
const PDFJS_VERSION = '5.4.530';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

export default function SplitPage() {
    const [fileId, setFileId] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "completed">("idle");
    const [splitFiles, setSplitFiles] = useState<{ filename: string; download_url: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Advanced Split
    const [splitMode, setSplitMode] = useState<"all" | "select">("all");
    const [numPages, setNumPages] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleUpload = (data: { file_id: string }) => {
        setFileId(data.file_id);
        // We'll load the PDF to count pages if backend returned url, but here we only get ID. 
        // For simple UX without re-fetching file, we can ask user to upload to CLIENT first to read pages? 
        // Or we just assume we can get it from backend via a proxy URL or blob?
        // Since API logic is backend-centric, let's fetch the file back to render thumbnails?
        // Actually, FileUpload could return the File object or we modify it.
        // For now, let's try to fetch the "original" if possible, or just skip rendering if too complex?
        // No, user requested "pdf open ho jaye gi".
        // Let's assume we can fetch it via /documents/download/{id}/original.pdf endpoint pattern?
        // Check documents.py: it saves as `original{ext}`. We need a way to get it.
        // Let's add a quick client-side FileReader if we modify FileUpload?
        // Easier: In `handleUpload` we just assume we can get it or we modify FileUpload to pass File back?
        // Let's modifying FileUpload is hard as it's usage everywhere.
        // Let's try downloading it back:
        fetch(`${API_URL}/documents/download/${fileId}/original.pdf`)
            .then(res => res.arrayBuffer())
            .then(data => {
                const typedarray = new Uint8Array(data);
                pdfjsLib.getDocument({ data: typedarray }).promise.then(pdf => {
                    setPdfDoc(pdf);
                    setNumPages(pdf.numPages);
                });
            })
            .catch(e => console.error("Could not load preview", e));
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

    // Helper to render thumbnails
    const PageThumbnail = ({ pageNum }: { pageNum: number }) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        useEffect(() => {
            if (!pdfDoc || !canvasRef.current) return;
            pdfDoc.getPage(pageNum).then(page => {
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                if (context) page.render({ canvasContext: context, viewport } as any);
            });
        }, [pageNum]);

        return (
            <div
                onClick={() => togglePage(pageNum)}
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${selectedPages.has(pageNum) ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-200 opacity-80 hover:opacity-100'
                    }`}
            >
                <canvas ref={canvasRef} className="w-full h-auto block" />
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                    {selectedPages.has(pageNum) ? (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-1">
                    Page {pageNum}
                </div>
            </div>
        );
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
                            onClick={() => { setFileId(null); setPdfDoc(null); setNumPages(0); setStatus("idle"); setSplitFiles([]); }}
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

                    {/* Page Grid */}
                    {splitMode === "select" && numPages > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2 border rounded-lg bg-gray-50/50">
                            {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                                <PageThumbnail key={pageNum} pageNum={pageNum} />
                            ))}
                        </div>
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
