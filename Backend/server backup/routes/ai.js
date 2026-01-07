import express from 'express';
import OpenAI from 'openai';
import JournalEntry from '../models/JournalEntry.js';
import WeeklyLetter from '../models/WeeklyLetter.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Initialize OpenAI client lazily to ensure env vars are loaded
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
  });
};

// Analyze journal entry
router.post('/analyze-entry', async (req, res) => {
  try {
    const { content, isKindFriendMode } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = getOpenAI();
    const systemPrompt = isKindFriendMode
      ? `You are a wise, compassionate friend analyzing someone's journal entry from a third-person perspective. Provide:
- mood: detected emotional state (happy, calm, neutral, sad, anxious, or stressed)
- reflection: A caring reflection as if a kind friend is speaking about them (2-3 sentences). Use "they/them" pronouns and speak with warmth.
- suggestions: 3 actionable self-care suggestions
- colorHint: A calming color that matches the mood (e.g., "soft blue", "warm amber", "gentle lavender")`
      : `You are a compassionate mental wellness companion analyzing a journal entry. Provide:
- mood: detected emotional state (happy, calm, neutral, sad, anxious, or stressed)
- reflection: An empathetic, supportive reflection (2-3 sentences)
- suggestions: 3 actionable self-care suggestions
- colorHint: A calming color that matches the mood (e.g., "soft blue", "warm amber", "gentle lavender")`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o', // OpenRouter model format
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'journal_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              mood: {
                type: 'string',
                enum: ['happy', 'calm', 'neutral', 'sad', 'anxious', 'stressed'],
              },
              reflection: { type: 'string' },
              suggestions: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3,
              },
              colorHint: { type: 'string' },
            },
            required: ['mood', 'reflection', 'suggestions', 'colorHint'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.7,
      max_tokens: 500,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    res.json(analysis);
  } catch (error) {
    console.error('Analyze entry error:', error);
    res.status(500).json({ error: 'Failed to analyze entry' });
  }
});

// Generate weekly letter
router.post('/generate-weekly-letter', async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.body;

    if (!weekStart || !weekEnd) {
      return res.status(400).json({ error: 'weekStart and weekEnd are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = getOpenAI();
    // Fetch user's entries for the week
    const entries = await JournalEntry.find({
      user_id: req.user._id,
      created_at: { $gte: new Date(weekStart), $lte: new Date(weekEnd) },
    })
      .sort({ created_at: 1 })
      .select('content mood reflection created_at')
      .lean();

    if (!entries || entries.length === 0) {
      return res.status(404).json({ error: 'No entries found for this week' });
    }

    // Calculate mood summary
    const moodSummary = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const entriesSummary = entries
      .map((e, i) => `Day ${i + 1}: ${e.mood} - ${e.reflection || 'No reflection'}`)
      .join('\n');

    const systemPrompt = `You are writing a compassionate letter from the user's future self, reflecting on their week of journaling. The letter should:
- Be warm, encouraging, and insightful
- Acknowledge their emotional journey
- Highlight growth and resilience
- Offer gentle wisdom
- Be 3-4 paragraphs
- Sign off as "Your Future Self" with a sparkle emoji`;

    const userPrompt = `This week I journaled ${entries.length} times. Here's my emotional journey:

Mood distribution: ${JSON.stringify(moodSummary)}

${entriesSummary}

Write a letter from my future self reflecting on this week.`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o', // OpenRouter model format
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const letterContent = completion.choices[0].message.content;

    // Save letter to database
    const letter = new WeeklyLetter({
      user_id: req.user._id,
      content: letterContent,
      week_start: new Date(weekStart),
      week_end: new Date(weekEnd),
    });

    await letter.save();

    res.json({
      letter: {
        id: letter._id.toString(),
        user_id: letter.user_id.toString(),
        content: letter.content,
        week_start: letter.week_start.toISOString().split('T')[0],
        week_end: letter.week_end.toISOString().split('T')[0],
        created_at: letter.created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('Generate weekly letter error:', error);
    res.status(500).json({ error: 'Failed to generate weekly letter' });
  }
});

export default router;

