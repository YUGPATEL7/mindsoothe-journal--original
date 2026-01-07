import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodProvider, useMood, Mood } from '@/contexts/MoodContext';
import { useAuth } from '@/contexts/AuthContext';
import { useJournal } from '@/hooks/useJournal';
import { AnimatedBlobs } from '@/components/AnimatedBlobs';
import { Navbar } from '@/components/Navbar';
import { JournalEntry } from '@/components/JournalEntry';
import { AIResponse } from '@/components/AIResponse';
import { HistoryList } from '@/components/HistoryList';
import { WeeklyInsights } from '@/components/WeeklyInsights';
import { BreathingExercise } from '@/components/BreathingExercise';
import { ZenButton } from '@/components/ZenButton';
import { InteractiveHero } from '@/components/InteractiveHero';
import { BentoFeatures } from '@/components/BentoFeatures';
import { ZenGarden } from '@/components/ZenGarden';
import { EmotionalPulse } from '@/components/EmotionalPulse';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { cn } from '@/lib/utils';
import type { JournalEntry as DBJournalEntry, AIAnalysisResponse } from '@/types/database';

interface AIResponseData {
  mood: Mood;
  reflection: string;
  suggestions: string[];
  colorHint?: string;
}

const JournalContent = () => {
  const { currentMood, setCurrentMood, kindFriendMode } = useMood();
  const { user } = useAuth();
  const { entries: dbEntries, analyzeEntry, createEntry, isLoadingEntries } = useJournal();
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'journal' | 'history' | 'insights'>('journal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AIAnalysisResponse | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);

  // Convert database entries to display format
  const entries = dbEntries?.map(entry => {
    // Ensure mood is valid (fallback to 'neutral' if invalid)
    const validMoods: Mood[] = ['neutral', 'calm', 'anxious', 'happy', 'sad', 'stressed'];
    const mood = validMoods.includes(entry.mood as Mood) ? (entry.mood as Mood) : 'neutral';
    
    return {
      id: entry.id,
      content: entry.content,
      mood,
      reflection: entry.reflection || '',
      suggestions: entry.suggestions || [],
      colorHint: entry.color_hint || '', // Include color hint from database
      createdAt: new Date(entry.created_at),
      unlockAt: entry.unlock_at ? new Date(entry.unlock_at) : null,
    };
  }) || [];

  const handleSubmit = async (content: string, lockDate: Date | null) => {
    if (!user) {
      console.error('❌ User not authenticated - redirecting to sign in');
      // Redirect to auth page if not authenticated
      window.location.href = '/auth';
      return;
    }

    setIsProcessing(true);
    setShowBreathing(true);

    try {
      // Step 1: Analyze entry with AI
      console.log('Analyzing entry with AI...');
      const analysis = await analyzeEntry.mutateAsync({
        content,
        isKindFriendMode: kindFriendMode,
      });

      console.log('AI Analysis received:', analysis);

      // Step 2: Save entry to database BEFORE updating UI
      console.log('Saving entry to database...');
      await createEntry.mutateAsync({
        content,
        analysis,
        isReframed: kindFriendMode,
        unlockAt: lockDate,
      });

      console.log('✅ Entry saved to database successfully!');

      // Step 3: Only update UI AFTER successful database save
      // This ensures UI state matches database state
      setCurrentMood(analysis.mood);
      setCurrentResponse(analysis);
    } catch (error) {
      console.error('❌ Error processing entry:', error);
      // Don't update UI state if save failed - user will see error via toast
      // The error is already handled by the mutation's onError callback
    } finally {
      setIsProcessing(false);
      setShowBreathing(false);
    }
  };

  const handleNewEntry = () => { 
    setCurrentResponse(null); 
    setCurrentMood('neutral'); 
  };

  const handleSelectEntry = (entry: typeof entries[0]) => { 
    setCurrentMood(entry.mood); 
    setCurrentResponse({ 
      mood: entry.mood, 
      reflection: entry.reflection, 
      suggestions: entry.suggestions,
      colorHint: entry.colorHint || '' // Use actual color hint from saved entry
    }); 
    setActiveTab('journal'); 
  };

  const handleStartJournal = () => { setShowLanding(false); };

  const getUserName = () => {
    if (!user) return '';
    return user.full_name || user.email?.split('@')[0] || 'Friend';
  };

  const moodStats: Record<Mood, number> = { neutral: 0, calm: 0, anxious: 0, happy: 0, sad: 0, stressed: 0 };
  entries.forEach((entry) => { moodStats[entry.mood]++; });

  const mockWeeklyLetter = entries.length >= 3 ? `Dear Present Self,\n\nThis week, you've shown remarkable courage in facing your emotions head-on. You've journaled ${entries.length} times, and through your words, I can see your resilience shining through.\n\nRemember: you are not your feelings. You are the awareness that observes them.\n\nWith love,\nYour Future Self ✨` : null;

  if (showLanding) {
    return (
      <div className="min-h-screen">
        <AnimatedBlobs />
        <InteractiveHero onStartJournal={handleStartJournal} />
        <BentoFeatures />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-700", currentMood !== 'neutral' && `mood-${currentMood}`)}>
      <AnimatedBlobs />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="relative z-10 pt-28 pb-24 px-4">
        {/* Welcome Message for logged-in users */}
        {user && (
          <div className="max-w-2xl mx-auto mb-6">
            <WelcomeMessage name={getUserName()} />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {activeTab === 'journal' && (
            <motion.div key="journal" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">How are you feeling?</h1>
                <p className="text-lg text-muted-foreground">Take a moment to check in with yourself</p>
              </motion.div>
              {currentResponse ? (
                <AIResponse 
                  response={{
                    mood: (['neutral', 'calm', 'anxious', 'happy', 'sad', 'stressed'].includes(currentResponse.mood) 
                      ? currentResponse.mood 
                      : 'neutral') as Mood,
                    reflection: currentResponse.reflection,
                    suggestions: currentResponse.suggestions
                  }} 
                  onNewEntry={handleNewEntry} 
                />
              ) : (
                <JournalEntry onSubmit={handleSubmit} isProcessing={isProcessing} />
              )}
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">Your Journey</h1>
                <p className="text-lg text-muted-foreground">Revisit your past reflections and growth</p>
              </motion.div>
              <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><HistoryList entries={entries} onSelectEntry={handleSelectEntry} /></div>
                <div><ZenGarden entries={entries.map(e => ({ mood: e.mood, createdAt: e.createdAt }))} /></div>
              </div>
            </motion.div>
          )}
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">Your Emotional Pulse</h1>
                <p className="text-lg text-muted-foreground">Patterns, progress, and personalized insights</p>
              </motion.div>
              <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6">
                <EmotionalPulse entries={entries.map(e => ({ mood: e.mood, createdAt: e.createdAt }))} />
                <WeeklyInsights weeklyLetter={mockWeeklyLetter} moodStats={moodStats} totalEntries={entries.length} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <ZenButton onClick={() => setShowBreathing(true)} />
      <BreathingExercise isOpen={showBreathing} onClose={() => setShowBreathing(false)} isLoading={isProcessing} />
    </div>
  );
};

const Index = () => (<MoodProvider><JournalContent /></MoodProvider>);
export default Index;
