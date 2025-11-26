"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface UseSoundOptions {
    loop?: boolean;
}

interface UseSoundControls {
    play: () => void;
    stop: () => void;
}

/**
 * Lightweight sound effect hook using the browser Audio API.
 * Now integrated with Zustand store for global volume control.
 */
export const useSound = (
    src: string,
    relativeVolume: number = 1, // Volume relative to global volume (0-1)
    { loop = false }: UseSoundOptions = {},
): UseSoundControls => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Subscribe to global volume from store
    // We use getState() in callbacks to avoid re-creating them, 
    // but we need a reactive value for the effect to update the audio element
    const globalVolume = useStore((state) => state.volume);

    useEffect(() => {
        // Only run in the browser
        if (typeof window === 'undefined') return;

        const audio = new Audio(src);
        audio.volume = Math.max(0, Math.min(relativeVolume * globalVolume, 1));
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
    }, [src, relativeVolume, loop]); // We intentionally don't include globalVolume here to avoid re-creating Audio on volume change

    // React to volume changes without re-creating the audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(relativeVolume * globalVolume, 1));
        }
    }, [globalVolume, relativeVolume]);

    const play = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Ensure volume is up to date (though the effect above should handle it)
        const currentGlobalVolume = useStore.getState().volume;
        audio.volume = Math.max(0, Math.min(relativeVolume * currentGlobalVolume, 1));

        // Restart from the beginning so rapid replays feel snappy
        audio.currentTime = 0;

        audio.play().catch(() => {
            // Fail silently if the user agent blocks autoplay.
        });
    }, [relativeVolume]);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
    }, []);

    return { play, stop };
};
