import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film, Bookmark } from 'lucide-react';
import Container from './Container';
import VoiceSearch from '../common/VoiceSearch';
import { useSession } from '../../context/SessionContext';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const { myList } = useSession();

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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E27]/90 backdrop-blur-lg border-b border-white/5 h-14">
            <Container className="h-full flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#7C3AED] to-[#22d3ee] rounded-md flex items-center justify-center text-white">
                        <Film size={13} />
                    </div>
                    <span className="text-[12px] font-bold tracking-[0.22em] text-white hidden sm:block uppercase">
                        CINEMATIQ
                    </span>
                </Link>

                {/* Desktop Menu — light, thin, sharp uppercase */}
                <div className="hidden md:flex items-center gap-7">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-gray-400 hover:text-white transition-colors text-[11px] font-normal uppercase tracking-[0.18em]"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xs hidden md:block relative">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-1.5 pl-8 pr-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan/50 transition-colors"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search className="absolute left-2.5 top-2 text-gray-500" size={14} />
                        <div className="absolute right-1.5 top-1">
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

                <Link
                    to="/mylist"
                    className="hidden md:flex items-center gap-1.5 relative text-gray-400 hover:text-white transition-colors shrink-0"
                    title="My List"
                >
                    <Bookmark size={15} />
                    <span className="text-[11px] font-normal uppercase tracking-[0.18em]">My List</span>
                    {myList.length > 0 && (
                        <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#22d3ee] rounded-full text-[8px] font-bold text-black flex items-center justify-center">
                            {myList.length > 9 ? '9+' : myList.length}
                        </span>
                    )}
                </Link>

                {/* Mobile Search & Menu Toggle */}
                <div className="flex items-center gap-3 md:hidden">
                    <button onClick={() => setShowSearch(!showSearch)} className="text-gray-400">
                        <Search size={18} />
                    </button>
                    <button
                        className="text-gray-400"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </Container>

            {/* Mobile Search Bar */}
            {showSearch && (
                <div className="md:hidden px-4 pb-3 bg-[#0A0E27]/95">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 pl-8 text-sm text-white focus:outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </form>
                </div>
            )}

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-14 left-0 w-full bg-[#0A0E27] border-b border-white/5 p-4 flex flex-col gap-3 shadow-2xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-gray-400 hover:text-white py-1.5 text-xs font-medium uppercase tracking-widest"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        to="/mylist"
                        className="flex items-center gap-2 text-gray-400 hover:text-accent-cyan py-1.5 text-xs font-medium uppercase tracking-widest"
                        onClick={() => setIsOpen(false)}
                    >
                        <Bookmark size={13} />
                        My List {myList.length > 0 && <span className="text-accent-cyan">({myList.length})</span>}
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
