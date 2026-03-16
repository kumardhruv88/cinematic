import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceSearch = ({ onSearch, className = "", iconSize = 16 }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'en-US';

            rec.onstart = () => setIsListening(true);
            rec.onend = () => setIsListening(false);

            rec.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript && onSearch) {
                    onSearch(transcript);
                }
            };

            rec.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            setRecognition(rec);
        }
    }, [onSearch]);

    const toggleListening = () => {
        if (!recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`
                relative flex items-center justify-center p-1.5 rounded-full transition-all duration-300
                ${isListening ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-gray-500 hover:text-white'}
                ${className}
            `}
            title="Voice Search"
        >
            <AnimatePresence mode="wait">
                {isListening ? (
                    <motion.span
                        key="listening"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <MicOff size={iconSize} />
                    </motion.span>
                ) : (
                    <motion.span
                        key="idle"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Mic size={iconSize} />
                    </motion.span>
                )}
            </AnimatePresence>

            {isListening && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
            )}
        </button>
    );
};

export default VoiceSearch;
