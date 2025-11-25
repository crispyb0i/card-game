"use client";

import { useEffect, useRef, useCallback } from 'react';

/**
 * Lightweight sound effect hook using the browser Audio API.
 *
 * Usage:
 *   const playCardPlace = useSound('/sounds/card-place.wav', 0.9);
 *   ...
 *   playCardPlace();
 */
export const useSound = (src: string, volume: number = 1) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Only run in the browser
        if (typeof window === 'undefined') return;

        const audio = new Audio(src);
        audio.volume = Math.max(0, Math.min(volume, 1));
        audioRef.current = audio;

        return () => {
            // Clean up when unmounting or src changes
            audioRef.current = null;
        };
    }, [src, volume]);

    const play = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Restart from the beginning so rapid replays feel snappy
        audio.currentTime = 0;
        // Some browsers will block this if it is not user-gesture driven,
        // but all our calls are triggered from clicks/drags.
        audio.play().catch(() => {
            // Fail silently if the user agent blocks autoplay.
        });
    }, []);

    return play;
};
