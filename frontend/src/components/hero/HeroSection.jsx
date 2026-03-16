import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Container from '../layout/Container';

const HeroSection = ({ movies = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!movies || movies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
        }, 8000); // 8 second interval for better readability

        return () => clearInterval(interval);
    }, [movies]);

    // Placeholder content if no movie is provided
    const defaultMovie = {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        year: 2014,
        rating: 8.6,
        genre: ["Sci-Fi", "Adventure"],
        image: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg"
    };

    const currentMovie = movies && movies.length > 0 ? movies[currentIndex % movies.length] : null;

    const featured = currentMovie ? {
        id: currentMovie.movieId,
        title: currentMovie.title,
        description: currentMovie.description || "No description available.",
        year: currentMovie.year || "N/A",
        rating: (() => {
            const r = currentMovie.vote_average || currentMovie.rating;
            return typeof r === 'number' ? r.toFixed(1) : r || "N/A";
        })(),
        genre: currentMovie.genres || [],
        image: currentMovie.posterPath ? currentMovie.posterPath.replace("w500", "original") : defaultMovie.image
    } : defaultMovie;

    return (
        <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
            <AnimatePresence mode="wait">
                {/* Background Image */}
                <motion.div
                    key={featured.image}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${featured.image})` }}
                />
            </AnimatePresence>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-[#0A0E27]/40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E27] via-[#0A0E27]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/20 to-transparent" />

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
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-accent-purple/20 border border-accent-purple/30 text-accent-purple text-[10px] font-bold rounded-full uppercase tracking-wider">
                                Featured
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                <span>★ {featured.rating}</span>
                            </div>
                            <span className="text-gray-400 text-xs">• {featured.year}</span>
                        </div>

                        <h1
                            className="text-3xl md:text-[2.8rem] leading-tight tracking-wide text-white mb-3"
                            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 200, letterSpacing: '0.03em' }}
                        >
                            {featured.title}
                        </h1>

                        <p className="text-xs text-gray-400 mb-6 line-clamp-2 leading-relaxed font-light tracking-wide">
                            {featured.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate(`/movie/${featured.id}`)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-purple hover:bg-accent-purple/90 text-white text-sm rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                                <Info size={15} fill="currentColor" />
                                View Details
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </Container>

            {/* Scroll Indicator */}
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
