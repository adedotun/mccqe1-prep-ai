import React, { useState, useCallback, useEffect } from 'react';
import { Question, PracticeLevel, QuizResult, Theme } from './types';
import { generateQuizQuestions } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import ScoreScreen from './components/ScoreScreen';
import HistoryScreen from './components/HistoryScreen';
import StudyScreen from './components/StudyScreen';
import ClinicalEncounterScreen from './components/ClinicalEncounterScreen';
import LoadingSpinner from './components/icons/LoadingSpinner';
import SoundOnIcon from './components/icons/SoundOnIcon';
import SoundOffIcon from './components/icons/SoundOffIcon';
import BackIcon from './components/icons/BackIcon';
import SunIcon from './components/icons/SunIcon';
import MoonIcon from './components/icons/MoonIcon';
import SystemIcon from './components/icons/SystemIcon';
import HomeIcon from './components/icons/HomeIcon';
import ConfirmationModal from './components/ConfirmationModal';

type AppState = 'welcome' | 'quiz' | 'score' | 'history' | 'study' | 'encounter';
const TOTAL_QUESTIONS = 5;

const TIMER_DURATIONS: Record<PracticeLevel, number> = {
  beginner: 0,
  intermediate: 90,
  advanced: 60,
};

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<PracticeLevel>('beginner');
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(() => {
    try {
      const savedHistory = localStorage.getItem('quizHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Failed to parse quiz history from localStorage", e);
      return [];
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMuteState = localStorage.getItem('isMuted');
    return savedMuteState ? JSON.parse(savedMuteState) : false;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });

  // State for StudyScreen lifted up for navigation logic
  const [guideContent, setGuideContent] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });


  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    mediaQuery.addEventListener('change', applyTheme);
    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [theme]);


  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'system') return 'light';
      if (prevTheme === 'light') return 'dark';
      return 'system';
    });
  };

  const renderThemeIcon = () => {
    if (theme === 'light') return <SunIcon className="w-6 h-6" />;
    if (theme === 'dark') return <MoonIcon className="w-6 h-6" />;
    return <SystemIcon className="w-6 h-6" />;
  };

  const getThemeAriaLabel = () => {
    if (theme === 'system') return 'Switch to light mode';
    if (theme === 'light') return 'Switch to dark mode';
    return 'Switch to system theme';
  };

  useEffect(() => {
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const startQuiz = useCallback(async (level: PracticeLevel) => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Crafting your MCCQE1 quiz from expert-vetted sources...');
    setCurrentLevel(level);
    setTimerDuration(TIMER_DURATIONS[level]);
    try {
      const newQuestions = await generateQuizQuestions(TOTAL_QUESTIONS);
      if (newQuestions.length > 0) {
        setQuestions(newQuestions);
        setScore(0);
        setAppState('quiz');
      } else {
        setError('Failed to generate questions. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching questions. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showScores = useCallback(() => {
    const newResult: QuizResult = {
      score,
      totalQuestions: questions.length,
      level: currentLevel,
      date: new Date().toISOString(),
    };
    
    const updatedHistory = [...quizHistory, newResult];
    setQuizHistory(updatedHistory);
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
    
    setAppState('score');
  }, [score, questions.length, currentLevel, quizHistory]);

  const showWelcomeScreen = useCallback(() => {
    setQuestions([]);
    setScore(0);
    setAppState('welcome');
    setGuideContent(null);
    setCurrentTopic(null);
  }, []);

  const showHistory = useCallback(() => {
    setAppState('history');
  }, []);
  
  const showStudyMode = useCallback(() => {
    setAppState('study');
  }, []);

  const showEncounterMode = useCallback(() => {
    setAppState('encounter');
  }, []);

  const clearHistory = useCallback(() => {
    setQuizHistory([]);
    localStorage.removeItem('quizHistory');
  }, []);

  const handleBackToStudySearch = useCallback(() => {
      setGuideContent(null);
      setCurrentTopic(null);
  }, []);
  
  const handleConfirmModal = () => {
    modalState.onConfirm();
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleCancelModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleBackNavigation = useCallback(() => {
    if (appState === 'study' && guideContent !== null) {
      handleBackToStudySearch();
      return;
    }
    if (appState === 'quiz' || appState === 'encounter') {
      setModalState({
        isOpen: true,
        title: 'Exit Session?',
        message: 'Are you sure you want to exit? Your current progress will be lost.',
        onConfirm: showWelcomeScreen,
      });
    } else {
      showWelcomeScreen();
    }
  }, [appState, guideContent, handleBackToStudySearch, showWelcomeScreen]);

  const handleGoHome = useCallback(() => {
    if (appState === 'quiz' || appState === 'encounter') {
      setModalState({
        isOpen: true,
        title: 'Go Home?',
        message: 'Are you sure you want to go home? Your current progress will be lost.',
        onConfirm: showWelcomeScreen,
      });
    } else {
      showWelcomeScreen();
    }
  }, [appState, showWelcomeScreen]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center p-4 animate-fade-in">
          <p className="mb-4 text-lg text-red-600 dark:text-red-500">{error}</p>
          <button
            onClick={() => startQuiz('beginner')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (appState) {
      case 'quiz':
        return (
          <QuizScreen
            questions={questions}
            score={score}
            setScore={setScore}
            showScores={showScores}
            isMuted={isMuted}
            timerDuration={timerDuration}
          />
        );
      case 'score':
        return <ScoreScreen score={score} totalQuestions={questions.length} onBack={showWelcomeScreen} showHistory={showHistory} />;
      case 'history':
        return <HistoryScreen history={quizHistory} onBack={showWelcomeScreen} onClear={clearHistory} />;
      case 'study':
        return <StudyScreen 
            guideContent={guideContent}
            setGuideContent={setGuideContent}
            currentTopic={currentTopic}
            setCurrentTopic={setCurrentTopic}
        />;
      case 'encounter':
        return <ClinicalEncounterScreen />;
      case 'welcome':
      default:
        return <WelcomeScreen startQuiz={startQuiz} showHistory={showHistory} hasHistory={quizHistory.length > 0} showStudyMode={showStudyMode} showEncounterMode={showEncounterMode} />;
    }
  };
  
  const isEncounterMode = appState === 'encounter';

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${isEncounterMode ? 'justify-start pt-10' : 'justify-center'}`}>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleConfirmModal}
        onCancel={handleCancelModal}
      />
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {appState !== 'welcome' && (
          <button
            onClick={handleGoHome}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 backdrop-blur-sm"
            aria-label="Go to Home"
          >
            <HomeIcon className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 backdrop-blur-sm"
          aria-label={getThemeAriaLabel()}
        >
          {renderThemeIcon()}
        </button>
        <button
          onClick={toggleMute}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 backdrop-blur-sm"
          aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? <SoundOffIcon className="w-6 h-6" /> : <SoundOnIcon className="w-6 h-6" />}
        </button>
      </div>

       <div className={`w-full mx-auto transition-all duration-500 ${isEncounterMode ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <header className={`text-center transition-all duration-300 ${isEncounterMode ? 'mb-4' : 'mb-8'}`}>
          <h1 className={`${isEncounterMode ? 'text-3xl' : 'text-4xl md:text-5xl'} font-extrabold text-slate-900 dark:text-white tracking-tight`}>MCCQE1 Prep AI</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Your AI-powered study partner for the Canadian medical licensing exam.</p>
        </header>
        <main 
          key={appState}
          className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/60 p-6 md:p-8 flex items-center justify-center relative border border-slate-200/80 dark:border-slate-700/80 animate-fade-in-up ${isEncounterMode ? 'min-h-[calc(100vh-200px)]' : 'min-h-[400px]'}`}
        >
          {appState !== 'welcome' && (
              <button
                onClick={handleBackNavigation}
                className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/80 z-10"
                aria-label="Back to main menu"
              >
                <BackIcon className="w-6 h-6" />
              </button>
          )}
          {renderContent()}
        </main>
        <footer className={`text-center text-sm text-slate-500 dark:text-slate-400 transition-all duration-300 ${isEncounterMode ? 'mt-4' : 'mt-8'}`}>
            <p>Powered by Google's Gemini API. For educational purposes only.</p>
            <p className="mt-1">With ❤️ from Adedotun to A Doctor and all Doctors</p>
        </footer>
      </div>
    </div>
  );
};

export default App;