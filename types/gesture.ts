export interface Gesture {
  id: string;
  name: string;
  description: string;
  category: 'alphabet' | 'word' | 'phrase' | 'number' | 'letter';
  videoUrl?: string;
  createdAt: Date;
}

export interface TranslationResult {
  id: string;
  gesture: Gesture;
  confidenceScore: number;
  timestamp: Date;
  sessionId: string;
}

export interface UserProgress {
  id: string;
  gestureId: string;
  practiceCount: number;
  lastPracticedAt: Date;
  masteryLevel: number;
}

export interface AppSettings {
  speechEnabled: boolean;
  speechRate: number;
  confidenceThreshold: number;
  cameraResolution: 'low' | 'medium' | 'high';
}

export interface LandmarkData {
  face: number[][];
  pose: number[][];
  leftHand: number[][];
  rightHand: number[][];
}

export interface FrameFeatures {
  landmarks: LandmarkData;
  timestamp: number;
  vector: number[];
}
