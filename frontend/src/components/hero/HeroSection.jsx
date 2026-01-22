import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import Container from '../layout/Container';

const HeroSection = ({ movie }) => {
    // Placeholder content if no movie is provided
    const defaultMovie = {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        year: 2014,
        rating: 8.6,
        genre: ["Sci-Fi", "Adventure"],
        image: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg"
    };

    const featured = movie ? {
        title: movie.title,
        description: movie.description || "No description available.",
        year: movie.year || "N/A",
        rating: movie.vote_average || movie.rating || "N/A",
        // genres might be array of strings or objects depending on backend, handle carefully
        genre: movie.genres || [],
        image: movie.posterPath ? movie.posterPath.replace("w500", "original") : defaultMovie.image
        // Note: TMDB images in posterPath are usually w500. We might want higher res for Hero.
        // If the backend sends full URL "https://image.tmdb.org/t/p/w500/...", we can replace w500 with original.
    } : defaultMovie;

    return (
        <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${featured.image})` }}
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E27] via-[#0A0E27]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-transparent to-transparent" />
            </div>

            <Container className="relative h-full flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-2xl"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <span className="px-3 py-1 bg-accent-purple/20 border border-accent-purple/30 text-accent-purple text-xs font-bold rounded-full uppercase tracking-wider">
                            Featured
                        </span>
                        <div className="flex items-center gap-2 text-yellow-500">
                            <span>★ {featured.rating}</span>
                        </div>
                        <span className="text-gray-300">• {featured.year}</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                        {featured.title}
                    </h1>

                    <p className="text-lg text-gray-300 mb-10 line-clamp-3 leading-relaxed">
                        {featured.description}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center gap-2 px-8 py-4 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                            <Info size={20} fill="currentColor" />
                            View Details
                        </button>
                    </div>
                </motion.div>
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
