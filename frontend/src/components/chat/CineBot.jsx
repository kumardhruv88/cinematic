import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Film } from 'lucide-react';

const SUGGESTIONS = [
    "Suggest a political thriller",
    "Best sci-fi of all time",
    "Movies like Inception",
    "Top romantic films",
    "Hidden gem crime dramas",
];

const CineBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "🎬 Hey! I'm **CineBot**!\n\nAsk me anything — recommendations, trivia, genre picks, or hidden gems 🍿"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const userText = (text || input).trim();
        if (!userText || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'bot',
                text: data.reply || "Sorry, try again! 🎥"
            }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: "Connection error. Is the backend running? 🎬" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const renderText = (text) => {
        // Handle bold and italic markdown safely
        const boldParts = text.split(/\*\*(.*?)\*\*/g);
        return boldParts.map((part, i) => {
            if (i % 2 === 1) return <strong key={`b-${i}`} className="font-medium text-white/90">{part}</strong>;
            
            const italicParts = part.split(/\*(.*?)\*/g);
            return italicParts.map((subPart, j) => 
                j % 2 === 1 ? <em key={`i-${i}-${j}`} className="italic text-white/80">{subPart}</em> : subPart
            );
        });
    };

    return (
        <>
            {/* Chat Panel — compact 300px wide */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-20 right-4 z-[999] w-[300px] flex flex-col rounded-xl overflow-hidden shadow-2xl border border-white/10"
                        style={{ background: '#0f1535', maxHeight: '480px' }}
                    >
                        {/* Header — slim */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-accent-purple/10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center flex-none">
                                    <Film size={11} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white text-xs font-medium leading-none tracking-widest">CINEBOT</p>
                                    <p className="text-green-400 text-[9px] mt-0.5 flex items-center gap-1 font-light tracking-wide">
                                        <span className="w-1 h-1 bg-green-400 rounded-full inline-block shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                                        AI Movie Expert
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={11} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
                            style={{ maxHeight: '300px', scrollbarWidth: 'none' }}
                        >
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex-none w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${msg.role === 'bot' ? 'bg-gradient-to-br from-accent-purple to-accent-cyan' : 'bg-white/10'}`}>
                                        {msg.role === 'bot' ? <Bot size={10} className="text-white" /> : <User size={10} className="text-white" />}
                                    </div>
                                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[11.5px] font-[300] tracking-wide leading-relaxed whitespace-pre-line antialiased ${
                                        msg.role === 'bot'
                                            ? 'bg-white/5 border border-white/5 text-white/75 rounded-tl-none shadow-sm'
                                            : 'bg-gradient-to-br from-accent-purple to-[#5b21b6] text-white/90 rounded-tr-none shadow-sm'
                                    }`}>
                                        {renderText(msg.text)}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center flex-none">
                                        <Bot size={10} className="text-white" />
                                    </div>
                                    <div className="bg-white/5 border border-white/8 px-2.5 py-1.5 rounded-xl rounded-tl-none flex items-center gap-1.5">
                                        <Loader2 size={10} className="text-accent-cyan animate-spin" />
                                        <span className="text-gray-400 text-[10px]">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick suggestions — only on first open */}
                        {messages.length <= 2 && (
                            <div className="px-3 py-2 border-t border-white/5">
                                <div className="flex flex-wrap gap-1">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(s)}
                                            className="text-[9px] px-2 py-1 bg-accent-purple/20 hover:bg-accent-purple/40 text-accent-cyan border border-accent-purple/30 rounded-full transition-all leading-none"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-2.5 py-2 border-t border-white/10 flex gap-1.5">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask about any movie..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] placeholder:text-gray-600 outline-none focus:border-accent-purple/50 transition-colors"
                                disabled={loading}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={loading || !input.trim()}
                                className="w-7 h-7 flex-none rounded-lg bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-30 flex items-center justify-center transition-all active:scale-95"
                            >
                                <Send size={11} className="text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button — compact */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-[999] w-11 h-11 rounded-full shadow-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                animate={isOpen ? {} : {
                    boxShadow: [
                        '0 0 0 0 rgba(124,58,237,0.5)',
                        '0 0 0 12px rgba(124,58,237,0)',
                        '0 0 0 0 rgba(124,58,237,0)'
                    ]
                }}
                transition={{ repeat: Infinity, duration: 2.5 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <X size={17} className="text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <MessageCircle size={17} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
};

export default CineBot;
