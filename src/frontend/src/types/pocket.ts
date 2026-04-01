// ===== POCKET: TYPE DEFINITIONS =====

export type ID = string;

export function genId(): ID {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

// Tasks
export type EisenhowerQuadrant =
  | "urgent-important"
  | "urgent-not-important"
  | "not-urgent-important"
  | "not-urgent-not-important"
  | "unsorted";

export interface Task {
  id: ID;
  title: string;
  description: string;
  quadrant: EisenhowerQuadrant;
  completed: boolean;
  createdAt: string;
}

// Habits
export interface Habit {
  id: ID;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface HabitLog {
  id: ID;
  habitId: ID;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

// Mood
export interface MoodEntry {
  id: ID;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  note: string;
}

// Sleep
export interface SleepEntry {
  id: ID;
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

// Books
export interface Book {
  id: ID;
  title: string;
  author: string;
  genre: string;
  status: "tbr" | "reading" | "finished";
  rating: number;
  notes: string;
  addedAt: string;
}

// Shows/Movies
export interface Show {
  id: ID;
  title: string;
  type: "movie" | "tv" | "documentary" | "anime" | "other";
  status: "want" | "watching" | "watched";
  rating: number;
  notes: string;
  addedAt: string;
}

// Gratitude
export interface GratitudeEntry {
  id: ID;
  date: string;
  items: string[];
}

// Poem
export interface Poem {
  id: ID;
  title: string;
  content: string;
  date: string;
}

// Success/Failure/Fear
export interface Win {
  id: ID;
  title: string;
  description: string;
  date: string;
}

export interface Failure {
  id: ID;
  title: string;
  description: string;
  reflection: string;
  date: string;
}

export interface Fear {
  id: ID;
  fear: string;
  notes: string;
  facing: boolean;
  addedAt: string;
}

// Rejection Therapy
export interface RejectionEntry {
  id: ID;
  date: string;
  context: string;
  outcome: string;
  reflection: string;
}

// Frankenstein
export interface FrankensteinModel {
  head: string;
  arms: string;
  torso: string;
  legs: string;
}

// Life Values
export interface LifeValue {
  id: ID;
  name: string;
  description: string;
}

// Encyclopedia
export interface EncyclopediaEntry {
  id: ID;
  field: string;
  value: string;
}

// Experience
export interface Experience {
  id: ID;
  title: string;
  description: string;
  date: string;
  category: string;
}

// Goals
export interface Goal {
  id: ID;
  title: string;
  description: string;
  deadline: string;
  status: "active" | "completed" | "paused";
  type: "short" | "long";
  notes: string;
}

// Life Quest
export interface LifeQuest {
  id: ID;
  title: string;
  description: string;
  steps: { id: ID; text: string; done: boolean }[];
}

// Bucket List
export interface BucketItem {
  id: ID;
  title: string;
  category: string;
  targetDate: string;
  completed: boolean;
  notes: string;
}

// Idea Vault
export interface Idea {
  id: ID;
  title: string;
  description: string;
  tags: string[];
  status: "raw" | "developing" | "shelved" | "pursuing";
  createdAt: string;
}

// Opportunities
export interface Opportunity {
  id: ID;
  title: string;
  source: string;
  status: "active" | "applied" | "passed" | "closed";
  notes: string;
  deadline: string;
}

// Scholarship
export interface Scholarship {
  id: ID;
  name: string;
  amount: string;
  deadline: string;
  requirements: string;
  status: "researching" | "applied" | "awarded" | "rejected";
  notes: string;
}

// Cold Email
export interface ColdEmail {
  id: ID;
  contactName: string;
  company: string;
  sentDate: string;
  subject: string;
  status: "sent" | "replied" | "follow-up" | "closed";
  notes: string;
}

// Professional Network
export interface Professional {
  id: ID;
  name: string;
  role: string;
  company: string;
  whereMet: string;
  date: string;
  notes: string;
  followUpDate: string;
}

// Photos
export interface Photo {
  id: ID;
  title: string;
  description: string;
  dateTaken: string;
  dataUrl: string;
}

// Dishes
export interface Dish {
  id: ID;
  name: string;
  description: string;
  cuisineType: string;
  dataUrl: string;
}

// Places
export interface Place {
  id: ID;
  country: string;
  city: string;
  description: string;
  priority: 1 | 2 | 3;
  visited: boolean;
}

// Bookmarks
export interface Bookmark {
  id: ID;
  url: string;
  title: string;
  description: string;
  category: "article" | "blog" | "quote" | "lyrics" | "video" | "other";
  tags: string[];
  addedAt: string;
}

// Flashcards
export interface FlashcardDeck {
  id: ID;
  name: string;
  topic: string;
  createdAt: string;
}

export interface Flashcard {
  id: ID;
  deckId: ID;
  front: string;
  back: string;
  reviewed: boolean;
}

// Citations
export interface Citation {
  id: ID;
  style: "apa" | "mla" | "chicago";
  sourceType: "book" | "website" | "article" | "journal" | "video" | "other";
  title: string;
  author: string;
  year: string;
  publisher: string;
  url: string;
  generated: string;
  createdAt: string;
}

// Profile
export interface Profile {
  displayName: string;
  bio: string;
  // Writer Profile fields:
  writerName?: string;
  writerBackground?: string;
  writerGoals?: string;
  writerExperiences?: string;
  writerStyle?: string;
}

// Essay Draft
export interface EssayDraft {
  id: ID;
  scholarshipName: string;
  promptIndex: number;
  promptText: string;
  draftName: string;
  content: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
