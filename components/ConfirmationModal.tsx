import React, { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
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
  
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 animate-fade-in"
      aria-labelledby="modal-title"
      role="alertdialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md m-4 text-center border border-slate-200/80 dark:border-slate-700/80 transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 id="modal-title" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {message}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto bg-slate-200/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300/80 dark:hover:bg-slate-600/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;