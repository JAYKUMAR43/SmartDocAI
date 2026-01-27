"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import { compressVideo } from "../../services/api";

const API_URL = "http://127.0.0.1:8000";

export default function CompressVideoPage() {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [targetSize, setTargetSize] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompress = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        try {
            const sizeKb = targetSize ? parseInt(targetSize) : undefined;
            const data = await compressVideo(selectedFile, sizeKb);
            setDownloadUrl(`${API_URL}${data.download_url}`);
        } catch (err) {
            setError("Failed to compress video. Ensure FFmpeg is installed on server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compress Video</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Reduce video size significantly (MP4, MOV).</p>
            </div>

            <FileUpload
                onUploadComplete={(data) => { setSelectedFile(data.file); setUploadSuccess(true); }}
                accept="video/*"
            />

            {uploadSuccess && !downloadUrl && !loading && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg animate-fade-in text-center">
                    Video uploaded successfully!
                </div>
            )}

            {selectedFile && !downloadUrl && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full max-w-xs space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Target Size (KB) <span className="text-xs text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            value={targetSize}
                            onChange={(e) => setTargetSize(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                        />
                    </div>
                    <button
                        onClick={handleCompress}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Compressing..." : "Compress Video"}
                    </button>
                    {loading && <p className="text-blue-600 animate-pulse">Compressing Video (this may take a while)...</p>}
                </div>
            )}

            {error && <p className="text-center text-red-500">{error}</p>}

            {downloadUrl && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-medium text-green-900 dark:text-green-300">Success!</h3>
                    <a
                        href={downloadUrl}
                        className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                        download
                    >
                        Download Compressed Video
                    </a>
                </div>
            )}
        </div>
    );
}
