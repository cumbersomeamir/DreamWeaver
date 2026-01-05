
import React, { useState, useEffect } from 'react';
import StoryForm from './components/StoryForm';
import StoryView from './components/StoryView';
import { generateStoryContent, generateStoryImage, generateStoryAudio } from './services/geminiService';
import { Story, AppStatus } from './types';

const BackgroundStars = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 5}s`,
      size: `${1 + Math.random() * 2}px`
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--duration': star.duration
          } as any}
        />
      ))}
      <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-indigo-300/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-purple-400/10 blur-3xl" />
    </div>
  );
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStory = async (theme: string, character: string, setting: string) => {
    try {
      setError(null);
      setStatus(AppStatus.GENERATING_STORY);
      
      // 1. Generate Story Text
      const storyData = await generateStoryContent(theme, character, setting);
      
      // 2. Generate Image
      setStatus(AppStatus.GENERATING_IMAGE);
      const imageUrl = await generateStoryImage(storyData.title, storyData.content);
      
      // 3. Generate Audio
      setStatus(AppStatus.GENERATING_AUDIO);
      const audioData = await generateStoryAudio(storyData.content);

      setStory({
        ...storyData,
        imageUrl,
        audioData
      });
      setStatus(AppStatus.READY);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong in the magic kingdom.");
      setStatus(AppStatus.ERROR);
    }
  };

  const getLoadingMessage = () => {
    switch (status) {
      case AppStatus.GENERATING_STORY: return "Weaving a new tale...";
      case AppStatus.GENERATING_IMAGE: return "Painting the dream...";
      case AppStatus.GENERATING_AUDIO: return "Calming the night whispers...";
      default: return "Loading magic...";
    }
  };

  return (
    <div className="relative min-h-screen z-10 p-4 md:p-8">
      <BackgroundStars />
      
      <header className="text-center mb-12 animate-in fade-in duration-1000">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-2">
          DreamWeaver
        </h1>
        <p className="text-indigo-300 text-lg md:text-xl font-medium">
          Unique bedtime stories for peaceful dreams.
        </p>
      </header>

      <main className="container mx-auto pb-20">
        {status === AppStatus.IDLE && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <StoryForm onGenerate={handleGenerateStory} isLoading={false} />
          </div>
        )}

        {(status === AppStatus.GENERATING_STORY || 
          status === AppStatus.GENERATING_IMAGE || 
          status === AppStatus.GENERATING_AUDIO) && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-indigo-400 rounded-full animate-spin" />
            </div>
            <p className="text-2xl text-indigo-100 font-serif italic animate-pulse">
              {getLoadingMessage()}
            </p>
          </div>
        )}

        {status === AppStatus.READY && story && (
          <StoryView story={story} onReset={() => setStatus(AppStatus.IDLE)} />
        )}

        {status === AppStatus.ERROR && (
          <div className="glass-card p-8 rounded-3xl max-w-md mx-auto text-center space-y-4">
            <div className="text-red-400 text-5xl">🌙</div>
            <h2 className="text-2xl font-bold text-white">Magic Interrupted</h2>
            <p className="text-indigo-200">{error}</p>
            <button
              onClick={() => setStatus(AppStatus.IDLE)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="text-center text-indigo-400/50 text-sm py-8">
        Crafted with starlight and AI &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
