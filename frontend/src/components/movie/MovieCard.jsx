import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    if (!movie) return null;

    const { movieId, title, year, rating, posterPath } = movie;

    const placeholderUrl = `https://placehold.co/300x450/111827/6B7280?text=${encodeURIComponent(title || 'Movie')}`;
    const [imgSrc, setImgSrc] = useState(posterPath || placeholderUrl);

    useEffect(() => {
        setImgSrc(posterPath || placeholderUrl);
    }, [posterPath, title]);

    const linkPath = movie.type === 'tv' ? `/series/${movieId}` : `/movie/${movieId}`;
    const displayRating = rating
        ? (typeof rating === 'number' ? rating.toFixed(1) : rating)
        : 'N/A';

    return (
        <Link to={linkPath} className="block">
            <motion.div
                className="group/card rounded-lg overflow-hidden cursor-pointer bg-[#111827]"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
                {/* Poster — exact 2:3 ratio */}
                <div className="relative w-full" style={{ paddingBottom: '150%' }}>
                    <img
                        src={imgSrc}
                        alt={title}
                        onError={() => setImgSrc(placeholderUrl)}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover/card:scale-105"
                        loading="lazy"
                    />

                    {/* Hover tint */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-lg" />

                    {/* Rating badge — top right, exact deployed style */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#1a1f3a]/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10">
                        <Star size={9} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-white leading-none">{displayRating}</span>
                    </div>
                </div>

                {/* Card footer — matches deployed exactly */}
                <div className="px-2 pt-2 pb-2.5">
                    {/* Title: text-sm, font-bold, white, truncated */}
                    <h3
                        className="text-white text-[13px] font-bold leading-snug truncate group-hover/card:text-[#22d3ee] transition-colors"
                        title={title}
                    >
                        {title}
                    </h3>
                    {/* Year left, MOVIE badge right */}
                    <div className="flex justify-between items-center mt-1.5">
                        <span className="text-gray-500 text-[11px] font-medium">{year || '—'}</span>
                        <span className="border border-gray-600/70 text-gray-500 text-[9px] px-1.5 py-px rounded-sm uppercase tracking-widest font-medium">
                            {movie.type === 'tv' ? 'SERIES' : 'MOVIE'}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default MovieCard;
