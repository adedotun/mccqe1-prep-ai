import React, { useState } from 'react';
import { Question } from '../types';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import Timer from './Timer';
import { useSound } from '../hooks/useSound';
import { correctSound, incorrectSound, nextSound } from '../assets/sounds';
import { getIncorrectAnswerFeedback } from '../services/geminiService';

interface QuizScreenProps {
  questions: Question[];
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  showScores: () => void;
  isMuted: boolean;
  timerDuration: number;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, score, setScore, showScores, isMuted, timerDuration }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [incorrectFeedback, setIncorrectFeedback] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const playCorrect = useSound(correctSound, 0.5);
  const playIncorrect = useSound(incorrectSound, 0.5);
  const playNext = useSound(nextSound, 0.7);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerSelect = async (selectedIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswerIndex(selectedIndex);
    setIsAnswered(true);
    setIsTimedOut(false);
    setIncorrectFeedback(null);

    if (selectedIndex === currentQuestion.correctAnswerIndex) {
      if (!isMuted) playCorrect();
      setScore((prevScore) => prevScore + 1);
    } else {
      if (!isMuted) playIncorrect();
      setIsFeedbackLoading(true);
      const feedback = await getIncorrectAnswerFeedback(currentQuestion.question, currentQuestion.options[selectedIndex]);
      setIncorrectFeedback(feedback);
      setIsFeedbackLoading(false);
    }
  };
  
  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsTimedOut(true);
    if (!isMuted) playIncorrect();
  }

  const handleNextQuestion = () => {
    if (!isMuted) playNext();
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswerIndex(null);
      setIsAnswered(false);
      setIsTimedOut(false);
      setIncorrectFeedback(null);
      setIsFeedbackLoading(false);
    } else {
      showScores();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="w-full">
           <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>
        {timerDuration > 0 && (
            <Timer
                key={currentQuestionIndex}
                duration={timerDuration}
                isPaused={isAnswered}
                onTimeUp={handleTimeUp}
            />
        )}
      </div>
      <QuestionCard
        key={currentQuestionIndex}
        question={currentQuestion}
        onAnswerSelect={handleAnswerSelect}
        selectedAnswerIndex={selectedAnswerIndex}
        isAnswered={isAnswered}
        isTimedOut={isTimedOut}
        incorrectFeedback={incorrectFeedback}
        isFeedbackLoading={isFeedbackLoading}
      />
      {isAnswered && (
        <div className="mt-6 text-right animate-fade-in">
          <button
            onClick={handleNextQuestion}
            className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors"
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;