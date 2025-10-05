import { Gesture } from '@/types/gesture';

export const ISL_GESTURES: Omit<Gesture, 'id' | 'createdAt'>[] = [
  { name: 'Hello', description: 'Greeting gesture', category: 'phrase' },
  { name: 'Thank You', description: 'Expression of gratitude', category: 'phrase' },
  { name: 'Sorry', description: 'Apology gesture', category: 'phrase' },
  { name: 'Help', description: 'Request for assistance', category: 'word' },
  { name: 'Yes', description: 'Affirmative response', category: 'word' },
  { name: 'No', description: 'Negative response', category: 'word' },
  { name: 'Please', description: 'Polite request', category: 'word' },
  { name: 'Good', description: 'Positive expression', category: 'word' },
  { name: 'Bad', description: 'Negative expression', category: 'word' },
  { name: 'Water', description: 'Request for water', category: 'word' },
  { name: 'Food', description: 'Request for food', category: 'word' },
  { name: 'Medicine', description: 'Request for medicine', category: 'word' },
  { name: 'Family', description: 'Reference to family', category: 'word' },
  { name: 'Friend', description: 'Reference to friend', category: 'word' },
  { name: 'Love', description: 'Expression of affection', category: 'word' },
  { name: 'Happy', description: 'Emotion - happiness', category: 'word' },
  { name: 'Sad', description: 'Emotion - sadness', category: 'word' },
  { name: 'Understand', description: 'Comprehension confirmation', category: 'word' },
  { name: 'Name', description: 'Asking for or stating name', category: 'word' },
  { name: 'Where', description: 'Location question', category: 'word' },
  { name: 'When', description: 'Time question', category: 'word' },
  { name: 'How', description: 'Method question', category: 'word' },
];

export const LANDMARK_DIMENSIONS = {
  FACE: 468,
  POSE: 33,
  LEFT_HAND: 21,
  RIGHT_HAND: 21,
  TOTAL_FEATURES: 171,
};

export const SEQUENCE_LENGTH = 30;
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;
