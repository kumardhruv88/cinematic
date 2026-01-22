import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const FilterGroup = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b border-white/10 py-4 last:border-0">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full text-left mb-2 group"
        >
            <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">{title}</span>
            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="pt-2 space-y-2">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export const FilterContent = ({ genres, selectedGenres, onGenreChange, rating, onRatingChange, year, onYearChange, duration, onDurationChange }) => {
    const [openSections, setOpenSections] = React.useState({
        genres: true,
        rating: true,
        year: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="space-y-1">
            {/* Genres */}
            <FilterGroup
                title="Genres"
                isOpen={openSections.genres}
                onToggle={() => toggleSection('genres')}
            >
                <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => onGenreChange(genre)}
                            className={`
                                px-3 py-1.5 rounded-lg text-sm transition-all
                                ${selectedGenres.includes(genre)
                                    ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </FilterGroup>

            {/* Minimum Rating */}
            <FilterGroup
                title="Minimum Rating"
                isOpen={openSections.rating}
                onToggle={() => toggleSection('rating')}
            >
                <div className="px-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>0</span>
                        <span className="text-accent-cyan font-bold">{rating}+</span>
                        <span>10</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={rating}
                        onChange={(e) => onRatingChange(parseFloat(e.target.value))}
                        className="w-full accent-accent-cyan"
                    />
                </div>
            </FilterGroup>

            {/* Year Filter */}
            <FilterGroup
                title="Release Year"
                isOpen={openSections.year}
                onToggle={() => toggleSection('year')}
            >
                <select
                    value={year || ''}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-purple"
                >
                    <option value="" className="text-black">All Years</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y} className="text-black">{y}</option>
                    ))}
                </select>
            </FilterGroup>

            {/* Duration Filter */}
            <FilterGroup
                title="Max Duration (min)"
                isOpen={true}
                onToggle={() => { }}
            >
                <div className="px-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>30</span>
                        <span className="text-accent-cyan font-bold">{duration || 180}m</span>
                        <span>180+</span>
                    </div>
                    <input
                        type="range"
                        min="30"
                        max="180"
                        step="10"
                        value={duration || 180}
                        onChange={(e) => onDurationChange && onDurationChange(parseInt(e.target.value))}
                        className="w-full accent-accent-cyan"
                    />
                </div>
            </FilterGroup>
        </div>
    );
};

const FilterSidebar = ({
    genres = [],
    selectedGenres = [],
    onGenreChange,
    rating,
    onRatingChange,
    year,
    onYearChange,
    duration,
    onDurationChange,
    isOpen,
    onClose
}) => {
    // ... Sidebar Animation Logic ...
    const sidebarVariants = {
        closed: { x: '-100%', opacity: 0 },
        open: { x: 0, opacity: 1 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />

                    {/* Sidebar Pane */}
                    <motion.aside
                        variants={sidebarVariants}
                        initial="closed"
                        animate="open"
                        exit="closed" // Ensure exit works for mobile
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className={`
                            fixed inset-y-0 left-0 z-50
                            w-[280px] bg-[#0A0E27]/95
                            border-r border-white/10
                            p-6 overflow-y-auto
                            lg:hidden
                        `}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Filters</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <FilterContent
                            genres={genres}
                            selectedGenres={selectedGenres}
                            onGenreChange={onGenreChange}
                            rating={rating}
                            onRatingChange={onRatingChange}
                            year={year}
                            onYearChange={onYearChange}
                            duration={duration}
                            onDurationChange={onDurationChange}
                        />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default FilterSidebar;

