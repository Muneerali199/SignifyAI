import { Gesture } from '@/types/gesture';

// ISL Gestures supported by our trained model
// Model recognizes: Numbers 1-9 and Letters A-B
export const ISL_GESTURES: Omit<Gesture, 'id' | 'createdAt'>[] = [
  // Numbers (1-9)
  { name: '1', description: 'ISL sign for number one', category: 'number' },
  { name: '2', description: 'ISL sign for number two', category: 'number' },
  { name: '3', description: 'ISL sign for number three', category: 'number' },
  { name: '4', description: 'ISL sign for number four', category: 'number' },
  { name: '5', description: 'ISL sign for number five', category: 'number' },
  { name: '6', description: 'ISL sign for number six', category: 'number' },
  { name: '7', description: 'ISL sign for number seven', category: 'number' },
  { name: '8', description: 'ISL sign for number eight', category: 'number' },
  { name: '9', description: 'ISL sign for number nine', category: 'number' },
  
  // Letters (A-B)
  { name: 'A', description: 'ISL sign for letter A', category: 'letter' },
  { name: 'B', description: 'ISL sign for letter B', category: 'letter' },
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
