import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../context/SessionContext';
import HeroSection from '../components/hero/HeroSection';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import Carousel from '../components/layout/Carousel';
import { motion } from 'framer-motion';

const Section = ({ title, movies, layout = 'grid', headerAction, children, isLoading }) => (
    <section className="py-12">
        <Container>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white relative pl-4">
                    <span className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-accent-purple to-accent-cyan rounded-full"></span>
                    {title}
                </h2>
                <div className="flex items-center gap-4">
                    {headerAction}
                    <a href="#" className="text-accent-cyan hover:text-white transition-colors text-sm font-medium">View All</a>
                </div>
            </div>

            {children}

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array(5).fill(null).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : layout === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {movies.map((movie, index) => (
                        <motion.div
                            key={movie.movieId}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
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

    // ... [Rest of hooks unchanged] ...

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
                    limit: 10,
                    genre: selectedGenre
                })
            });
            return res.json();
        },
        staleTime: 60 * 60 * 1000,
        enabled: true,
        keepPreviousData: true
    });

    const trending = trendingData?.status === 'success' ? trendingData.data : [];
    const recommended = recData?.status === 'success' ? recData.data : [];
    const isLoading = trendingLoading || recLoading;

    // Select a featured movie from trending (random)
    const featuredMovie = useMemo(() => {
        if (trending.length > 0) {
            const randomIndex = Math.floor(Math.random() * trending.length);
            return trending[randomIndex];
        }
        return null;
    }, [trendingData]);

    return (
        <div className="bg-[#0A0E27] min-h-screen pb-20">
            <HeroSection movie={featuredMovie} />

            <div className="mt-[-100px] relative z-10">
                <Section title="Trending Now" movies={trending} layout="carousel" />
            </div>

            <Section
                title={selectedGenre ? `Recommended ${selectedGenre}` : "Recommended For You"}
                movies={recommended}
                layout="grid"
                isLoading={recLoading}
                headerAction={
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isFilterOpen ? 'bg-accent-purple border-accent-purple text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'}`}
                    >
                        <span className="text-sm font-medium">Filter</span>
                        <div className={`w-2 h-2 rounded-full ${selectedGenre ? 'bg-accent-cyan' : 'bg-gray-500'}`} />
                    </button>
                }
            >
                <div className="overflow-hidden">
                    <motion.div
                        initial={false}
                        animate={{ height: isFilterOpen ? 'auto' : 0, opacity: isFilterOpen ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedGenre(null)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${selectedGenre === null
                                            ? 'bg-accent-cyan text-black font-bold shadow-glow'
                                            : 'bg-black/30 text-gray-400 hover:bg-black/50 hover:text-white'
                                        }
                                    `}
                                >
                                    All Genres
                                </button>
                                {genres.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                                        className={`
                                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                                            ${selectedGenre === genre
                                                ? 'bg-accent-cyan text-black font-bold shadow-glow'
                                                : 'bg-black/30 text-gray-400 hover:bg-black/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Section>

            <Section title="New Releases" movies={trending.slice().reverse()} layout="carousel" />
        </div>
    );
};

export default Home;
