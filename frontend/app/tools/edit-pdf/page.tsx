"use client";

import dynamic from 'next/dynamic';

// Dynamically import the Editor component because Fabric.js depends on 'window'
const Editor = dynamic(() => import('../../components/Editor/PDFEditor'), {
    ssr: false,
    loading: () => <p className="text-center p-10">Loading Editor...</p>,
});

export default function EditPdfPage() {
    return (
        <div className="h-[calc(100vh-80px)]">
            <Editor />
        </div>
    );
}
