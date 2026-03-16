import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [genreRecs, setGenreRecs] = useState([]);
    const [detectedGenres, setDetectedGenres] = useState([]);
    const [topMovieTitle, setTopMovieTitle] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;

        const performSearch = async () => {
            setLoading(true);
            setResults([]);
            setGenreRecs([]);
            setDetectedGenres([]);

            try {
                // Step 1: keyword search
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`);
                const data = await res.json();

                if (data.status === 'success' && data.data.length > 0) {
                    setResults(data.data);

                    // Step 2: detect genres from the top result
                    const topResult = data.data[0];
                    const genres = topResult.genres || [];
                    const primaryGenre = genres[0];

                    if (primaryGenre) {
                        setDetectedGenres(genres.slice(0, 2));
                        setTopMovieTitle(topResult.title);

                        // Step 3: fetch genre-based recommendations
                        const [g1, g2] = genres;
                        const genreRes = await fetch(
                            `/api/movies?genre=${encodeURIComponent(primaryGenre)}&limit=15&sortBy=votes`
                        );
                        const genreData = await genreRes.json();
                        if (genreData.status === 'success') {
                            // filter out movies already in exact results
                            const exactIds = new Set(data.data.map(m => m.movieId));
                            const filtered = (genreData.data || []).filter(m => !exactIds.has(m.movieId));
                            setGenreRecs(filtered);
                        }
                    }
                } else {
                    setResults([]);
                    // fallback: trending
                    const trendRes = await fetch('/api/trending');
                    const trendData = await trendRes.json();
                    if (trendData.status === 'success') setGenreRecs(trendData.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    return (
        <div className="bg-[#0A0E27] min-h-screen pt-20 pb-20">
            <Container>
                {/* Header */}
                <div className="mb-8">
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Search results</p>
                    <h1 className="text-2xl font-light text-white tracking-wide">
                        Results for <span className="text-accent-cyan font-semibold">"{query}"</span>
                    </h1>
                </div>

                {loading ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {Array(10).fill(null).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Exact match results */}
                        {results.length > 0 ? (
                            <section className="mb-14">
                                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-accent-cyan rounded-full inline-block" />
                                    Exact Matches
                                </h2>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                    {results.map((m, i) => (
                                        <motion.div
                                            key={m.movieId}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                        >
                                            <MovieCard movie={m} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <p className="text-gray-500 mb-10">No exact matches found for "{query}".</p>
                        )}

                        {/* Genre-based recommendations */}
                        {genreRecs.length > 0 && (
                            <section>
                                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-accent-purple rounded-full inline-block" />
                                    {detectedGenres.length > 0
                                        ? `Because "${topMovieTitle}" is a ${detectedGenres.join(' & ')} film`
                                        : 'You might also like'}
                                </h2>
                                <p className="text-gray-600 text-xs mb-5 pl-3">
                                    More {detectedGenres.join(' & ')} recommendations
                                </p>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                    {genreRecs.map((m, i) => (
                                        <motion.div
                                            key={m.movieId}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                        >
                                            <MovieCard movie={m} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default Search;
