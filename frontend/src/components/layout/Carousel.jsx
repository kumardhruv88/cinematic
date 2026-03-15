import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '../movie/MovieCard';

const Carousel = ({ movies }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -(current.offsetWidth * 0.8) : (current.offsetWidth * 0.8);
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!movies || movies.length === 0) {
        return (
            <div className="py-10 text-center text-gray-500">
                No movies to display
            </div>
        );
    }

    return (
        <div className="relative group/carousel">
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-r-xl backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 shadow-[4px_0_15px_rgba(0,0,0,0.5)] h-full max-h-[240px] flex items-center justify-center -ml-4"
                aria-label="Scroll Left"
            >
                <ChevronLeft size={32} />
            </button>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-2 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {movies.map((movie, index) => (
                    <motion.div
                        key={movie.movieId}
                        className="flex-none w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "50px" }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                    >
                        <MovieCard movie={movie} />
                    </motion.div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-l-xl backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 shadow-[-4px_0_15px_rgba(0,0,0,0.5)] h-full max-h-[240px] flex items-center justify-center -mr-4"
                aria-label="Scroll Right"
            >
                <ChevronRight size={32} />
            </button>
        </div>
    );
};

export default Carousel;
