import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    // Fallback if no movie data
    if (!movie) return null;

    const { movieId, title, year, rating, posterPath, tmdbId } = movie;

    const placeholderUrl = `https://placehold.co/300x450/1E1B4B/FFFFFF?text=${encodeURIComponent(title)}`;
    const [imgSrc, setImgSrc] = useState(posterPath || placeholderUrl);

    useEffect(() => {
        setImgSrc(posterPath || placeholderUrl);
    }, [posterPath, title]);

    const linkPath = movie.type === 'tv' ? `/series/${movieId}` : `/movie/${movieId}`;

    return (
        <Link to={linkPath}>
            <motion.div
                className="group/card relative bg-[#1E1B4B]/30 rounded-xl overflow-hidden cursor-pointer"
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
                {/* Poster Image */}
                <div className="aspect-[2/3] w-full relative overflow-hidden">
                    <img
                        src={imgSrc}
                        alt={title}
                        onError={() => setImgSrc(placeholderUrl)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                        loading="lazy"
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-accent-cyan/90 text-black rounded-lg font-semibold text-[10px] uppercase tracking-widest transform scale-90 group-hover/card:scale-100 transition-transform duration-300">
                            View Details
                        </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{rating ? rating.toFixed(1) : 'N/A'}</span>
                    </div>
                </div>

                {/* Content Info */}
                <div className="p-4">
                    <h3 className="text-white font-semibold truncate group-hover/card:text-accent-cyan transition-colors" title={title}>
                        {title}
                    </h3>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                        <span>{year || 'Unknown'}</span>
                        <span className="border border-gray-600 px-1 rounded text-[10px] uppercase">Movie</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default MovieCard;
