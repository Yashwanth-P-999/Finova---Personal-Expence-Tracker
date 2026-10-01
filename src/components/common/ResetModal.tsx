import React, { useState } from 'react';
import { RotateCcw, X, Check, Trash2, Sparkles, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { success, error } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'empty' | 'demo'>('empty');

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await api.resetLedger(selectedMode);
      success(
        selectedMode === 'empty'
          ? 'Ledger cleared! Started fresh from the beginning (₹0 balance).'
          : 'Demo sample data restored successfully.'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to reset ledger');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
              Reset Data & Ledger
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Choose how you would like to reset your Finova ledger:
          </p>

          <div className="space-y-3">
            {/* Mode Option 1: Clean Slate / Start from Beginning */}
            <div
              onClick={() => setSelectedMode('empty')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedMode === 'empty'
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-600/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Start from Beginning (Clear All Data - ₹0)
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                      Recommended
                    </span>
                  </div>
                </div>
                {selectedMode === 'empty' && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pl-9 leading-relaxed">
                Wipes all recorded transactions and custom budgets, and sets account balance to <strong>₹0</strong> so you start completely fresh.
              </p>
            </div>

            {/* Mode Option 2: Restore Sample Demo Data */}
            <div
              onClick={() => setSelectedMode('demo')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedMode === 'demo'
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-600/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Restore Sample Demo Data
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Pre-populated Demo Accounts
                    </span>
                  </div>
                </div>
                {selectedMode === 'demo' && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pl-9 leading-relaxed">
                Populates sample bank accounts (HDFC, SBI, Card), monthly salary (₹45,000), Swiggy, Uber, and groceries for previewing analytics.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors ${
                selectedMode === 'empty'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {isResetting
                  ? 'Resetting...'
                  : selectedMode === 'empty'
                  ? 'Confirm & Start from Beginning'
                  : 'Confirm & Restore Sample Data'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
