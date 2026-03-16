import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState(() => {
        const stored = localStorage.getItem('cinematiq_session_id');
        if (stored) return stored;
        const newId = uuidv4();
        localStorage.setItem('cinematiq_session_id', newId);
        return newId;
    });

    const [watchedMovies, setWatchedMovies] = useState(() => {
        const stored = localStorage.getItem('cinematiq_watched');
        return stored ? JSON.parse(stored) : [];
    });

    // myList stores full movie/series objects so we can render them without refetching
    const [myList, setMyList] = useState(() => {
        const stored = localStorage.getItem('cinematiq_mylist');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('cinematiq_watched', JSON.stringify(watchedMovies));
    }, [watchedMovies]);

    useEffect(() => {
        localStorage.setItem('cinematiq_mylist', JSON.stringify(myList));
    }, [myList]);

    const addToHistory = (movieId) => {
        setWatchedMovies(prev => {
            if (prev.includes(movieId)) return prev;
            const updated = [movieId, ...prev].slice(0, 50); // Keep last 50

            // Fire and forget tracking call
            fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, movieId, event: 'view' })
            }).catch(e => console.error("Tracking failed", e));

            return updated;
        });
    };

    const addToMyList = (movie) => {
        setMyList(prev => {
            const exists = prev.some(m => m.movieId === movie.movieId);
            if (exists) return prev;
            return [movie, ...prev];
        });
    };

    const removeFromMyList = (movieId) => {
        setMyList(prev => prev.filter(m => m.movieId !== movieId));
    };

    const isInMyList = (movieId) => myList.some(m => m.movieId === movieId);

    return (
        <SessionContext.Provider value={{
            sessionId,
            watchedMovies,
            addToHistory,
            myList,
            addToMyList,
            removeFromMyList,
            isInMyList
        }}>
            {children}
        </SessionContext.Provider>
    );
};
