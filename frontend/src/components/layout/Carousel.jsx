import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '../movie/MovieCard';

const Carousel = ({ movies }) => {
    const scrollRef = useRef(null);

    if (!movies || movies.length === 0) return null;

    const scroll = (direction) => {
        if (scrollRef.current) {
            const amount = direction === 'left' ? -750 : 750;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative group">
            {/* Left arrow */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-[42%] -translate-y-1/2 z-10 w-8 h-8 bg-[#0A0E27]/95 border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#7C3AED] -translate-x-4 shadow-xl"
                aria-label="Scroll left"
            >
                <ChevronLeft size={16} />
            </button>

            {/* Scrollable row — 6 exact cards like deployed */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto py-2 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {movies.map((movie, index) => (
                    <motion.div
                        key={movie.movieId}
                        /* 6 cards per row — calc matches gap-4 (16px * 5 gaps = 80px), container ~100% */
                        className="flex-none"
                        style={{ width: 'calc((100% - 80px) / 6)' }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '60px' }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
                    >
                        <MovieCard movie={movie} />
                    </motion.div>
                ))}
            </div>

            {/* Right arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-[42%] -translate-y-1/2 z-10 w-8 h-8 bg-[#0A0E27]/95 border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#7C3AED] translate-x-4 shadow-xl"
                aria-label="Scroll right"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default Carousel;
