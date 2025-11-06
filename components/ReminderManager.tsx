import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import BellIcon from './icons/BellIcon';
import TrashIcon from './icons/TrashIcon';

// Helper to get the last triggered date for a reminder from localStorage
const getLastTriggeredDate = (reminderId: string): string | null => {
  try {
    const triggers = JSON.parse(localStorage.getItem('reminderTriggers') || '{}');
    return triggers[reminderId] || null;
  } catch {
    return null;
  }
};

// Helper to set the last triggered date for a reminder in localStorage
const setLastTriggeredDate = (reminderId: string, date: string) => {
  try {
    const triggers = JSON.parse(localStorage.getItem('reminderTriggers') || '{}');
    triggers[reminderId] = date;
    localStorage.setItem('reminderTriggers', JSON.stringify(triggers));
  } catch (e) {
    console.error("Failed to update reminder triggers in localStorage", e);
  }
};

const ReminderManager: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem('studyReminders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse reminders from localStorage", e);
      return [];
    }
  });

  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly'>('daily');

  useEffect(() => {
    localStorage.setItem('studyReminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM

      reminders.forEach(reminder => {
        if (reminder.time === currentTime) {
          const lastTriggered = getLastTriggeredDate(reminder.id);

          if (reminder.frequency === 'once' && !lastTriggered) {
            alert(`Reminder: Time to study ${reminder.topic}!`);
            setLastTriggeredDate(reminder.id, today);
            // Remove the 'once' reminder after it fires
            setReminders(prev => prev.filter(r => r.id !== reminder.id));
          }
          
          if (reminder.frequency === 'daily' && lastTriggered !== today) {
            alert(`Reminder: Time to study ${reminder.topic}!`);
            setLastTriggeredDate(reminder.id, today);
          }

          if (reminder.frequency === 'weekly') {
            if (!lastTriggered || new Date(today).getTime() - new Date(lastTriggered).getTime() >= 7 * 24 * 60 * 60 * 1000) {
              alert(`Reminder: Time to study ${reminder.topic}!`);
              setLastTriggeredDate(reminder.id, today);
            }
          }
        }
      });
    };

    // Check every 30 seconds to be less resource-intensive than every second
    const intervalId = setInterval(checkReminders, 30 * 1000);
    
    return () => clearInterval(intervalId);
  }, [reminders]);


  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !time) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      topic,
      time,
      frequency,
    };
    setReminders(prev => [...prev, newReminder]);
    setTopic('');
  };

  const handleDeleteReminder = (idToDelete: string) => {
    setReminders(prev => prev.filter(r => r.id !== idToDelete));
  };
  
  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <BellIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        Study Reminders
      </h3>
      <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-64 flex flex-col">
        <form onSubmit={handleAddReminder} className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g., Cardiology)"
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900"
            required
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="once">Once</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Add Reminder
          </button>
        </form>
        <div className="overflow-y-auto flex-grow pr-2">
          {reminders.length > 0 ? (
            <ul className="space-y-2">
              {reminders.map(reminder => (
                <li key={reminder.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{reminder.topic}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2 capitalize">({reminder.frequency} at {reminder.time})</span>
                  </p>
                  <button onClick={() => handleDeleteReminder(reminder.id)} className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors" title="Delete reminder">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 h-full flex items-center justify-center">
              <p>Set a reminder to stay on track with your studies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderManager;