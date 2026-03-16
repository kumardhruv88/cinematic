import React from 'react';
import { motion } from 'framer-motion';
import { BookmarkCheck, Trash2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import MovieCard from '../components/movie/MovieCard';
import { useSession } from '../context/SessionContext';

const MyList = () => {
    const { myList, removeFromMyList } = useSession();

    return (
        <div className="bg-[#0A0E27] min-h-screen pb-20 pt-20">
            <Container>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <BookmarkCheck size={22} className="text-accent-cyan" />
                        <h1 className="text-2xl font-semibold text-white tracking-wide">My List</h1>
                    </div>
                    <p className="text-gray-500 text-sm">
                        {myList.length > 0
                            ? `${myList.length} title${myList.length !== 1 ? 's' : ''} saved`
                            : 'Save movies and series to watch them later'}
                    </p>
                </motion.div>

                {myList.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Bookmark size={36} className="text-gray-600" />
                        </div>
                        <h2 className="text-xl font-light text-white mb-3">Nothing saved yet</h2>
                        <p className="text-gray-500 text-sm max-w-xs mb-8">
                            Browse movies and series, then tap "Add to My List" to save them here.
                        </p>
                        <Link
                            to="/"
                            className="px-6 py-2.5 bg-accent-cyan text-black text-sm font-semibold rounded-lg hover:bg-cyan-300 transition-colors"
                        >
                            Browse Movies
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {myList.map((movie, index) => (
                            <motion.div
                                key={movie.movieId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="relative group/item"
                            >
                                <MovieCard movie={movie} />
                                {/* Remove button */}
                                <button
                                    onClick={() => removeFromMyList(movie.movieId)}
                                    className="absolute top-2 left-2 z-10 p-1.5 bg-black/70 backdrop-blur-sm rounded-md opacity-0 group-hover/item:opacity-100 hover:bg-red-600/80 transition-all"
                                    title="Remove from My List"
                                >
                                    <Trash2 size={13} className="text-white" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
};

export default MyList;
