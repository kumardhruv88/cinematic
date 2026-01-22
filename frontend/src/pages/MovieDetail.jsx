import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import { Star, Clock, Calendar, Play } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSession } from '../context/SessionContext';

const MovieDetail = () => {
    const { id } = useParams();
    const { addToHistory } = useSession();
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
                    // We treat "visiting detail page" as a "watch" signal for recommendations
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

    const posterUrl = `https://placehold.co/400x600/1E1B4B/FFFFFF?text=${encodeURIComponent(movie.title)}`;

    // Background style
    const bgStyle = {
        backgroundImage: `linear-gradient(to right, #0A0E27 20%, rgba(10, 14, 39, 0.8) 50%, rgba(10, 14, 39, 0.4)), url(${posterUrl})`
    };

    return (
        <div className="bg-[#0A0E27] min-h-screen pb-20">
            {/* Hero Backdrop */}
            <div className="relative h-[70vh] w-full bg-cover bg-top" style={bgStyle}>
                <Container className="h-full flex items-center">
                    <div className="grid md:grid-cols-[300px_1fr] gap-10 items-end pb-20">
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
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{movie.title}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
                                <div className="flex items-center gap-2 text-yellow-500">
                                    <Star fill="currentColor" size={20} />
                                    <span className="font-bold text-lg">{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={20} />
                                    <span>{movie.year}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={20} />
                                    <span>2h 15m</span>
                                </div>
                                <div className="px-3 py-1 border border-white/20 rounded-full text-sm">
                                    {movie.genres ? movie.genres.join(', ') : 'Movie'}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 px-8 py-3 bg-accent-cyan text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors">
                                    <Play size={20} fill="currentColor" />
                                    Play Now
                                </button>
                                <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md">
                                    + My List
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* Recommendations */}
            <Container className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent-purple pl-4">
                    You Might Also Like
                </h2>
                {similar.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
