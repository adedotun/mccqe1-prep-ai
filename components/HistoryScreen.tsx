import React from 'react';
import { QuizResult } from '../types';
import EmptyHistoryIllustration from './illustrations/EmptyHistoryIllustration';

interface HistoryScreenProps {
  history: QuizResult[];
  onBack: () => void;
  onClear: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack, onClear }) => {
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your entire quiz history? This action cannot be undone.')) {
      onClear();
      onBack(); // Go back after clearing
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Display history in reverse chronological order
  const sortedHistory = [...history].reverse();

  return (
    <div className="w-full text-center">
      <h2 className="text-3xl font-bold mb-4 dark:text-slate-100">Quiz History</h2>
      {sortedHistory.length > 0 ? (
        <>
          <div className="max-h-80 overflow-y-auto pr-2 space-y-3 mb-6">
            {sortedHistory.map((result, index) => {
              const percentage = Math.round((result.score / result.totalQuestions) * 100);
              return (
                <div key={index} className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-left flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {result.score}/{result.totalQuestions} ({percentage}%)
                      <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 px-2 py-0.5 rounded-full capitalize">
                        {result.level}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(result.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={handleClear} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 transition-colors w-full sm:w-auto">
              Clear History
            </button>
          </div>
        </>
      ) : (
        <>
          <EmptyHistoryIllustration className="w-48 mx-auto text-slate-200 dark:text-slate-700" />
          <p className="text-slate-600 dark:text-slate-400 my-4">You haven't completed any quizzes yet.</p>
          <button onClick={onBack} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            Start a Quiz
          </button>
        </>
      )}
    </div>
  );
};

export default HistoryScreen;