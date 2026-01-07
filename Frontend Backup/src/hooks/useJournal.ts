import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalService } from '@/services/journalService';
import type { JournalEntry, AIAnalysisResponse } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export const useJournal = () => {
  const queryClient = useQueryClient();

  const { data: entries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => journalService.getEntries(0, 50),
  });

  const { data: unlockedEntries } = useQuery({
    queryKey: ['unlocked-entries'],
    queryFn: () => journalService.getUnlockedEntries(),
  });

  const analyzeEntry = useMutation({
    mutationFn: ({ content, isKindFriendMode }: { content: string; isKindFriendMode: boolean }) =>
      journalService.analyzeEntry(content, isKindFriendMode),
    onError: (error: Error) => {
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze your entry. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const createEntry = useMutation({
    mutationFn: ({
      content,
      analysis,
      isReframed,
      unlockAt,
    }: {
      content: string;
      analysis: AIAnalysisResponse;
      isReframed: boolean;
      unlockAt: Date | null;
    }) => journalService.createEntry(content, analysis, isReframed, unlockAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: 'Entry saved',
        description: 'Your journal entry has been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save your entry. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => journalService.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: 'Entry deleted',
        description: 'Your journal entry has been deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete entry. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<JournalEntry> }) =>
      journalService.updateEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: 'Entry updated',
        description: 'Your journal entry has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update entry. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    entries: entries || [],
    unlockedEntries: unlockedEntries || [],
    isLoadingEntries,
    analyzeEntry,
    createEntry,
    deleteEntry,
    updateEntry,
  };
};

export const useWeeklySummary = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['weekly-summary'],
    queryFn: () => journalService.getWeeklySummary(),
  });

  return { summary, isLoading };
};

export const useWeeklyLetter = () => {
  const queryClient = useQueryClient();

  const { data: letters } = useQuery({
    queryKey: ['weekly-letters'],
    queryFn: () => journalService.getWeeklyLetters(),
  });

  const generateLetter = useMutation({
    mutationFn: ({ weekStart, weekEnd }: { weekStart: Date; weekEnd: Date }) =>
      journalService.generateWeeklyLetter(weekStart, weekEnd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-letters'] });
      toast({
        title: 'Letter generated',
        description: 'Your weekly letter from your future self is ready.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate letter. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    letters: letters || [],
    generateLetter,
  };
};

export const useMoodStats = (startDate: Date, endDate: Date) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['mood-stats', startDate.toISOString(), endDate.toISOString()],
    queryFn: () => journalService.getMoodStats(startDate, endDate),
  });

  return { stats, isLoading };
};
