import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from '../movie/MovieCard';

const MovieGrid = ({ movies, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8).fill(null).map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!movies || movies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
                <p className="text-gray-400">Try adjusting your filters or search query.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie, index) => (
                <motion.div
                    key={movie.movieId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <MovieCard movie={movie} />
                </motion.div>
            ))}
        </div>
    );
};

export default MovieGrid;
