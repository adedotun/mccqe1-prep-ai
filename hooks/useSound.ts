
import { useMemo, useCallback } from 'react';

/**
 * A custom hook to play a sound effect.
 * It memoizes the Audio object for performance.
 * @param soundFile The base64 data URL of the audio file.
 * @param volume The volume to play the sound at (0.0 to 1.0).
 * @returns A `play` function to trigger the sound.
 */
export const useSound = (soundFile: string, volume: number = 1) => {
  const audio = useMemo(() => {
    try {
      const a = new Audio(soundFile);
      a.volume = volume;
      return a;
    } catch (e) {
      console.error("Could not create Audio object. This can happen in a non-browser environment.");
      return null;
    }
  }, [soundFile, volume]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => {
        // Autoplay is often blocked by browsers until a user interaction.
        // This error is common and can be ignored in many cases.
        if (e.name !== 'NotAllowedError') {
           console.error("Failed to play sound:", e);
        }
      });
    }
  }, [audio]);

  return play;
};
