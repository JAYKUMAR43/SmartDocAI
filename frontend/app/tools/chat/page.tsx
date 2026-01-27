"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import { chatWithDocument } from "../../services/api";

type Message = {
    role: 'user' | 'ai';
    content: string;
};

export default function ChatPage() {
    const [fileId, setFileId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!fileId || !question.trim()) return;

        const currentQuestion = question;
        setMessages(prev => [...prev, { role: 'user', content: currentQuestion }]);
        setQuestion("");
        setLoading(true);

        try {
            const data = await chatWithDocument(fileId, currentQuestion);
            setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process that question." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            <div className="text-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat with PDF</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Upload a document and ask questions about its content.</p>
            </div>

            {!fileId && (
                <div className="flex-shrink-0">
                    <FileUpload onUploadComplete={setFileId} />
                </div>
            )}

            {fileId && (
                <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 mt-10">
                                <p>Document uploaded! Ask me anything about it.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-200'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-2">
                                    <span className="flex gap-1">
                                        <span className="animate-bounce">.</span>
                                        <span className="animate-bounce delay-100">.</span>
                                        <span className="animate-bounce delay-200">.</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 p-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            />
                            <button
                                onClick={handleAsk}
                                disabled={loading || !question.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
