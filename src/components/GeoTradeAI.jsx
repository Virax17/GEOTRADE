import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';

const SYSTEM_PROMPT = `You are GeoTrade AI, an intelligent assistant for the GeoTrade Intelligence Platform. You help Indian policymakers, businesses, and researchers understand how global geopolitical events affect India's trade, supply chains, and economy. Always respond in simple, clear English. Avoid jargon. Reference specific sectors (petroleum, fertilizers, pharmaceuticals, engineering goods, IT services) when relevant. Keep answers to 3-4 sentences. If asked about live data, explain that the dashboard is currently showing the latest AI-analyzed intelligence.`;

export default function GeoTradeAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm GeoTrade AI. Ask me anything about how global events affect India's trade." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Get the last 4 messages for context (excluding the system instruction logic which is handled below)
            // But we already have the initial greeting in there.
            const history = [...messages, userMsg].slice(-4);
            
            // Format for Anthropic API: messages array shouldn't have system prompt, it should go in the 'system' param
            const requestBody = {
                model: 'claude-sonnet-4-20250514',
                max_tokens: 300,
                system: SYSTEM_PROMPT,
                messages: history.map(m => ({ role: m.role, content: m.content }))
            };

            const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || ''; // Provide a fallback setup instructions if needed
            
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerously-allow-browser': 'true' // Required for browser-side fetches
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                // If 401 Unauthorized because API key is missing
                console.error('API Error:', response.status, await response.text());
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            if (data.content && data.content.length > 0) {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.content[0].text }]);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: "AI is temporarily unavailable. Please check the dashboard for latest data." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    aria-label="Open GeoTrade AI Chat"
                    aria-expanded={isOpen}
                    className="fixed bottom-6 right-6 z-50 p-4 min-w-[56px] min-h-[56px] bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500/50"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Slide-up Chat Panel */}
            <div
                className={`fixed bottom-6 right-6 z-50 w-full max-w-[380px] h-[550px] max-h-[85vh] bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl flex flex-col transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-white/10 bg-[#1E293B] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/20 rounded-lg">
                            <Bot size={20} className="text-teal-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 text-sm">GeoTrade AI</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close GeoTrade AI Chat"
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-[#1E293B] border border-white/5 text-slate-200 rounded-bl-sm'}`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-[#1E293B] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-[#1E293B] rounded-b-2xl">
                    <form onSubmit={handleSend} className="flex items-end gap-2 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Ask GeoTrade AI..."
                            className="flex-1 max-h-32 min-h-[44px] bg-[#0F172A] border border-white/10 text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 resize-none scrollbar-thin scrollbar-thumb-slate-700"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            aria-label="Send Message"
                            className="flex-shrink-0 p-2 min-w-[44px] min-h-[44px] bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl transition-colors mb-0.5 shadow-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        >
                            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-slate-500 mt-2">
                        GeoTrade AI can make mistakes. Verify critical data.
                    </p>
                </div>
            </div>
        </>
    );
}
