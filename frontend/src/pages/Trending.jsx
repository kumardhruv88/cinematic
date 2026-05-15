import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import Container from '../components/layout/Container';
import MovieGrid from '../components/movie/MovieGrid';

const Trending = () => {
    // Fetch Trending
    const { data: trendingData, isLoading } = useQuery({
        queryKey: ['trending-page'],
        queryFn: async () => {
            const res = await fetch('/api/trending?limit=50'); // Fetch more for full page
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });

    const movies = (trendingData?.status === 'success' ? trendingData.data : [])
        .filter(movie => {
            const img = movie.poster_url || movie.posterPath;
            return img && img !== 'N/A' && !img.includes('null');
        });

    return (
        <div className="pt-24 pb-20 min-h-screen bg-[#0A0E27]">
            <Container>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-accent-purple/20 rounded-xl text-accent-purple shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-white/90 tracking-wider mb-0.5 antialiased">TRENDING NOW</h1>
                        <p className="text-gray-400 text-[12px] font-light tracking-wide antialiased">Top rated and most popular across the platform</p>
                    </div>
                </div>

                <MovieGrid movies={movies} isLoading={isLoading} />
            </Container>
        </div>
    );
};

export default Trending;
