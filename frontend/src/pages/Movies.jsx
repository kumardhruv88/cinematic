import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import Container from '../components/layout/Container';
import FilterSidebar, { FilterContent } from '../components/layout/FilterSidebar';
import MovieGrid from '../components/movie/MovieGrid';

const Movies = () => {
    // State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open for better visibility
    const [page, setPage] = useState(1);

    // Filters
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [rating, setRating] = useState(0);
    const [year, setYear] = useState('');
    const [duration, setDuration] = useState(180); // Default max duration
    const [sortBy, setSortBy] = useState('popularity');

    // Fetch Genres
    const { data: genresData } = useQuery({
        queryKey: ['genres'],
        queryFn: async () => {
            const res = await fetch('/api/genres');
            return res.json();
        }
    });

    const genres = genresData?.data || [];

    // Fetch Movies
    const { data, isLoading, isError } = useQuery({
        queryKey: ['movies', page, selectedGenres, rating, year, duration, sortBy],
        queryFn: async () => {
            const params = new URLSearchParams({
                page,
                limit: 20,
                rating,
                sortBy,
                duration
            });

            if (year) params.append('year', year);
            if (selectedGenres.length > 0) params.append('genre', selectedGenres[selectedGenres.length - 1]);

            const res = await fetch(`/api/movies?${params.toString()}`);
            return res.json();
        },
        keepPreviousData: true
    });

    const movies = data?.data || [];
    const totalPages = data?.pages || 1;

    // Handlers
    const handleGenreChange = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPage(newPage);
    };

    return (
        <div className="pt-24 pb-20 min-h-screen bg-[#0A0E27]">
            <Container>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Explore Movies</h1>
                        <p className="text-gray-400">Discover new favorites from our vast collection</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-white"
                        >
                            <Filter size={20} />
                            Filters
                            {isSidebarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-purple ml-auto md:ml-0"
                        >
                            <option value="popularity" className="text-black">Most Popular</option>
                            <option value="latest" className="text-black">Newest Releases</option>
                            <option value="rating" className="text-black">Top Rated</option>
                            <option value="votes" className="text-black">Most Voted</option>
                        </select>
                    </div>
                </div>

                {/* Collapsible Filter Panel */}
                <div className="overflow-hidden mb-6">
                    <div
                        className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="bg-[#1E1B4B]/30 border border-white/10 rounded-xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <FilterContent
                                    genres={genres}
                                    selectedGenres={selectedGenres}
                                    onGenreChange={handleGenreChange}
                                    rating={rating}
                                    onRatingChange={setRating}
                                    year={year}
                                    onYearChange={setYear}
                                    duration={duration}
                                    onDurationChange={setDuration}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Mobile Sidebar (Only renders overlay on mobile if open, but logic handled by FilterSidebar component if we kept it) */}
                    {/* Actually, we repurpose isSidebarOpen for the panel. 
                        If we want sidebar on mobile and panel on desktop... 
                        Current implementation: Single unified panel for simplicity and fixing "empty space".
                        But sidebar on mobile is better.
                    */}

                    {/* For Mobile: stick to Sidebar? Or use the panel? 
                        Panel works on mobile too (stacking). 
                        Let's just use the panel for consistent UI as requested.
                        "use that empty space also".
                    */}

                    {/* Movie Grid */}
                    <div className="flex-1">
                        <MovieGrid movies={movies} isLoading={isLoading} />

                        {/* Pagination */}
                        {!isLoading && movies.length > 0 && (
                            <div className="flex justify-center items-center gap-4 mt-12">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft />
                                </button>

                                <span className="text-gray-400">
                                    Page <span className="text-white font-bold">{page}</span> of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Movies;
