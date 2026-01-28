"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import { protectDocument, API_URL } from "../../services/api";

export default function ProtectPage() {
    const [fileId, setFileId] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProtect = async () => {
        if (!fileId || !password) return;
        setLoading(true);
        setError(null);
        try {
            const data = await protectDocument(fileId, password);
            // Construct full URL
            setDownloadUrl(`${API_URL}${data.download_url}`);
        } catch (err) {
            setError("Failed to protect document.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Protect PDF</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Encrypt your PDF with a password.</p>
            </div>

            <FileUpload onUploadComplete={(data) => { setFileId(data.file_id); setUploadSuccess(true); }} />

            {uploadSuccess && !downloadUrl && !loading && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg animate-fade-in text-center">
                    PDF uploaded successfully! Enter password to protect.
                </div>
            )}

            {uploadSuccess && !downloadUrl && !loading && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg animate-fade-in text-center">
                    PDF uploaded successfully! Enter password to protect.
                </div>
            )}

            {fileId && !downloadUrl && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Set Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-black dark:border-zinc-700 p-2 border"
                            placeholder="Enter encryption password"
                        />
                    </div>
                    <button
                        onClick={handleProtect}
                        disabled={loading || !password}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Encrypting..." : "Protect PDF"}
                    </button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            )}

            {downloadUrl && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-medium text-green-900 dark:text-green-300">Success!</h3>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400 mb-4">Your PDF has been encrypted.</p>
                    <a
                        href={downloadUrl}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                        download
                    >
                        Download Protected PDF
                    </a>
                </div>
            )}
        </div>
    );
}
