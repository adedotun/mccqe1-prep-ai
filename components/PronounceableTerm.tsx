import React, { useState, useRef } from 'react';
import { generatePronunciationAudio } from '../services/geminiService';
import { decode, decodeAudioData, playAudioBuffer } from '../utils/audioUtils';
import SpeakerIcon from './icons/SpeakerIcon';

interface PronounceableTermProps {
  term: string;
  audioCache: React.MutableRefObject<Map<string, AudioBuffer>>;
  audioContext: React.MutableRefObject<AudioContext | null>;
}

const PronounceableTerm: React.FC<PronounceableTermProps> = ({ term, audioCache, audioContext }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getAudioContext = (): AudioContext => {
    if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext.current;
  };

  const handlePlaySound = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent clicks
    if (isLoading) return;

    const ctx = getAudioContext();
    
    // 1. Check cache first
    if (audioCache.current.has(term)) {
        const cachedBuffer = audioCache.current.get(term);
        if (cachedBuffer) {
            playAudioBuffer(cachedBuffer, ctx);
        }
        return;
    }

    // 2. Fetch from API if not in cache
    setIsLoading(true);
    try {
      const base64Audio = await generatePronunciationAudio(term);
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx);
      
      // 3. Store in cache and play
      audioCache.current.set(term, audioBuffer);
      playAudioBuffer(audioBuffer, ctx);

    } catch (error) {
      console.error("Failed to play pronunciation", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span
      className="font-bold text-slate-800 dark:text-slate-200 relative group pr-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {term}
      {(isHovered || isLoading) && (
        <button
          onClick={handlePlaySound}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 p-1"
          aria-label={`Pronounce ${term}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <SpeakerIcon className="w-4 h-4" />
          )}
        </button>
      )}
    </span>
  );
};

export default PronounceableTerm;
