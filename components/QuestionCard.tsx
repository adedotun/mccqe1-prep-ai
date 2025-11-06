
import React, { useEffect, useRef } from 'react';
import { Question } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (index: number) => void;
  selectedAnswerIndex: number | null;
  isAnswered: boolean;
  isTimedOut: boolean;
  incorrectFeedback: string | null;
  isFeedbackLoading: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswerSelect,
  selectedAnswerIndex,
  isAnswered,
  isTimedOut,
  incorrectFeedback,
  isFeedbackLoading,
}) => {
  const { question: questionText, options, correctAnswerIndex, explanation, topics } = question;
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAnswered) {
      const timer = setTimeout(() => {
        explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100); // Small delay to ensure the element is rendered
      return () => clearTimeout(timer);
    }
  }, [isAnswered]);


  const getOptionClasses = (index: number) => {
    let baseClasses =
      'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center text-slate-800 dark:text-slate-200 text-base md:text-lg';
    
    // Before an answer is submitted
    if (!isAnswered) {
      return `${baseClasses} bg-slate-100/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-700/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400/50`;
    }

    // After an answer is submitted
    const isCorrect = index === correctAnswerIndex;
    const isSelected = index === selectedAnswerIndex;

    if (isCorrect) {
      // The correct answer is always highlighted in green.
      return `${baseClasses} bg-green-100 dark:bg-green-900/50 border-green-500 dark:border-green-600 text-green-900 dark:text-green-200 font-bold ring-2 ring-green-500/20`;
    }
    
    if (isSelected) {
      // The user's incorrect selection is highlighted in red.
      return `${baseClasses} bg-red-100 dark:bg-red-900/50 border-red-500 dark:border-red-600 text-red-900 dark:text-red-200 font-bold ring-2 ring-red-500/20`;
    }

    // Other incorrect options fade into the background.
    return `${baseClasses} border-slate-200 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-800/60 opacity-60 cursor-not-allowed`;
  };

  const getIcon = (index: number) => {
    if (!isAnswered) return null;
    if (index === correctAnswerIndex) {
      return <CheckIcon className="h-7 w-7 text-green-600 dark:text-green-400 flex-shrink-0" />;
    }
    if (index === selectedAnswerIndex) {
      return <XIcon className="h-7 w-7 text-red-600 dark:text-red-400 flex-shrink-0" />;
    }
    return null;
  };

  return (
    <div className="w-full animate-fade-in">
      <h3 className="text-xl md:text-2xl font-bold leading-tight mb-4 text-slate-900 dark:text-slate-100">{questionText}</h3>
      {topics && topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {topics.map((topic, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">
              {topic}
            </span>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            className={getOptionClasses(index)}
            disabled={isAnswered}
          >
            <span className="pr-4">{option}</span>
            {getIcon(index)}
          </button>
        ))}
      </div>
      {isAnswered && (
        <div 
          ref={explanationRef} 
          className="mt-8 space-y-4 animate-fade-in"
        >
          {isTimedOut && (
            <h4 className="font-bold text-red-600 dark:text-red-500 text-lg">Time's Up!</h4>
          )}

          {(isFeedbackLoading || incorrectFeedback) && (
              <div className="p-4 bg-red-50/70 dark:bg-red-950/70 rounded-xl border border-red-200/80 dark:border-red-800/80">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Feedback on Your Answer:</h4>
                {isFeedbackLoading ? (
                    <p className="mt-2 text-slate-700 dark:text-slate-300 italic">Generating feedback...</p>
                ) : (
                    <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed">{incorrectFeedback}</p>
                )}
              </div>
          )}
          
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/70 rounded-xl border border-blue-200/80 dark:border-blue-800/80">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Explanation:</h4>
            <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
