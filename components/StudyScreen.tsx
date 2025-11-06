import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateStudyGuide, getTermDefinition, findRelevantVideos } from '../services/geminiService';
import { SavedStudyGuide, VideoExplanation, StudyProgress } from '../types';
import SearchIcon from './icons/SearchIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import BookmarkIcon from './icons/BookmarkIcon';
import BookmarkFilledIcon from './icons/BookmarkFilledIcon';
import TrashIcon from './icons/TrashIcon';
import CardiologyIcon from './icons/topics/CardiologyIcon';
import NeurologyIcon from './icons/topics/NeurologyIcon';
import PulmonologyIcon from './icons/topics/PulmonologyIcon';
import PsychiatryIcon from './icons/topics/PsychiatryIcon';
import PediatricsIcon from './icons/topics/PediatricsIcon';
import PublicHealthIcon from './icons/topics/PublicHealthIcon';
import EthicsIcon from './icons/topics/EthicsIcon';
import ObgynIcon from './icons/topics/ObgynIcon';
import EmptySavedGuidesIllustration from './illustrations/EmptySavedGuidesIllustration';
import GlossaryIllustration from './illustrations/GlossaryIllustration';
import BulletIcon from './icons/BulletIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import MenuAltIcon from './icons/MenuAltIcon';
import CheckIcon from './icons/CheckIcon';
import ReminderManager from './ReminderManager';
import PronounceableTerm from './PronounceableTerm';

interface StudyScreenProps {
    guideContent: string | null;
    setGuideContent: React.Dispatch<React.SetStateAction<string | null>>;
    currentTopic: string | null;
    setCurrentTopic: React.Dispatch<React.SetStateAction<string | null>>;
}

const popularTopics = [
    { name: 'Cardiology', icon: <CardiologyIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'Neurology', icon: <NeurologyIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'Pulmonology', icon: <PulmonologyIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'Psychiatry', icon: <PsychiatryIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'Pediatrics', icon: <PediatricsIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'Public Health', icon: <PublicHealthIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'Medical Ethics', icon: <EthicsIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'OB/GYN', icon: <ObgynIcon className="w-8 h-8 mx-auto mb-2" /> },
];

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const StudyScreen: React.FC<StudyScreenProps> = ({ guideContent, setGuideContent, currentTopic, setCurrentTopic }) => {
  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const [videos, setVideos] = useState<VideoExplanation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [areVideosLoading, setAreVideosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'videos'>('guide');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const [savedGuides, setSavedGuides] = useState<SavedStudyGuide[]>(() => {
    try {
      const saved = localStorage.getItem('savedStudyGuides');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved study guides from localStorage", e);
      return [];
    }
  });

  const [studyProgress, setStudyProgress] = useState<StudyProgress>(() => {
    try {
      const saved = localStorage.getItem('studyProgress');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to parse study progress from localStorage", e);
      return {};
    }
  });

  const [glossarySearchTerm, setGlossarySearchTerm] = useState('');
  const [glossaryDefinition, setGlossaryDefinition] = useState<string | null>(null);
  const [isGlossaryLoading, setIsGlossaryLoading] = useState(false);
  const [glossaryError, setGlossaryError] = useState<string | null>(null);
  const [searchedTerm, setSearchedTerm] = useState<string | null>(null);
  
  const [isTocVisible, setIsTocVisible] = useState(true);
  const [toc, setToc] = useState<{ title: string; id: string }[]>([]);

  const audioCache = useRef(new Map<string, AudioBuffer>());
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('savedStudyGuides', JSON.stringify(savedGuides));
  }, [savedGuides]);

  useEffect(() => {
    localStorage.setItem('studyProgress', JSON.stringify(studyProgress));
  }, [studyProgress]);
  
  useEffect(() => {
    if (typeof guideContent === 'string') {
        const headings = guideContent
            .split('\n')
            .filter(line => line.trim().startsWith('## '));
        
        const newToc = headings.map(heading => {
            const title = heading.replace('## ', '').trim();
            return {
                title,
                id: slugify(title),
            };
        });
        setToc(newToc);
    } else {
        setToc([]);
    }
  }, [guideContent]);

  const handleGenerate = useCallback(async (selectedTopic: string) => {
    if (!selectedTopic.trim()) return;

    setIsLoading(true);
    setAreVideosLoading(true);
    setError(null);
    setGuideContent(''); // Immediately switch to the guide view and initialize for streaming
    setVideos([]);
    setCurrentTopic(selectedTopic);
    setActiveTab('guide');
    
    try {
        const videosPromise = findRelevantVideos(selectedTopic).catch(err => {
            console.error('Video fetching failed, continuing without them.', err);
            return []; // Return an empty array on failure.
        });

        await generateStudyGuide(selectedTopic, (chunk) => {
            setGuideContent(prev => (prev ?? '') + chunk);
        });
        
        const videoResults = await videosPromise;
        setVideos(videoResults);

    } catch (e) {
        console.error(e);
        setError('An unexpected error occurred. Please try again.');
        setGuideContent(null); // Revert to the search view on a critical error.
    } finally {
        setIsLoading(false);
        setAreVideosLoading(false);
    }
  }, [setGuideContent, setCurrentTopic]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(mainSearchTerm);
  };

  const handleGlossarySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!glossarySearchTerm.trim()) return;

    setIsGlossaryLoading(true);
    setGlossaryError(null);
    setGlossaryDefinition(null);
    setSearchedTerm(glossarySearchTerm);

    try {
      const definition = await getTermDefinition(glossarySearchTerm);
      if (definition.toLowerCase().includes('term not found')) {
        setGlossaryError(`No definition found for "${glossarySearchTerm}". Please check the spelling or try another term.`);
      } else {
        setGlossaryDefinition(definition);
      }
    } catch (err) {
      console.error(err);
      setGlossaryError('An error occurred while fetching the definition.');
    } finally {
      setIsGlossaryLoading(false);
    }
  };

  const isGuideSaved = (topic: string | null) => {
    if (!topic) return false;
    return savedGuides.some(guide => guide.topic.toLowerCase() === topic.toLowerCase());
  }

  const toggleSaveGuide = () => {
    if (!currentTopic || !guideContent) return;

    if (isGuideSaved(currentTopic)) {
      setSavedGuides(prev => prev.filter(guide => guide.topic.toLowerCase() !== currentTopic.toLowerCase()));
    } else {
      setSavedGuides(prev => [...prev, { topic: currentTopic, content: guideContent }]);
    }
  }
  
  const handleToggleSection = (topic: string, sectionTitle: string) => {
    setStudyProgress(prev => {
        const currentProgress = prev[topic] || [];
        const isCompleted = currentProgress.includes(sectionTitle);

        const newProgress = isCompleted
            ? currentProgress.filter(s => s !== sectionTitle)
            : [...currentProgress, sectionTitle];
        
        return { ...prev, [topic]: newProgress };
    });
  };

  const deleteSavedGuide = (topicToDelete: string) => {
    setSavedGuides(prev => prev.filter(guide => guide.topic !== topicToDelete));
  }

  const viewSavedGuide = (guide: SavedStudyGuide) => {
    setCurrentTopic(guide.topic);
    setGuideContent(guide.content);
    setVideos([]); // Don't have saved videos yet
    setActiveTab('guide');
  }

  const parseAndRenderGuide = (content: string) => {
    const renderTextWithPronunciation = (text: string, keyPrefix: string): React.ReactNode[] => {
        const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold markdown, keeping the delimiters
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const term = part.slice(2, -2);
                return <PronounceableTerm key={`${keyPrefix}-${index}`} term={term} audioCache={audioCache} audioContext={audioContext} />;
            }
            return <span key={`${keyPrefix}-${index}`}>{part}</span>;
        });
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    const parseList = (startIndex: number, initialIndent: number): [React.ReactNode, number] => {
        const listItems: React.ReactNode[] = [];
        let currentIndex = startIndex;
        while (currentIndex < lines.length) {
            const line = lines[currentIndex];
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('- ')) { break; }
            const currentIndent = line.search(/\S/);
            if (currentIndent < initialIndent) { break; }
            if (currentIndent > initialIndent) {
                const [nestedList, nextIndex] = parseList(currentIndex, currentIndent);
                listItems.push(nestedList);
                currentIndex = nextIndex;
                continue;
            }
            listItems.push(
                <li key={currentIndex} className="flex items-start">
                    <BulletIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{renderTextWithPronunciation(trimmedLine.substring(2), `li-${currentIndex}`)}</span>
                </li>
            );
            currentIndex++;
        }
        return [<ul key={`ul-${startIndex}`} className="space-y-2 my-2 pl-6">{listItems}</ul>, currentIndex];
    };
    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('```')) {
        const codeBlockLines = []; i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) { codeBlockLines.push(lines[i]); i++; }
        elements.push(<pre key={i} className="bg-slate-800 text-white p-4 my-4 rounded-md overflow-x-auto font-mono text-sm"><code>{codeBlockLines.join('\n')}</code></pre>);
        i++; continue;
      }
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        const tableRows = [];
        const headerCells = trimmedLine.split('|').slice(1, -1).map(s => s.trim());
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('|--')) {
            i++; i++;
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                const bodyCells = lines[i].trim().split('|').slice(1, -1).map(s => s.trim());
                tableRows.push(bodyCells); i++;
            }
            elements.push(
                <div key={i} className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase tracking-wider">
                            <tr>
                                {headerCells.map((cell, index) => (
                                    <th key={index} scope="col" className="p-3 font-semibold text-slate-600 dark:text-slate-300">
                                        {renderTextWithPronunciation(cell, `th-${index}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 even:bg-slate-50 dark:even:bg-slate-900/50">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="p-3 text-slate-700 dark:text-slate-300">
                                            {renderTextWithPronunciation(cell, `td-${rowIndex}-${cellIndex}`)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ); continue;
        }
      }
      if (trimmedLine.startsWith('###')) { elements.push(<h4 key={i} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">{renderTextWithPronunciation(trimmedLine.substring(4), `h4-${i}`)}</h4>); i++; continue; }
      if (trimmedLine.startsWith('##')) {
        const sectionTitle = trimmedLine.substring(3).trim();
        const sectionId = slugify(sectionTitle);
        const isChecked = currentTopic && studyProgress[currentTopic] && studyProgress[currentTopic].includes(sectionTitle);
        elements.push(
            <div key={i} id={sectionId} className="flex items-center gap-3 mt-8 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700 scroll-mt-6">
                <input 
                    type="checkbox"
                    id={`checkbox-${i}`}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer flex-shrink-0 dark:bg-slate-600 dark:border-slate-500"
                    checked={!!isChecked}
                    onChange={() => handleToggleSection(currentTopic!, sectionTitle)}
                />
                <label htmlFor={`checkbox-${i}`} className="cursor-pointer">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{renderTextWithPronunciation(sectionTitle, `h3-${i}`)}</h3>
                </label>
            </div>
        );
        i++; 
        continue;
      }
      if (trimmedLine.startsWith('- ')) {
        const initialIndent = line.search(/\S/);
        const [listElement, nextIndex] = parseList(i, initialIndent);
        elements.push(listElement); i = nextIndex; continue;
      }
      if (trimmedLine) { elements.push(<p key={i} className="my-3 text-slate-700 dark:text-slate-300 leading-relaxed text-base">{renderTextWithPronunciation(line, `p-${i}`)}</p>); }
      i++;
    }
    return elements;
  };

  const filteredGuides = mainSearchTerm.trim().toLowerCase()
    ? savedGuides.filter(guide =>
        guide.topic.toLowerCase().includes(mainSearchTerm.trim().toLowerCase())
      )
    : savedGuides;

  if (guideContent !== null) {
    const totalSections = toc.length;
    const completedCount = studyProgress[currentTopic!]?.length || 0;
    const progressPercentage = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;
    
    return (
      <div className="w-full animate-fade-in h-[600px] flex flex-col">
        {selectedVideoId && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
                onClick={() => setSelectedVideoId(null)}
            >
                <div className="bg-white p-2 rounded-lg shadow-2xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                    <div className="aspect-video">
                       <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate pr-4">{currentTopic}</h2>
            <div className="flex items-center gap-4 flex-shrink-0">
              <button onClick={toggleSaveGuide} className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors" title={isGuideSaved(currentTopic) ? "Unsave Guide" : "Save Guide"}>
                {isGuideSaved(currentTopic) ? <BookmarkFilledIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : <BookmarkIcon className="w-6 h-6" />}
              </button>
            </div>
        </div>
        
        <div className="flex-grow flex gap-4 overflow-hidden">
             <aside className={`bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-xl border dark:border-slate-700 flex-col transition-all duration-300 ${isTocVisible ? 'w-64 flex' : 'w-0 hidden'}`}>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 p-1 flex-shrink-0">Table of Contents</h4>
                <div className="overflow-y-auto pr-1 flex-grow">
                    {toc.length > 0 ? (
                        <ul className="space-y-1">
                            {toc.map(({ title, id }) => {
                                const isCompleted = currentTopic && studyProgress[currentTopic]?.includes(title);
                                return (
                                    <li key={id}>
                                        <a
                                            href={`#${id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }}
                                            className={`flex items-start gap-2.5 p-2 rounded-md text-sm transition-colors w-full text-left ${
                                                isCompleted 
                                                ? 'font-medium text-green-800 dark:text-green-300 bg-green-100/80 dark:bg-green-900/60 hover:bg-green-200/80 dark:hover:bg-green-900/90' 
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                                            }`}
                                        >
                                            {isCompleted 
                                                ? <CheckIcon className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" /> 
                                                : <div className="w-1.5 h-1.5 mt-1.5 bg-slate-400 dark:bg-slate-500 rounded-full flex-shrink-0"></div>
                                            }
                                            <span className="flex-grow">{title}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                       <p className="text-xs text-slate-500 dark:text-slate-400 p-1">No sections found in this guide.</p>
                    )}
                </div>
            </aside>
            <main className="flex-grow flex flex-col overflow-hidden">
                <div className="flex items-center border-b border-slate-200 dark:border-slate-700 mb-4 flex-shrink-0">
                    <button
                        onClick={() => setIsTocVisible(!isTocVisible)}
                        className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/80 mr-2"
                        title={isTocVisible ? "Hide Table of Contents" : "Show Table of Contents"}
                    >
                        <MenuAltIcon className="w-5 h-5" />
                    </button>
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('guide')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'guide' ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                            }`}
                        >
                            Study Guide
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'videos' ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                            }`}
                        >
                            Video Explanations
                        </button>
                    </nav>
                </div>

                <div className="flex-grow overflow-y-auto pr-4">
                    <div key={activeTab} className="animate-fade-in">
                      {activeTab === 'guide' ? (
                          <>
                           {guideContent === '' && isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                    <LoadingSpinner />
                                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Consulting the AI for your study guide on "{currentTopic}"...</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Content will appear here as it's generated.</p>
                                </div>
                            ) : (
                                <>
                                {totalSections > 0 && (
                                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {completedCount} / {totalSections} Sections Completed
                                        </span>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    </div>
                                )}
                                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
                                    {error ? <p className="text-red-500">{error}</p> : <article className="prose max-w-none prose-slate dark:prose-invert">{parseAndRenderGuide(guideContent)}</article>}
                                </div>
                                </>
                            )}
                          </>
                      ) : (
                          <div className="space-y-4">
                               {areVideosLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <LoadingSpinner />
                                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Finding relevant videos...</p>
                                    </div>
                                ) : videos.length > 0 ? (
                                  videos.map(video => (
                                      <button key={video.videoId} onClick={() => setSelectedVideoId(video.videoId)} className="w-full text-left flex items-start gap-4 p-4 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg border dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                                          <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt={video.title} className="w-32 rounded-md object-cover flex-shrink-0" />
                                          <div className="flex-grow">
                                              <h4 className="font-bold text-blue-800 dark:text-blue-300 leading-tight">{video.title}</h4>
                                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{video.description}</p>
                                          </div>
                                      </button>
                                  ))
                              ) : (
                                  <div className="text-center p-8">
                                      <VideoCameraIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                                      <p className="text-slate-500 dark:text-slate-400">No relevant videos were found for this topic.</p>
                                  </div>
                              )}
                          </div>
                      )}
                    </div>
                </div>
            </main>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 text-center md:text-left">Study Mode</h2>
      <form onSubmit={handleFormSubmit} className="relative mb-8">
        <input
          type="text"
          value={mainSearchTerm}
          onChange={(e) => setMainSearchTerm(e.target.value)}
          placeholder="Generate guide & videos or search saved guides..."
          className="w-full p-4 pr-12 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-lg bg-white dark:bg-slate-900"
          disabled={isLoading}
        />
        <button type="submit" className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors" disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : <SearchIcon className="w-6 h-6" />}
        </button>
      </form>
       <div>
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Popular Topics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {popularTopics.map(pTopic => (
                    <button 
                        key={pTopic.name} 
                        onClick={() => handleGenerate(pTopic.name)}
                        className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all text-center group"
                    >
                        <div className="text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300 transition-colors">{pTopic.icon}</div>
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors">{pTopic.name}</span>
                    </button>
                ))}
            </div>
        </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Saved Guides</h3>
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-64 overflow-y-auto">
                {savedGuides.length > 0 ? (
                    filteredGuides.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredGuides.map(guide => {
                               const totalSections = guide.content.split('\n').filter(line => line.trim().startsWith('## ')).length;
                               const completedSections = studyProgress[guide.topic] || [];
                               const completedCount = completedSections.length;
                               const progressPercentage = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

                               return (
                                <li key={guide.topic} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex-grow">
                                        <button onClick={() => viewSavedGuide(guide)} className="font-semibold text-blue-700 dark:text-blue-400 hover:underline text-left transition-colors text-base">
                                            {guide.topic}
                                        </button>
                                        {totalSections > 0 && (
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full"
                                                        style={{ width: `${progressPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-12 text-right">{progressPercentage}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => deleteSavedGuide(guide.topic)} className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors ml-4 flex-shrink-0" title="Delete guide">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </li>
                               );
                            })}
                        </ul>
                    ) : (
                         <div className="text-center p-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No saved guides match your search.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center p-4 h-full flex flex-col justify-center items-center">
                        <EmptySavedGuidesIllustration className="w-24 mx-auto text-slate-200 dark:text-slate-700" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Your saved guides will appear here.</p>
                    </div>
                )}
            </div>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Glossary</h3>
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-64">
              <form onSubmit={handleGlossarySearch} className="relative mb-3">
                <input
                  type="text"
                  value={glossarySearchTerm}
                  onChange={(e) => setGlossarySearchTerm(e.target.value)}
                  placeholder="Search for a term..."
                  className="w-full p-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-900"
                  disabled={isGlossaryLoading}
                />
                <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors" disabled={isGlossaryLoading}>
                  <SearchIcon className="w-5 h-5" />
                </button>
              </form>
              <div className="overflow-y-auto h-[calc(100%-50px)] pr-2">
                {isGlossaryLoading && ( <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> )}
                {glossaryError && !isGlossaryLoading && ( <p className="text-center text-sm text-red-600 dark:text-red-500 p-2">{glossaryError}</p> )}
                {glossaryDefinition && !isGlossaryLoading && (
                  <div className="p-1 text-sm animate-fade-in">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{searchedTerm}</h4>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">{glossaryDefinition}</p>
                  </div>
                )}
                {!glossaryDefinition && !isGlossaryLoading && !glossaryError && (
                  <div className="text-center p-4 h-full flex flex-col justify-center items-center">
                    <GlossaryIllustration className="w-24 mx-auto mb-2 text-slate-200 dark:text-slate-700" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Look up medical terms instantly.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ReminderManager />
        </div>
      </div>
    </div>
  );
};

export default StudyScreen;