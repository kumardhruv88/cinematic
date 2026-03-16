import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import { Star, Clock, Calendar, User, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSession } from '../context/SessionContext';

const CastCard = ({ member }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <div className="flex-none w-24 text-center">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-white/5 border border-white/10 mb-2">
                {member.profile_path && !imgError ? (
                    <img
                        src={member.profile_path}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User size={28} />
                    </div>
                )}
            </div>
            <p className="text-white text-[11px] font-semibold leading-tight truncate">{member.name}</p>
            {member.character && (
                <p className="text-gray-500 text-[10px] truncate mt-0.5">{member.character}</p>
            )}
        </div>
    );
};

const MovieDetail = () => {
    const { id } = useParams();
    const { addToHistory, addToMyList, removeFromMyList, isInMyList } = useSession();
    const [movie, setMovie] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // 1. Get Movie Details
                const res = await fetch(`/api/movie/${id}`);
                const data = await res.json();

                if (data.status === 'success') {
                    setMovie(data.data);

                    // Add to history (client-side tracking)
                    addToHistory(parseInt(id));

                    // 2. Get Similar Recommendations (based on this movie)
                    const recRes = await fetch('/api/recommendations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ watched: [parseInt(id)], limit: 10 })
                    });
                    const recData = await recRes.json();
                    if (recData.status === 'success') {
                        setSimilar(recData.data);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-white">Loading...</div>;
    if (!movie) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-white">Movie not found</div>;

    const posterUrl = movie.posterPath || `https://placehold.co/400x600/1E1B4B/FFFFFF?text=${encodeURIComponent(movie.title)}`;
    const backdropUrl = movie.posterPath ? movie.posterPath.replace('w500', 'original') : posterUrl;

    const credits = movie.credits || {};
    const cast = credits.cast || [];
    const director = credits.director;
    const writer = credits.writer;

    // Background style
    const bgStyle = {
        backgroundImage: `linear-gradient(to right, #0A0E27 30%, rgba(10, 14, 39, 0.85) 55%, rgba(10, 14, 39, 0.5)), url(${backdropUrl})`
    };

    return (
        <div className="bg-[#0A0E27] min-h-screen pb-20">
            {/* Hero Backdrop */}
            <div className="relative h-[70vh] min-h-[520px] w-full bg-cover bg-top" style={bgStyle}>
                <Container className="h-full flex items-end pt-14">
                    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-end pb-14 w-full">
                        {/* Poster */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hidden md:block rounded-xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <img src={posterUrl} alt={movie.title} className="w-full" />
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                                <div className="flex items-center gap-2 text-yellow-500">
                                    <Star fill="currentColor" size={16} />
                                    <span className="font-bold">{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={14} />
                                    <span>{movie.year}</span>
                                </div>
                                {movie.runtime && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={14} />
                                        <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                                    </div>
                                )}
                                <div className="px-2 py-0.5 border border-white/20 rounded text-xs">
                                    {movie.genres ? movie.genres.join(', ') : 'Movie'}
                                </div>
                            </div>

                            {/* Director / Writer */}
                            {(director || writer) && (
                                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                                    {director && (
                                        <div>
                                            <span className="text-gray-500 text-xs uppercase tracking-wider">Director</span>
                                            <p className="text-white font-medium">{director}</p>
                                        </div>
                                    )}
                                    {writer && (
                                        <div>
                                            <span className="text-gray-500 text-xs uppercase tracking-wider">Writer</span>
                                            <p className="text-white font-medium">{writer}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {movie.description && (
                                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {movie.description}
                                </p>
                            )}

                            <div className="flex gap-4">
                                {isInMyList(movie.movieId) ? (
                                    <button
                                        onClick={() => removeFromMyList(movie.movieId)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-accent-purple text-white text-sm font-semibold rounded-lg hover:bg-accent-purple/80 transition-colors"
                                    >
                                        <BookmarkCheck size={16} />
                                        In My List
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addToMyList(movie)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
                                    >
                                        <BookmarkPlus size={16} />
                                        Add to My List
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* Cast Section */}
            {cast.length > 0 && (
                <Container className="mt-10">
                    <h2 className="text-xl font-bold text-white mb-5 border-l-4 border-accent-cyan pl-4">
                        Cast & Crew
                    </h2>
                    <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none' }}>
                        {cast.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <CastCard member={member} />
                            </motion.div>
                        ))}
                    </div>
                </Container>
            )}

            {/* Recommendations */}
            <Container className="mt-10">
                <h2 className="text-xl font-bold text-white mb-5 border-l-4 border-accent-purple pl-4">
                    You Might Also Like
                </h2>
                {similar.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {similar.map(m => (
                            <MovieCard key={m.movieId} movie={m} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No recommendations found.</p>
                )}
            </Container>
        </div>
    );
};

export default MovieDetail;
