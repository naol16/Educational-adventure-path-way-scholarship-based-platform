"use client";

import React, { useState, useEffect, useRef } from "react";
import { Compass, Send, X, Bot, User, Loader2 } from "lucide-react";

interface AIChatMessage {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatBotProps {
    scholarshipId?: number;
}

export function AIChatBot({ scholarshipId }: AIChatBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get or generate a sessionId for the user
        let currentSession = localStorage.getItem("ai_chat_session_id");
        if (!currentSession) {
            currentSession = `session_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem("ai_chat_session_id", currentSession);
        }
        setSessionId(currentSession);

        // Fetch history
        const fetchHistory = async () => {
            try {
                let url = `${process.env.NEXT_PUBLIC_API_URL}/ai-chat/history?sessionId=${currentSession}`;
                if (scholarshipId) {
                    url += `&scholarshipId=${scholarshipId}`;
                }
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setMessages(data);
                    } else {
                        // Add welcome message if no history
                        setMessages([{
                            role: 'assistant',
                            content: scholarshipId 
                                ? "Hi! I am Path Finder. What would you like to know about this scholarship?" 
                                : "Hi! I am Path Finder. How can I help you with your educational journey today?"
                        }]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            }
        };

        if (isOpen && messages.length === 0) {
            fetchHistory();
        }
    }, [isOpen, scholarshipId]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: AIChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const endpoint = scholarshipId 
                ? `${process.env.NEXT_PUBLIC_API_URL}/ai-chat/scholarship/${scholarshipId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/ai-chat/general`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ message: userMsg.content, sessionId })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            } else {
                const errData = await res.json();
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errData.error || 'Something went wrong.'}` }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I am having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="bg-card w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-2">
                            <Compass className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">Path Finder</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-primary/80 p-1 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground ml-2' : 'bg-primary text-primary-foreground mr-2'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border border-border text-foreground rounded-bl-sm'}`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex max-w-[85%] flex-row items-end space-x-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground mr-2">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="p-3 rounded-2xl bg-background border border-border text-foreground rounded-bl-sm flex space-x-2 items-center">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Path Finder is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-background border-t border-border">
                        <form onSubmit={handleSend} className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Path Finder..."
                                className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300 ease-in-out bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center space-x-2 group`}
            >
                <Compass className="w-6 h-6 group-hover:animate-spin" />
                <span className="font-semibold hidden sm:inline-block">Path Finder</span>
            </button>
        </div>
    );
}
