import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Container from '../layout/Container';

// Only confirmed-working TMDB backdrop images
const CREATIVE_MOODS = [
    {
        id: 155,
        title: "The Dark Knight",
        quote: "If you want to embrace the shadows...",
        description: "When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice.",
        year: 2008,
        rating: "8.5",
        genre: ["Action", "Crime"],
        backdrop: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg"
    },
    {
        id: 27205,
        title: "Inception",
        quote: "If you want to blow your mind...",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO's mind.",
        year: 2010,
        rating: "8.4",
        genre: ["Sci-Fi", "Thriller"],
        backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg"
    },
    {
        id: 680,
        title: "Pulp Fiction",
        quote: "If you want to feel the rush...",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        year: 1994,
        rating: "8.9",
        genre: ["Crime", "Drama"],
        backdrop: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg"
    },
    {
        id: 278,
        title: "The Shawshank Redemption",
        quote: "If you want to feel hope...",
        description: "Two imprisoned men bond over several years, finding solace and eventual redemption through acts of common decency.",
        year: 1994,
        rating: "9.3",
        genre: ["Drama"],
        backdrop: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg"
    }
];

const HeroSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % CREATIVE_MOODS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const featured = CREATIVE_MOODS[currentIndex];

    return (
        <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden -mt-14">

            {/* Background Image */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={featured.backdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${featured.backdrop})` }}
                />
            </AnimatePresence>

            {/* Light tint + strong left gradient + bottom fade — deployed style */}
            <div className="absolute inset-0 bg-[#0A0E27]/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E27]/95 via-[#0A0E27]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0A0E27] to-transparent" />

            <Container className="relative h-full flex flex-col justify-center pt-14">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={featured.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-xl"
                    >
                        {/* Badge row — matches deployed "FEATURED ★ 4.3 • 2019" style */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-accent-purple/20 border border-accent-purple/30 text-accent-purple text-[10px] font-bold rounded-full uppercase tracking-wider italic">
                                {featured.quote}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                <span>★ {featured.rating}</span>
                            </div>
                            <span className="text-gray-400 text-xs">• {featured.year}</span>
                        </div>

                        {/* Title — deployed style: light weight Poppins */}
                        <h1
                            className="text-3xl md:text-[2.8rem] leading-tight text-white mb-3"
                            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}
                        >
                            {featured.title}
                        </h1>

                        {/* Description — exactly like deployed: xs, gray, 2-line clamp */}
                        <p className="text-xs text-gray-400 mb-6 max-w-sm line-clamp-2 leading-relaxed font-light">
                            {featured.description}
                        </p>

                        {/* Single button — matches deployed "View Details" with dot icon */}
                        <button
                            onClick={() => navigate(`/movie/${featured.id}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-accent-purple hover:bg-accent-purple/90 text-white text-sm rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                        >
                            <span className="w-2 h-2 bg-white rounded-full" />
                            View Details
                        </button>
                    </motion.div>
                </AnimatePresence>
            </Container>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-2 bg-white/50 rounded-full" />
                </div>
            </motion.div>
        </div>
    );
};

export default HeroSection;
