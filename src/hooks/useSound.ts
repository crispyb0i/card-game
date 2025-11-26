"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseSoundOptions {
    loop?: boolean;
}

interface UseSoundControls {
    play: () => void;
    stop: () => void;
}

/**
 * Lightweight sound effect hook using the browser Audio API.
 *
 * Usage:
 *   const { play } = useSound('/sounds/card-place.mp3', 0.9);
 *   ...
 *   play();
 *
 * For looping sounds (e.g. background/decider):
 *   const { play, stop } = useSound('/sounds/decider.mp3', 0.7, { loop: true });
 *   play(); // start
 *   stop(); // stop + reset
 */
export const useSound = (
    src: string,
    volume: number = 1,
    { loop = false }: UseSoundOptions = {},
): UseSoundControls => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Only run in the browser
        if (typeof window === 'undefined') return;

        const audio = new Audio(src);
        audio.volume = Math.max(0, Math.min(volume, 1));
        audio.loop = loop;
        audioRef.current = audio;

        return () => {
            // Clean up when unmounting or src changes
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            audioRef.current = null;
        };
    }, [src, volume, loop]);

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

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
    }, []);

    return { play, stop };
};
