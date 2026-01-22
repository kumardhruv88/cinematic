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

    const movies = trendingData?.status === 'success' ? trendingData.data : [];

    return (
        <div className="pt-24 pb-20 min-h-screen bg-[#0A0E27]">
            <Container>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-accent-purple/20 rounded-xl text-accent-purple">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Trending Now</h1>
                        <p className="text-gray-400">Top rated and most popular movies across the platform</p>
                    </div>
                </div>

                <MovieGrid movies={movies} isLoading={isLoading} />
            </Container>
        </div>
    );
};

export default Trending;
