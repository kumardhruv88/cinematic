import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

import MovieDetail from './pages/MovieDetail';
import Search from './pages/Search';

import SeriesDetail from './pages/SeriesDetail';

import Movies from './pages/Movies';
// Placeholder Pages
import Trending from './pages/Trending';
import Series from './pages/Series';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './context/SessionContext';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <Router>
                    <div className="flex flex-col min-h-screen bg-[#0A0E27] text-white font-sans selection:bg-accent-cyan selection:text-black">
                        <Navigation />

                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/movies" element={<Movies />} />
                                <Route path="/series" element={<Series />} />
                                <Route path="/series/:id" element={<SeriesDetail />} />
                                <Route path="/trending" element={<Trending />} />
                                <Route path="/search" element={<Search />} />
                                <Route path="/movie/:id" element={<MovieDetail />} />
                            </Routes>
                        </main>

                        <Footer />
                    </div>
                </Router>
            </SessionProvider>
        </QueryClientProvider>
    );
}

export default App;
