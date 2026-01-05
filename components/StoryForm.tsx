
import React, { useState } from 'react';
import { THEMES, SETTINGS } from '../constants';

interface StoryFormProps {
  onGenerate: (theme: string, character: string, setting: string) => void;
  isLoading: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ onGenerate, isLoading }) => {
  const [theme, setTheme] = useState(THEMES[0]);
  const [character, setCharacter] = useState('');
  const [setting, setSetting] = useState(SETTINGS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!character.trim()) return;
    onGenerate(theme, character, setting);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6 max-w-xl mx-auto">
      <h2 className="text-3xl font-serif text-center text-indigo-200">Create a New Dream</h2>
      
      <div>
        <label className="block text-sm font-medium text-indigo-300 mb-2">Who is the hero?</label>
        <input
          type="text"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          placeholder="e.g. Luna the Little Dragon"
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-indigo-300 mb-2">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
          >
            {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-indigo-300 mb-2">Setting</label>
          <select
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
          >
            {SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
      >
        {isLoading ? 'Sprinkling Magic Dust...' : 'Tell Me a Story'}
      </button>
    </form>
  );
};

export default StoryForm;
