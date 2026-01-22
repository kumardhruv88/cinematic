import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceSearch = ({ onSearch, className = "" }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false; // We only want final
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
            type="button" // Prevent form submit
            onClick={toggleListening}
            className={`
                relative p-2 rounded-full transition-all duration-300
                ${isListening ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-gray-400 hover:text-white'}
                ${className}
            `}
            title="Voice Search"
        >
            <AnimatePresence mode="wait">
                {isListening ? (
                    <motion.div
                        key="listening"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <MicOff size={20} />
                    </motion.div>
                ) : (
                    <motion.div key="idle" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <Mic size={20} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ripple Effect for Listening */}
            {isListening && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20"></span>
            )}
        </button>
    );
};

export default VoiceSearch;
