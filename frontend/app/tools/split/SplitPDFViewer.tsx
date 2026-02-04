"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from 'pdfjs-dist';

// Set worker
const PDFJS_VERSION = '5.4.530';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

interface SplitPDFViewerProps {
    fileUrl: string;
    onPagesLoaded: (numPages: number) => void;
    selectedPages: Set<number>;
    onTogglePage: (pageNum: number) => void;
}

export default function SplitPDFViewer({ fileUrl, onPagesLoaded, selectedPages, onTogglePage }: SplitPDFViewerProps) {
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [numPages, setNumPages] = useState(0);

    useEffect(() => {
        const loadPdf = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(fileUrl);
                const pdf = await loadingTask.promise;
                setPdfDoc(pdf);
                setNumPages(pdf.numPages);
                onPagesLoaded(pdf.numPages);
            } catch (error) {
                console.error("Error loading PDF:", error);
            }
        };

        if (fileUrl) {
            loadPdf();
        }
    }, [fileUrl, onPagesLoaded]);

    if (!pdfDoc) return <div className="text-center p-4">Loading PDF Preview...</div>;

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2 border rounded-lg bg-gray-50/50">
            {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                <PageThumbnail
                    key={pageNum}
                    pageNum={pageNum}
                    pdfDoc={pdfDoc}
                    isSelected={selectedPages.has(pageNum)}
                    onToggle={() => onTogglePage(pageNum)}
                />
            ))}
        </div>
    );
}

const PageThumbnail = ({ pageNum, pdfDoc, isSelected, onToggle }: {
    pageNum: number;
    pdfDoc: pdfjsLib.PDFDocumentProxy;
    isSelected: boolean;
    onToggle: () => void;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        let isMounted = true;

        pdfDoc.getPage(pageNum).then(page => {
            if (!isMounted) return;
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = canvasRef.current!;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                page.render({ canvasContext: context, viewport } as any);
            }
        });

        return () => { isMounted = false; };
    }, [pageNum, pdfDoc]);

    return (
        <div
            onClick={onToggle}
            className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${isSelected ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-200 opacity-80 hover:opacity-100'}`}
        >
            <canvas ref={canvasRef} className="w-full h-auto block" />
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                {isSelected ? (
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
