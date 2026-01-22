import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setResults(data.data);
                    if (data.data.length === 0) {
                        // Fetch trending as fallback
                        const trendRes = await fetch('/api/trending');
                        const trendData = await trendRes.json();
                        if (trendData.status === 'success') setSuggestions(trendData.data);
                    } else {
                        setSuggestions([]);
                    }
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
        <div className="bg-[#0A0E27] min-h-screen pt-24 pb-20">
            <Container>
                <h1 className="text-3xl font-bold text-white mb-8">
                    Search Results for <span className="text-accent-cyan">"{query}"</span>
                </h1>

                {loading ? (
                    <p className="text-gray-400">Searching...</p>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map(m => (
                            <MovieCard key={m.movieId} movie={m} />
                        ))}
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-400 mb-8 text-lg">No matches found. Check out what's trending:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {suggestions.map(m => (
                                <MovieCard key={m.movieId} movie={m} />
                            ))}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Search;
