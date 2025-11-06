import React, { useState, useEffect, useRef } from 'react';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder: string;
  confirmText: string;
  onConfirm: (inputValue: string) => void;
  onCancel: () => void;
}

const InputModal: React.FC<InputModalProps> = ({ isOpen, title, message, placeholder, confirmText, onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset input value when modal opens
      setInputValue('');
      // Focus the input field
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 animate-fade-in"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md m-4 text-left border border-slate-200/80 dark:border-slate-700/80 transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {message}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
          <div className="flex flex-col sm:flex-row-reverse justify-start gap-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto bg-slate-200/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300/80 dark:hover:bg-slate-600/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal;