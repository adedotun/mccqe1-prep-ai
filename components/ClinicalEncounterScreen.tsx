import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { startEncounterChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import InputModal from './InputModal';

const ClinicalEncounterScreen: React.FC = () => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [patientChart, setPatientChart] = useState<Record<string, any>>({});
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);
    const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);

    useEffect(() => {
        isMounted.current = true;
        const initEncounter = async () => {
            try {
                const { chat, initialMessage } = await startEncounterChat();
                if (isMounted.current) {
                    setChatSession(chat);
                    setMessages([{ role: 'model', text: initialMessage }]);
                }
            } catch (error) {
                console.error("Failed to start encounter:", error);
                if (isMounted.current) {
                    setMessages([{ role: 'model', text: 'Error: Could not start the clinical encounter. Please try again later.' }]);
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };
        initEncounter();

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const parseAndSetChartData = (text: string) => {
        const dataRegex = /\[(EXAM_RESULTS|LAB_RESULTS|IMAGING_RESULTS)\]\s*(\{.*\})/s;
        const match = text.match(dataRegex);
        if (match) {
            try {
                const type = match[1];
                const jsonData = JSON.parse(match[2]);
                
                setPatientChart(prev => {
                    const newChart = { ...prev };
                    if (type === 'EXAM_RESULTS') {
                        newChart['Physical Exam'] = { ...(newChart['Physical Exam'] || {}), ...jsonData };
                    } else if (type === 'LAB_RESULTS') {
                        newChart['Lab Results'] = { ...(newChart['Lab Results'] || {}), ...jsonData };
                    } else if (type === 'IMAGING_RESULTS') {
                        newChart['Imaging'] = { ...(newChart['Imaging'] || {}), ...jsonData };
                    }
                    return newChart;
                });
                
                return text.replace(dataRegex, '').trim();
            } catch (e) {
                console.error("Failed to parse chart data:", e);
                return text;
            }
        }
        return text;
    }


    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || !chatSession || isLoading || isFinished) return;

        const text = messageText.trim();
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', text }]);
        setUserInput('');
        
        try {
            const response = await chatSession.sendMessage({ message: text });
            
            if (!isMounted.current) return;

            let modelText = response.text;

            if (modelText.includes('[ENCOUNTER_COMPLETE]')) {
                setIsFinished(true);
                modelText = modelText.replace('[ENCOUNTER_COMPLETE]', '').trim();
            }

            const cleanText = parseAndSetChartData(modelText);
            
            if (cleanText) {
                 setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            if (isMounted.current) {
                setMessages(prev => [...prev, { role: 'model', text: 'An error occurred. Please try again.' }]);
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
    };
    
    const handleOpenDiagnosisModal = () => {
        setIsDiagnosisModalOpen(true);
    };

    const handleConfirmDiagnosis = (diagnosis: string) => {
        handleSendMessage(`My final diagnosis is: ${diagnosis}`);
        setIsDiagnosisModalOpen(false);
    };
    
    const { "Physical Exam": exam, "Lab Results": labs, "Imaging": imaging } = patientChart;
    const vitals = exam?.vitals;
    const examSystems = exam ? Object.fromEntries(Object.entries(exam).filter(([key]) => key !== 'vitals')) : {};

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-6">
            <InputModal
                isOpen={isDiagnosisModalOpen}
                title="Submit Final Diagnosis"
                message="Please enter your final diagnosis for this clinical case. This action will end the encounter."
                placeholder="e.g., Acute Myocardial Infarction"
                confirmText="Submit Diagnosis"
                onConfirm={handleConfirmDiagnosis}
                onCancel={() => setIsDiagnosisModalOpen(false)}
            />
            {/* Patient Chart */}
            <aside className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-[300px] md:h-auto overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <ClipboardIcon className="w-6 h-6" />
                    Patient Chart
                </h3>
                {Object.keys(patientChart).length > 0 ? (
                    <div className="space-y-4">
                        {vitals && (
                            <div>
                                <h4 className="font-bold text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-600 pb-1 mb-2">Vitals</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    {Object.entries(vitals).map(([key, value]) => (
                                        <div key={key}>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{key}: </span>
                                            <span className="text-slate-600 dark:text-slate-400">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {Object.keys(examSystems).length > 0 && (
                            <div>
                                <h4 className="font-bold text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-600 pb-1 mb-2">Physical Exam</h4>
                                {Object.entries(examSystems).map(([system, findings]) => (
                                    <div key={system} className="mt-1 text-sm">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{system}: </span>
                                        <span className="text-slate-600 dark:text-slate-400">{String(findings)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {labs && Object.keys(labs).length > 0 && (
                            <div>
                                <h4 className="font-bold text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-600 pb-1 mb-2">Lab Results</h4>
                                <div className="space-y-3">
                                    {Object.entries(labs).map(([panel, results]) => (
                                        <div key={panel}>
                                            <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{panel}</h5>
                                            <table className="w-full text-xs border-collapse">
                                                <thead>
                                                    <tr className="text-left bg-slate-100 dark:bg-slate-700/50">
                                                        <th className="p-1.5 font-medium">Test</th>
                                                        <th className="p-1.5 font-medium">Value</th>
                                                        <th className="p-1.5 font-medium hidden sm:table-cell">Reference</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(results as any[]).map((res, index) => (
                                                        <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                                                            <td className="p-1.5">{res.test}</td>
                                                            <td className="p-1.5">{res.value} {res.unit}</td>
                                                            <td className="p-1.5 hidden sm:table-cell">{res.reference}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                         {imaging && Object.keys(imaging).length > 0 && (
                            <div>
                                <h4 className="font-bold text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-600 pb-1 mb-2">Imaging</h4>
                                <div className="space-y-3">
                                    {Object.entries(imaging).map(([type, report]: [string, any]) => (
                                        <div key={type} className="text-sm">
                                            <h5 className="font-semibold text-slate-800 dark:text-slate-200">{type}</h5>
                                            {report.findings && <p className="mt-1 text-slate-600 dark:text-slate-400"><span className="font-semibold">Findings:</span> {report.findings}</p>}
                                            {report.impression && <p className="mt-1 text-slate-600 dark:text-slate-400"><span className="font-semibold">Impression:</span> {report.impression}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Patient information will appear here as you conduct your examination.</p>
                )}
            </aside>

            {/* Chat Interface */}
            <main className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages.length > 0 && (
                        <div className="flex justify-start">
                             <div className="max-w-md p-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg">
                                <LoadingSpinner />
                            </div>
                        </div>
                    )}
                </div>

                {isFinished ? (
                    <div className="p-4 m-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg text-center">
                        <h4 className="font-bold text-lg text-green-800 dark:text-green-200">Encounter Complete</h4>
                        <p className="text-green-700 dark:text-green-300">You can review the feedback above. Please go back to the main menu to start a new session.</p>
                    </div>
                ) : (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button onClick={() => handleSendMessage('Perform a physical exam')} className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Physical Exam</button>
                            <button onClick={() => handleSendMessage('Order CBC')} className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Order CBC</button>
                            <button onClick={() => handleSendMessage('Order BMP')} className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Order BMP</button>
                            <button onClick={() => handleSendMessage('Order Chest X-ray')} className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Order Chest X-ray</button>
                             <button onClick={handleOpenDiagnosisModal} className="px-3 py-1.5 text-xs font-bold bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-300 dark:hover:bg-blue-800 transition-colors">Submit Final Diagnosis</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="relative">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={isLoading ? "Waiting for response..." : "Ask the patient a question..."}
                                className="w-full p-3 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={isLoading || isFinished}
                            />
                            <button type="submit" className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 hover:text-blue-600 disabled:text-slate-400 transition-colors" disabled={isLoading || isFinished || !userInput.trim()}>
                                <PaperAirplaneIcon className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ClinicalEncounterScreen;