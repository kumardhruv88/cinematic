import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroScreen = ({ onComplete }) => {
    const [count, setCount] = useState(0);
    const [visible, setVisible] = useState(true);
    const [phase, setPhase] = useState('counting'); // 'counting' | 'reveal' | 'exit'

    useEffect(() => {
        // Count from 0 to 100 over ~2.2s
        const duration = 2200;
        const steps = 100;
        const stepDuration = duration / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            setCount(current);
            if (current >= 100) {
                clearInterval(timer);
                // Switch to reveal phase
                setTimeout(() => setPhase('reveal'), 150);
                // Then exit
                setTimeout(() => {
                    setPhase('exit');
                    setTimeout(() => {
                        setVisible(false);
                        onComplete?.();
                    }, 700);
                }, 900);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, []);

    if (!visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="intro"
                    className="fixed inset-0 z-[9999] bg-[#050812] flex flex-col items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                    {/* Corner Glows */}
                    <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-accent-purple/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-accent-cyan/15 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 w-[600px] h-[300px] bg-accent-purple/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    {/* Main content */}
                    <div className="relative flex flex-col items-center select-none">

                        {/* Counter */}
                        <motion.div
                            className="mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <span
                                className="text-[7rem] md:text-[10rem] leading-none text-white/10 tabular-nums"
                                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}
                            >
                                {String(count).padStart(2, '0')}
                            </span>
                        </motion.div>

                        {/* Thin horizontal separator line with fill animation */}
                        <div className="w-[260px] md:w-[380px] h-px bg-white/10 relative mb-8 overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple"
                                initial={{ width: '0%' }}
                                animate={{ width: `${count}%` }}
                                transition={{ duration: 0.05, ease: 'linear' }}
                            />
                        </div>

                        {/* CINEMATIQ Logo */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: phase === 'exit' ? 0 : 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h1
                                className="text-[3.5rem] md:text-[5.5rem] leading-none tracking-[0.3em] text-white"
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                                CINEMATIQ
                            </h1>
                            <motion.p
                                className="text-[10px] md:text-xs tracking-[0.5em] text-accent-cyan/70 mt-2 uppercase"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: phase === 'exit' ? 0 : 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                Your Cinematic Universe
                            </motion.p>
                        </motion.div>

                        {/* Loading status */}
                        <motion.p
                            className="mt-10 text-[10px] tracking-[0.35em] text-white/25 uppercase"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: phase === 'exit' ? 0 : 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            {count < 40
                                ? 'Initialising Catalogue'
                                : count < 75
                                ? 'Loading Intelligence'
                                : count < 100
                                ? 'Preparing Experience'
                                : 'Welcome'}
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IntroScreen;
