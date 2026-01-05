
import React, { useEffect, useRef, useState } from 'react';
import { Story } from '../types';
import { decode, decodeAudioData } from '../services/geminiService';

interface StoryViewProps {
  story: Story;
  onReset: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({ story, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) sourceNodeRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        setIsPlaying(false);
      }
      return;
    }

    if (!story.audioData) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const decodedBytes = decode(story.audioData);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to play audio", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <button 
        onClick={onReset}
        className="mb-6 text-indigo-300 hover:text-white flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        New Story
      </button>

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
        {story.imageUrl && (
          <div className="w-full aspect-video overflow-hidden">
            <img 
              src={story.imageUrl} 
              alt={story.title} 
              className="w-full h-full object-cover animate-in zoom-in duration-1000" 
            />
          </div>
        )}

        <div className="p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-serif text-indigo-100 leading-tight">
              {story.title}
            </h1>
            
            {story.audioData && (
              <button
                onClick={handlePlayAudio}
                className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all ${
                  isPlaying ? 'bg-indigo-100 text-indigo-900' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isPlaying ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause Story
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Listen to Story
                  </>
                )}
              </button>
            )}
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            {story.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="text-indigo-200/90 leading-relaxed font-serif text-xl mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryView;
