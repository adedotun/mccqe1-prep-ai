import React from 'react';
import ScoreIllustration from './illustrations/ScoreIllustration';

interface ScoreScreenProps {
  score: number;
  totalQuestions: number;
  onBack: () => void;
  showHistory: () => void;
}

const ScoreScreen: React.FC<ScoreScreenProps> = ({ score, totalQuestions, onBack, showHistory }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const getFeedback = () => {
    if (percentage >= 80) return "Excellent work! You have a strong grasp of the material.";
    if (percentage >= 60) return "Good job! Keep reviewing to solidify your knowledge.";
    return "Keep studying! Repetition is key to success.";
  };

  return (
    <div className="text-center w-full animate-fade-in">
      <ScoreIllustration className="w-48 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Quiz Complete!</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">You've finished the quiz.</p>
      <div className="bg-slate-100/70 dark:bg-slate-700/70 border border-slate-200/80 dark:border-slate-600/80 rounded-xl p-6 my-6">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Your Score:</p>
        <p className="text-6xl font-extrabold my-2 text-blue-600 dark:text-blue-400">
          {score} / {totalQuestions}
        </p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{percentage}%</p>
      </div>
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">{getFeedback()}</p>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onBack}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
        >
          Try Another Quiz
        </button>
        <button
          onClick={showHistory}
          className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-8 rounded-lg shadow-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-all w-full sm:w-auto"
        >
          View Progress
        </button>
      </div>
    </div>
  );
};

export default ScoreScreen;