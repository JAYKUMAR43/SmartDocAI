"use client";

import { useRef, useState, useEffect } from "react";

export default function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setIsActive(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please allow permission.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsActive(false);
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                // Set canvas dimensions to match video
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;

                // Draw video frame to canvas
                context.drawImage(videoRef.current, 0, 0);

                // Convert to file
                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });
                        onCapture(file);
                        stopCamera();
                    }
                }, 'image/jpeg');
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="flex flex-col items-center gap-4">
            {!isActive ? (
                <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Take Photo
                </button>
            ) : (
                <div className="relative rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg">
                    <video ref={videoRef} autoPlay playsInline className="max-w-md w-full" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <button
                            onClick={takePhoto}
                            className="w-12 h-12 rounded-full bg-white border-4 border-gray-300 hover:border-blue-500 transition shadow-lg"
                        />
                        <button
                            onClick={stopCamera}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg opacity-80 hover:opacity-100"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
