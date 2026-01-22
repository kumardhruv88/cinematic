import React, { useState, useEffect } from 'react';
import { Search, Tv } from 'lucide-react';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import { motion } from 'framer-motion';

const Series = () => {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const fetchPopular = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/series?page=1');
            const data = await res.json();
            if (data.status === 'success') {
                setSeries(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            fetchPopular();
            setIsSearching(false);
            return;
        }

        setLoading(true);
        setIsSearching(true);
        try {
            const res = await fetch(`/api/series/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.status === 'success') {
                setSeries(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search or clear
    useEffect(() => {
        if (!query) {
            fetchPopular();
            setIsSearching(false);
        }
    }, [query]);

    // Initial Load
    useEffect(() => {
        fetchPopular();
    }, []);

    return (
        <div className="pt-24 pb-20 min-h-screen bg-[#0A0E27]">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Tv className="text-accent-cyan" />
                            TV Series
                        </h1>
                        <p className="text-gray-400">Discover popular and trending TV shows</p>
                    </div>

                    {/* Series Search Bar */}
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search TV Series..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 pl-11 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                        />
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {series.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {series.map(s => (
                                    <MovieCard key={s.movieId} movie={s} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                No series found.
                            </div>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default Series;
