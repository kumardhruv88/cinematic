import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film } from 'lucide-react';
import Container from './Container';
import VoiceSearch from '../common/VoiceSearch';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowSearch(false);
            setSuggestions([]); // Clear suggestions on full search
            setQuery('');
        }
    };

    const handleVoiceSearch = (transcript) => {
        setQuery(transcript);
        navigate(`/search?q=${encodeURIComponent(transcript)}`);
        setShowSearch(false);
        setSuggestions([]);
        setQuery(''); // Clear query to prevent re-fetching suggestions
    };

    useEffect(() => {
        let active = true;

        const fetchSuggestions = async () => {
            if (query.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
                const data = await res.json();
                if (data.status === 'success' && active) {
                    setSuggestions(data.data);
                }
            } catch (e) {
                console.error(e);
            }
        }

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => {
            clearTimeout(timeoutId);
            active = false;
        };
    }, [query]);

    const handleSuggestionClick = (movieId) => {
        navigate(`/movie/${movieId}`);
        setShowSearch(false);
        setSuggestions([]);
        setQuery('');
    }

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Movies', path: '/movies' },
        { name: 'Series', path: '/series' },
        { name: 'Trending', path: '/trending' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E27]/80 backdrop-blur-md border-b border-white/5 h-20">
            <Container className="h-full flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-lg flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300">
                        <Film size={24} />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
                        CINEMATIQ
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-gray-300 hover:text-accent-cyan transition-colors text-sm font-medium uppercase tracking-wide"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md hidden md:block relative">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 pr-10 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <div className="absolute right-2 top-1.5">
                            <VoiceSearch onSearch={handleVoiceSearch} />
                        </div>
                    </form>

                    {/* Autocomplete Dropdown */}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-[#0A0E27] border border-white/10 rounded-lg mt-2 shadow-2xl overflow-hidden z-50">
                            {suggestions.map(movie => (
                                <div
                                    key={movie.movieId}
                                    onClick={() => handleSuggestionClick(movie.movieId)}
                                    className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                >
                                    {movie.posterPath && <img src={movie.posterPath} alt={movie.title} className="w-8 h-12 object-cover rounded" />}
                                    <div>
                                        <h4 className="text-white text-sm font-medium">{movie.title}</h4>
                                        <span className="text-xs text-gray-400">{movie.year}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Search & Menu Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <button onClick={() => setShowSearch(!showSearch)} className="text-gray-300">
                        <Search size={24} />
                    </button>
                    <button
                        className="text-gray-300"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </Container>

            {/* Mobile Search Bar */}
            {showSearch && (
                <div className="md:hidden px-4 pb-4 bg-[#0A0E27]/95">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    </form>
                </div>
            )}

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-[#0A0E27] border-b border-white/5 p-5 flex flex-col gap-4 shadow-2xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-gray-300 hover:text-accent-cyan py-2 text-lg font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navigation;
