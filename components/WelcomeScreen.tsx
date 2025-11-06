
import React, { useState } from 'react';
import { PracticeLevel } from '../types';
import HeroIllustration from './illustrations/HeroIllustration';
import EncounterIllustration from './illustrations/EncounterIllustration';

interface WelcomeScreenProps {
  startQuiz: (level: PracticeLevel) => void;
  showHistory: () => void;
  hasHistory: boolean;
  showStudyMode: () => void;
  showEncounterMode: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ startQuiz, showHistory, hasHistory, showStudyMode, showEncounterMode }) => {
  const [selectedLevel, setSelectedLevel] = useState<PracticeLevel>('beginner');

  const levels: { id: PracticeLevel; name: string; description: string }[] = [
    { id: 'beginner', name: 'Beginner', description: 'No time limit per question.' },
    { id: 'intermediate', name: 'Intermediate', description: '90 seconds per question.' },
    { id: 'advanced', name: 'Advanced', description: '60 seconds per question.' },
  ];

  return (
    <div className="w-full grid md:grid-cols-2 items-center gap-12 animate-fade-in">
       <div className="hidden md:flex justify-center">
        <HeroIllustration className="w-full max-w-sm text-slate-200 dark:text-slate-700" />
      </div>
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Ready to Start?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">Choose a study mode below.</p>

        <div className="space-y-4 mb-8">
            <button
              onClick={showEncounterMode}
              className="w-full p-4 border-2 rounded-xl text-left transition-all duration-200 group bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700 hover:ring-4 hover:ring-blue-500/20"
            >
              <div className="flex items-center gap-4">
                <EncounterIllustration className="w-12 h-12 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Clinical Encounter</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Diagnose a virtual patient in a real-time simulation.</p>
                </div>
              </div>
            </button>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Or, Take a Quick Quiz</h3>
             <div className="space-y-3 mb-6">
                {levels.map((level) => (
                    <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-200 group ${
                        selectedLevel === level.id
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                    >
                    <h4 className="font-semibold text-base text-slate-800 dark:text-slate-200">{level.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{level.description}</p>
                    </button>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <button
                    onClick={() => startQuiz(selectedLevel)}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                >
                    Start {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Quiz
                </button>
                 <div className="flex items-center justify-center sm:justify-start gap-6 pt-2">
                    {hasHistory && (
                    <button
                        onClick={showHistory}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                        View Progress
                    </button>
                    )}
                    <button
                    onClick={showStudyMode}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                    Study Topics
                    </button>
                </div>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default WelcomeScreen;
