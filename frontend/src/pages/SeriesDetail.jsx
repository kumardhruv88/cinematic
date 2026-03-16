import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import { Star, Calendar, Play, User, BookmarkPlus, BookmarkCheck } from 'lucide-react';
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

const SeriesDetail = () => {
    const { id } = useParams();
    const { addToMyList, removeFromMyList, isInMyList } = useSession();
    const [series, setSeries] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);

    // Season State
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [episodes, setEpisodes] = useState([]);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/series/${id}`);
                const data = await res.json();

                if (data.status === 'success') {
                    setSeries(data.data.details);
                    setSimilar(data.data.recommendations || []);
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

    // Fetch Episodes when season changes
    useEffect(() => {
        const fetchEpisodes = async () => {
            if (!id) return;
            setLoadingEpisodes(true);
            try {
                const res = await fetch(`/api/series/${id}/season/${selectedSeason}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setEpisodes(data.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingEpisodes(false);
            }
        };

        fetchEpisodes();
    }, [id, selectedSeason]);

    if (loading) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-white">Loading...</div>;
    if (!series) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-white">Series not found</div>;

    const posterUrl = series.posterPath || `https://placehold.co/400x600/1E1B4B/FFFFFF?text=${encodeURIComponent(series.title)}`;
    const backdropUrl = series.posterPath ? series.posterPath.replace('w500', 'original') : posterUrl;

    const credits = series.credits || {};
    const cast = credits.cast || [];
    const creator = credits.creator;

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
                            <img src={posterUrl} alt={series.title} className="w-full" />
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{series.title}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                                <div className="flex items-center gap-2 text-yellow-500">
                                    <Star fill="currentColor" size={16} />
                                    <span className="font-bold">{series.rating ? series.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={14} />
                                    <span>{series.year}</span>
                                </div>
                                <div className="px-2 py-0.5 border border-white/20 rounded text-xs">
                                    {series.genres ? series.genres.join(', ') : 'TV Series'}
                                </div>
                            </div>

                            {/* Creator */}
                            {creator && (
                                <div className="mb-4">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Creator / Producer</span>
                                    <p className="text-white font-medium text-sm">{creator}</p>
                                </div>
                            )}

                            <p className="text-gray-300 text-sm mb-6 leading-relaxed line-clamp-3">
                                {series.description}
                            </p>

                            <div className="flex gap-4">
                                {isInMyList(series.movieId) ? (
                                    <button
                                        onClick={() => removeFromMyList(series.movieId)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-accent-purple text-white text-sm font-semibold rounded-lg hover:bg-accent-purple/80 transition-colors"
                                    >
                                        <BookmarkCheck size={16} />
                                        In My List
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addToMyList(series)}
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

            {/* Episodes Section */}
            <Container className="mt-10">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white">Episodes</h2>

                    <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-purple"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <option key={n} value={n} className="text-black">Season {n}</option>
                        ))}
                    </select>
                </div>

                {loadingEpisodes ? (
                    <div className="text-center py-10 text-gray-500">Loading episodes...</div>
                ) : episodes.length > 0 ? (
                    <div className="space-y-4">
                        {episodes.map(ep => (
                            <motion.div
                                key={ep.episode_number}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-4 hover:bg-white/10 transition-colors group cursor-pointer"
                            >
                                <div className="w-40 aspect-video bg-black/50 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {ep.still_path ? (
                                        <img src={ep.still_path} alt={ep.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Image</div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                        <Play fill="white" size={28} />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white">
                                            {ep.episode_number}. {ep.name}
                                        </h3>
                                        <span className="text-xs text-gray-400 ml-4 shrink-0">{ep.air_date}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2">{ep.overview}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No episodes found for this season.</p>
                )}

            </Container>

            {/* Recommendations */}
            <Container className="mt-10">
                <h2 className="text-xl font-bold text-white mb-5 border-l-4 border-accent-purple pl-4">
                    Recommended Series
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

export default SeriesDetail;
