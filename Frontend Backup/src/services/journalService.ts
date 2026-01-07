import { apiClient } from '@/lib/apiClient';
import type {
  JournalEntry,
  AIAnalysisResponse,
  CreateEntryRequest,
  MoodStats,
  WeeklySummary,
  UserSettings,
  WeeklyLetter,
  Mood,
} from '@/types/database';

export const journalService = {
  async analyzeEntry(content: string, isKindFriendMode: boolean): Promise<AIAnalysisResponse> {
    const response = await apiClient.post<AIAnalysisResponse>('/ai/analyze-entry', {
      content,
      isKindFriendMode,
    });
    return response;
  },

  async createEntry(
    content: string,
    analysis: AIAnalysisResponse,
    isReframed: boolean,
    unlockAt: Date | null = null
  ): Promise<JournalEntry> {
    const entry = await apiClient.post<JournalEntry>('/journal', {
      content,
      mood: analysis.mood,
      reflection: analysis.reflection,
      suggestions: analysis.suggestions,
      color_hint: analysis.colorHint,
      is_reframed: isReframed,
      unlock_at: unlockAt?.toISOString() || null,
    });
    return entry;
  },

  async getEntries(page = 0, pageSize = 10): Promise<JournalEntry[]> {
    const entries = await apiClient.get<JournalEntry[]>(
      `/journal?page=${page}&pageSize=${pageSize}`
    );
    return entries;
  },

  async getEntry(id: string): Promise<JournalEntry> {
    const entry = await apiClient.get<JournalEntry>(`/journal/${id}`);
    return entry;
  },

  async getUnlockedEntries(): Promise<JournalEntry[]> {
    const entries = await apiClient.get<JournalEntry[]>('/journal/unlocked/all');
    return entries;
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const entry = await apiClient.put<JournalEntry>(`/journal/${id}`, updates);
    return entry;
  },

  async deleteEntry(id: string): Promise<void> {
    await apiClient.delete(`/journal/${id}`);
  },

  async getMoodStats(startDate: Date, endDate: Date): Promise<MoodStats> {
    const stats = await apiClient.get<MoodStats>(
      `/journal/stats/mood?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    return stats;
  },

  async getWeeklySummary(): Promise<WeeklySummary> {
    const summary = await apiClient.get<WeeklySummary>('/journal/stats/weekly');
    return summary;
  },

  async generateWeeklyLetter(weekStart: Date, weekEnd: Date): Promise<WeeklyLetter> {
    const response = await apiClient.post<{ letter: WeeklyLetter }>('/ai/generate-weekly-letter', {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    });
    return response.letter;
  },

  async getWeeklyLetters(): Promise<WeeklyLetter[]> {
    const letters = await apiClient.get<WeeklyLetter[]>('/weekly-letters');
    return letters;
  },
};

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const settings = await apiClient.get<UserSettings>('/settings');
    return settings;
  },

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const settings = await apiClient.put<UserSettings>('/settings', updates);
    return settings;
  },
};
