import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import {
    Star, Clock, Calendar, User, BookmarkPlus, BookmarkCheck,
    Play, X, ExternalLink, Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';

// ─── Cast Card ─────────────────────────────────────────────────
const CastCard = ({ member }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <div className="flex-none text-center" style={{ width: 92 }}>
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-white/5 border border-white/10 mb-1.5">
                {member.profile_path && !imgError ? (
                    <img src={member.profile_path} alt={member.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <User size={22} />
                    </div>
                )}
            </div>
            <p className="text-white text-[11px] font-semibold leading-tight truncate px-1">{member.name}</p>
            {member.character && (
                <p className="text-gray-500 text-[10px] truncate px-1 mt-0.5">{member.character}</p>
            )}
        </div>
    );
};

// ─── Trailer Modal ─────────────────────────────────────────────
const TrailerModal = ({ videoKey, movieTitle, movieYear, onClose }) => {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent((movieTitle || '') + ' official trailer')}`;
    const ytDirectUrl = videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : ytSearchUrl;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                className="relative w-full max-w-4xl mx-4 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                {videoKey ? (
                    <>
                        <div className="aspect-video">
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
                                title="Movie Trailer" allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen className="w-full h-full"
                            />
                        </div>
                        <div className="bg-black/80 px-4 py-2 flex items-center justify-between">
                            <span className="text-gray-500 text-xs">Blocked? Open directly on YouTube.</span>
                            <a href={ytDirectUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-semibold">
                                <Youtube size={12} /> Open on YouTube
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="aspect-video bg-[#0A0E27] flex flex-col items-center justify-center gap-4">
                        <Youtube size={40} className="text-red-500" />
                        <p className="text-white font-semibold">No embedded trailer found</p>
                        <a href={ytSearchUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-all">
                            <Youtube size={16} /> Search on YouTube
                        </a>
                    </div>
                )}
                <button onClick={onClose}
                    className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white z-10">
                    <X size={14} />
                </button>
            </motion.div>
        </motion.div>
    );
};

// ─── Provider link builder ──────────────────────────────────────
const getProviderLink = (provider, movieTitle, tmdbLink) => {
    const name = (provider.provider_name || '').toLowerCase();
    const q = encodeURIComponent(movieTitle);
    if (name.includes('netflix'))                     return `https://www.netflix.com/search?q=${q}`;
    if (name.includes('amazon') || name.includes('prime')) return `https://www.amazon.com/s?k=${q}&i=instant-video`;
    if (name.includes('disney'))                      return `https://www.disneyplus.com/search/${q}`;
    if (name.includes('apple'))                       return `https://tv.apple.com/search?term=${q}`;
    if (name.includes('hotstar'))                     return `https://www.hotstar.com/in/search?q=${q}`;
    if (name.includes('jio'))                         return `https://www.jiocinema.com/search/${q}`;
    if (name.includes('zee'))                         return `https://www.zee5.com/search?q=${q}`;
    if (name.includes('youtube'))                     return `https://www.youtube.com/results?search_query=${q}+full+movie`;
    return tmdbLink || `https://www.justwatch.com/in/search?q=${q}`;
};

// ─── Main Component ─────────────────────────────────────────────
const MovieDetail = () => {
    const { id } = useParams();
    const { addToHistory, addToMyList, removeFromMyList, isInMyList } = useSession();

    const [movie,       setMovie]       = useState(null);
    const [similar,     setSimilar]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [trailerKey,  setTrailerKey]  = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [providers,   setProviders]   = useState(null);

    useEffect(() => {
        const go = async () => {
            setLoading(true);
            setTrailerKey(null);
            setProviders(null);
            setSimilar([]);
            try {
                const res  = await fetch(`/api/movie/${id}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setMovie(data.data);
                    addToHistory(parseInt(id));
                    const [recData, vidData, provData] = await Promise.all([
                        fetch('/api/recommendations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ watched: [parseInt(id)], limit: 12 })
                        }).then(r => r.json()).catch(() => ({})),
                        fetch(`/api/movie/${id}/videos`).then(r => r.json()).catch(() => ({})),
                        fetch(`/api/movie/${id}/providers`).then(r => r.json()).catch(() => ({})),
                    ]);
                    if (recData.status  === 'success') setSimilar(recData.data || []);
                    if (vidData.status  === 'success' && vidData.data?.length) setTrailerKey(vidData.data[0].key);
                    if (provData.status === 'success') setProviders(provData.data);
                }
            } catch (err) {
                console.error('MovieDetail:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) go();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-[3px] border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    );

    if (!movie) return (
        <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-gray-400">Movie not found</div>
    );

    const posterUrl    = movie.posterPath || `https://placehold.co/300x450/111827/6B7280?text=${encodeURIComponent(movie.title)}`;
    const backdropUrl  = movie.posterPath ? movie.posterPath.replace('w500', 'original') : null;
    const credits      = movie.credits || {};
    const cast         = credits.cast   || [];
    const director     = credits.director;
    const writer       = credits.writer;

    const allProviders = providers ? [
        ...(providers.flatrate || []),
        ...(providers.rent     || []),
        ...(providers.buy      || []),
    ].filter((p, i, arr) => arr.findIndex(x => x.provider_id === p.provider_id) === i) : [];

    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`;

    // Runtime formatted
    const runtime = movie.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : null;

    // Genres — comma-separated in ONE pill (matches deployed)
    const genreText = movie.genres?.length ? movie.genres.join(', ') : null;

    return (
        <div className="bg-[#0A0E27] min-h-screen pb-16">
            <AnimatePresence>
                {showTrailer && (
                    <TrailerModal
                        videoKey={trailerKey}
                        movieTitle={movie.title}
                        movieYear={movie.year}
                        onClose={() => setShowTrailer(false)}
                    />
                )}
            </AnimatePresence>

            {/* ── Hero Section ── backdrop fills background ──── */}
            <div
                className="relative w-full"
                style={{
                    background: backdropUrl
                        ? `linear-gradient(to right, #0A0E27 35%, rgba(10,14,39,0.82) 55%, rgba(10,14,39,0.45) 100%), url(${backdropUrl}) center/cover no-repeat`
                        : '#0A0E27',
                }}
            >
                <Container>
                    <div className="flex gap-6 py-10 items-start">

                        {/* Poster — 220px fixed, matches deployed */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-none w-[200px] md:w-[220px] rounded-lg overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.7)] border border-white/8"
                        >
                            <img src={posterUrl} alt={movie.title} className="w-full block" />
                        </motion.div>

                        {/* Content — exactly matches deployed layout */}
                        <motion.div
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.06 }}
                            className="flex-1 pt-2 min-w-0"
                        >
                            {/* Title — font-semibold is sharper/thinner than bold, matches deployed */}
                            <h1 className="text-[2.2rem] md:text-4xl font-semibold text-white leading-tight mb-3">
                                {movie.title}
                            </h1>

                            {/* Meta row — star + year + runtime + genre pill — all inline, compact */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                                {/* Rating */}
                                <div className="flex items-center gap-1.5">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-white text-sm font-bold">
                                        {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>

                                {/* Year */}
                                {movie.year && (
                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                        <Calendar size={13} />
                                        <span>{movie.year}</span>
                                    </div>
                                )}

                                {/* Runtime */}
                                {runtime && (
                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                        <Clock size={13} />
                                        <span>{runtime}</span>
                                    </div>
                                )}

                                {/* Genres — ONE pill, comma-separated, matches deployed */}
                                {genreText && (
                                    <span className="px-2 py-0.5 border border-gray-600 text-gray-300 text-xs rounded">
                                        {genreText}
                                    </span>
                                )}
                            </div>

                            {/* Director / Writer — small gray label + white bold name */}
                            {(director || writer) && (
                                <div className="flex gap-8 mb-3">
                                    {director && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Director</p>
                                            <p className="text-white text-[13px] font-bold">{director}</p>
                                        </div>
                                    )}
                                    {writer && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Writer</p>
                                            <p className="text-white text-[13px] font-bold">{writer}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description — small gray text, 3-line clamp, matches deployed */}
                            {movie.description && (
                                <p className="text-gray-400 text-[13px] font-light leading-relaxed mb-5 line-clamp-3 max-w-[580px]">
                                    {movie.description}
                                </p>
                            )}

                            {/* Action buttons — Watch Trailer (red, user requested) + Add to My List */}
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                                <button
                                    onClick={() => trailerKey ? setShowTrailer(true) : window.open(ytSearchUrl, '_blank')}
                                    className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-[0_0_18px_rgba(220,38,38,0.3)]"
                                >
                                    <Play size={13} fill="currentColor" />
                                    Watch Trailer
                                </button>

                                {isInMyList(movie.movieId) ? (
                                    <button
                                        onClick={() => removeFromMyList(movie.movieId)}
                                        className="flex items-center gap-2 px-5 py-2 bg-[#7C3AED]/80 hover:bg-[#7C3AED] text-white text-sm font-semibold rounded-lg transition-all"
                                    >
                                        <BookmarkCheck size={14} /> In My List
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addToMyList(movie)}
                                        className="flex items-center gap-2 px-5 py-2 bg-[#1e2333] hover:bg-[#252d45] text-white text-sm font-semibold rounded-lg transition-all border border-gray-600"
                                    >
                                        <BookmarkPlus size={14} /> Add to My List
                                    </button>
                                )}
                            </div>

                            {/* Where to Watch — compact, inline logos */}
                            {allProviders.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Where to Watch</p>
                                    <div className="flex flex-wrap gap-2">
                                        {allProviders.slice(0, 5).map(p => (
                                            <a
                                                key={p.provider_id}
                                                href={getProviderLink(p, movie.title, providers?.link)}
                                                target="_blank" rel="noopener noreferrer"
                                                title={`Watch on ${p.provider_name}`}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                                            >
                                                {p.logo_path && (
                                                    <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                                        alt={p.provider_name} className="w-5 h-5 rounded" />
                                                )}
                                                <span className="text-white text-[11px] font-medium group-hover:text-[#22d3ee] transition-colors">
                                                    {p.provider_name}
                                                </span>
                                                <ExternalLink size={9} className="text-gray-600 group-hover:text-[#22d3ee]" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* ── Cast & Crew ────────────────────────────────── */}
            {cast.length > 0 && (
                <Container className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-5 relative pl-4">
                        <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-gradient-to-b from-[#7C3AED] to-[#22d3ee] rounded-full" />
                        Cast &amp; Crew
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                        {cast.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
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

            {/* ── You Might Also Like ────────────────────────── */}
            {similar.length > 0 && (
                <Container className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-5 relative pl-4">
                        <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-gradient-to-b from-[#7C3AED] to-[#22d3ee] rounded-full" />
                        You Might Also Like
                    </h2>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {similar.map(m => <MovieCard key={m.movieId} movie={m} />)}
                    </div>
                </Container>
            )}
        </div>
    );
};

export default MovieDetail;
