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

    useEffect(() => {
        localStorage.setItem('cinematiq_watched', JSON.stringify(watchedMovies));
    }, [watchedMovies]);

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

    return (
        <SessionContext.Provider value={{ sessionId, watchedMovies, addToHistory }}>
            {children}
        </SessionContext.Provider>
    );
};
