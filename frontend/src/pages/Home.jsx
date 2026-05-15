import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../context/SessionContext';
import HeroSection from '../components/hero/HeroSection';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import Carousel from '../components/layout/Carousel';
import { motion } from 'framer-motion';

// Section that only renders if it has content (or is loading)
const Section = ({ title, movies = [], layout = 'grid', headerAction, children, isLoading }) => {
    if (!isLoading && movies.length === 0 && !children) return null;

    return (
        <section className="py-7">
            <Container>
                <div className="flex justify-between items-center mb-5">
                    {/* Section heading — matches deployed: text-2xl bold, left purple bar */}
                    <h2 className="text-2xl font-bold text-white relative pl-4">
                        <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-gradient-to-b from-[#7C3AED] to-[#22d3ee] rounded-full" />
                        {title}
                    </h2>
                    <div className="flex items-center gap-4">
                        {headerAction}
                        <a href="#" className="text-[#22d3ee] hover:text-white transition-colors text-sm font-medium">View All</a>
                    </div>
                </div>

                {children}

                {isLoading ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array(6).fill(null).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : layout === 'grid' ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {movies.map((movie, index) => (
                            <motion.div
                                key={movie.movieId}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.04 }}
                            >
                                <MovieCard movie={movie} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Carousel movies={movies} />
                )}
            </Container>
        </section>
    );
};

const Home = () => {
    const { watchedMovies } = useSession();
    const [selectedGenre, setSelectedGenre] = React.useState(null);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    // Fetch Genres
    const { data: genresData } = useQuery({
        queryKey: ['genres'],
        queryFn: async () => {
            const res = await fetch('/api/genres');
            return res.json();
        },
        staleTime: Infinity,
    });
    const genres = genresData?.data || [];

    // Fetch Trending
    const { data: trendingData, isLoading: trendingLoading } = useQuery({
        queryKey: ['trending'],
        queryFn: async () => {
            const res = await fetch('/api/trending');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // Fetch Recommendations
    const { data: recData, isLoading: recLoading } = useQuery({
        queryKey: ['recommendations', watchedMovies, selectedGenre],
        queryFn: async () => {
            const res = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    watched: watchedMovies,
                    limit: 20,
                    genre: selectedGenre
                })
            });
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
        enabled: true,
        keepPreviousData: true
    });

    // Fetch Action Movies
    const { data: actionData, isLoading: actionLoading } = useQuery({
        queryKey: ['movies', 'Action'],
        queryFn: async () => {
            const res = await fetch('/api/movies?genre=Action&limit=24&sortBy=popularity');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // Fetch Romance Movies
    const { data: romanceData, isLoading: romanceLoading } = useQuery({
        queryKey: ['movies', 'Romance'],
        queryFn: async () => {
            const res = await fetch('/api/movies?genre=Romance&limit=24&sortBy=popularity');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // Fetch Comedy Movies
    const { data: comedyData, isLoading: comedyLoading } = useQuery({
        queryKey: ['movies', 'Comedy'],
        queryFn: async () => {
            const res = await fetch('/api/movies?genre=Comedy&limit=24&sortBy=popularity');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // Fetch War Movies
    const { data: warData, isLoading: warLoading } = useQuery({
        queryKey: ['movies', 'War'],
        queryFn: async () => {
            const res = await fetch('/api/movies?genre=War&limit=24&sortBy=popularity');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // Fetch Drama Movies
    const { data: dramaData, isLoading: dramaLoading } = useQuery({
        queryKey: ['movies', 'Drama'],
        queryFn: async () => {
            const res = await fetch('/api/movies?genre=Drama&limit=24&sortBy=popularity');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // Fetch Sci-Fi Movies
    const { data: scifiData, isLoading: scifiLoading } = useQuery({
        queryKey: ['movies', 'Sci-Fi'],
        queryFn: async () => {
            const res = await fetch('/api/movies?genre=Sci-Fi&limit=24&sortBy=popularity');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // Fetch Thriller Movies
    const { data: thrillerData, isLoading: thrillerLoading } = useQuery({
        queryKey: ['movies', 'Thriller'],
        queryFn: async () => {
            const res = await fetch('/api/movies?genre=Thriller&limit=24&sortBy=popularity');
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
    });

    // All movies — filter only that they exist (allow missing posters, card shows placeholder)
    const hasPoster    = (m) => m && m.posterPath && typeof m.posterPath === 'string' && m.posterPath.startsWith('http');
    const validMovie   = (m) => m && m.movieId && m.title;

    const trending      = Array.isArray(trendingData?.data)  ? trendingData.data.filter(hasPoster)  : [];
    const recommended   = Array.isArray(recData?.data)       ? recData.data.filter(hasPoster)       : [];
    const actionMovies  = Array.isArray(actionData?.data)    ? actionData.data.filter(validMovie)   : [];
    const romanceMovies = Array.isArray(romanceData?.data)   ? romanceData.data.filter(validMovie)  : [];
    const comedyMovies  = Array.isArray(comedyData?.data)    ? comedyData.data.filter(validMovie)   : [];
    const warMovies     = Array.isArray(warData?.data)       ? warData.data.filter(validMovie)      : [];
    const dramaMovies   = Array.isArray(dramaData?.data)     ? dramaData.data.filter(validMovie)    : [];
    const scifiMovies   = Array.isArray(scifiData?.data)     ? scifiData.data.filter(validMovie)    : [];
    const thrillerMovies= Array.isArray(thrillerData?.data)  ? thrillerData.data.filter(validMovie) : [];

    // New Releases: sort trending by year desc
    const newReleases = [...trending].sort((a, b) => (b.year || 0) - (a.year || 0));

    return (
        <div className="bg-[#0A0E27] min-h-screen pb-20">
            <HeroSection />

            {/* All genre sections below hero */}
            {/* Recommended For You with genre filter */}
            <section className="py-7">
                <Container>
                    <div className="flex justify-between items-center mb-5">
                        {/* Heading — matches deployed text-2xl bold */}
                        <h2 className="text-2xl font-bold text-white relative pl-4">
                            <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-gradient-to-b from-[#7C3AED] to-[#22d3ee] rounded-full" />
                            {selectedGenre ? `Recommended · ${selectedGenre}` : 'Recommended For You'}
                        </h2>
                        <div className="flex items-center gap-4">
                            {/* Filter button — matches deployed purple filled style */}
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    isFilterOpen
                                        ? 'bg-[#7C3AED] text-white'
                                        : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white'
                                }`}
                            >
                                Filter
                                <div className={`w-2 h-2 rounded-full ${selectedGenre ? 'bg-[#22d3ee]' : 'bg-gray-500'}`} />
                            </button>
                            <a href="#" className="text-[#22d3ee] hover:text-white transition-colors text-sm font-medium">View All</a>
                        </div>
                    </div>

                    {/* Genre filter pills — rounded-full, matches deployed */}
                    <div className="overflow-hidden">
                        <motion.div
                            initial={false}
                            animate={{ height: isFilterOpen ? 'auto' : 0, opacity: isFilterOpen ? 1 : 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            <div className="bg-[#111827] border border-white/8 rounded-xl p-4 mb-5">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedGenre(null)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                            selectedGenre === null
                                                ? 'bg-[#22d3ee] text-black'
                                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                                        }`}
                                    >
                                        All Genres
                                    </button>
                                    {genres.map(genre => (
                                        <button
                                            key={genre}
                                            onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                                selectedGenre === genre
                                                    ? 'bg-[#22d3ee] text-black'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                                            }`}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {recLoading ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Array(6).fill(null).map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {recommended.map((movie, index) => (
                                <motion.div
                                    key={movie.movieId}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.04 }}
                                >
                                    <MovieCard movie={movie} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Container>
            </section>

            {/* Genre Sections — all render if data exists */}
            <Section title="Trending Now"         movies={trending}       layout="carousel" isLoading={trendingLoading} />
            <Section title="Action Packed"         movies={actionMovies}   layout="carousel" isLoading={actionLoading}   />
            <Section title="Comedy Picks"          movies={comedyMovies}   layout="carousel" isLoading={comedyLoading}   />
            <Section title="Romantic Favorites"    movies={romanceMovies}  layout="carousel" isLoading={romanceLoading}  />
            <Section title="Sci-Fi & Space"        movies={scifiMovies}    layout="carousel" isLoading={scifiLoading}    />
            <Section title="Thriller & Suspense"   movies={thrillerMovies} layout="carousel" isLoading={thrillerLoading} />
            <Section title="War & Epic Battles"    movies={warMovies}      layout="carousel" isLoading={warLoading}      />
            <Section title="Drama Masterpieces"    movies={dramaMovies}    layout="carousel" isLoading={dramaLoading}    />
            <Section title="New Releases"          movies={newReleases}    layout="carousel" isLoading={trendingLoading} />
        </div>
    );
};

export default Home;
