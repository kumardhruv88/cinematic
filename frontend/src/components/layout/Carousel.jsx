import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from '../movie/MovieCard';

const Carousel = ({ movies }) => {
    if (!movies || movies.length === 0) {
        return (
            <div className="py-10 text-center text-gray-500">
                No movies to display
            </div>
        );
    }

    return (
        <div className="relative">
            <div
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
        </div>
    );
};

export default Carousel;
