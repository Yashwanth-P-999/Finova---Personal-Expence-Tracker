import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, Bot, User } from 'lucide-react';
import { api } from '../services/api.ts';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const FinAIPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: 'Hello! I am FinAI, your analytical personal finance assistant. Ask me questions about your monthly spending, category breakdown, net savings, or total account balances.',
      timestamp: 'Just now',
    },
  ]);
  const [isQuerying, setIsQuerying] = useState(false);

  const suggestedQuestions = [
    'How much did I spend on food this month?',
    'What is my highest expense category?',
    'How much did I save this month?',
    'What is my consolidated total balance?',
  ];

  const handleSend = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsQuerying(true);

    try {
      const res = await api.queryAI(q);
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'I could not compute that query right now. Please try asking about your food expenses or monthly balance.',
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          FinAI Assistant
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Natural language intelligence over your personal finances and categorized expenses.
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 px-3 py-1.5 rounded-full transition-colors shadow-2xs"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 min-h-[340px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-md rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                U
              </div>
            )}
          </div>
        ))}

        {isQuerying && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-slate-500 italic">
              Analyzing ledger records...
            </div>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="relative"
      >
        <input
          type="text"
          placeholder="Ask about your spending, savings, or accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-4 pr-12 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!query.trim() || isQuerying}
          className="absolute right-2 top-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
