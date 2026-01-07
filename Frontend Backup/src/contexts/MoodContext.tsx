import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Mood = 'neutral' | 'calm' | 'anxious' | 'happy' | 'sad' | 'stressed';

interface MoodContextType {
  currentMood: Mood;
  setCurrentMood: (mood: Mood) => void;
  privacyMode: boolean;
  setPrivacyMode: (enabled: boolean) => void;
  kindFriendMode: boolean;
  setKindFriendMode: (enabled: boolean) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [currentMood, setCurrentMood] = useState<Mood>('neutral');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [kindFriendMode, setKindFriendMode] = useState(false);

  return (
    <MoodContext.Provider
      value={{
        currentMood,
        setCurrentMood,
        privacyMode,
        setPrivacyMode,
        kindFriendMode,
        setKindFriendMode,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
