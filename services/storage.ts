import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, TranslationResult, UserProgress } from '@/types/gesture';

const STORAGE_KEYS = {
  SETTINGS: '@isl_settings',
  HISTORY: '@isl_history',
  PROGRESS: '@isl_progress',
  SESSION_ID: '@isl_session_id',
};

export const StorageService = {
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    return {
      speechEnabled: true,
      speechRate: 1.0,
      confidenceThreshold: 0.7,
      cameraResolution: 'medium',
    };
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  async getHistory(): Promise<TranslationResult[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          gesture: {
            ...item.gesture,
            createdAt: new Date(item.gesture.createdAt),
          },
        }));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
    return [];
  },

  async addToHistory(result: TranslationResult): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift(result);

      const limitedHistory = history.slice(0, 100);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  },

  async getProgress(): Promise<UserProgress[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((item: any) => ({
          ...item,
          lastPracticedAt: new Date(item.lastPracticedAt),
        }));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    return [];
  },

  async updateProgress(gestureId: string, correctPrediction: boolean): Promise<void> {
    try {
      const progress = await this.getProgress();
      const existing = progress.find(p => p.gestureId === gestureId);

      if (existing) {
        existing.practiceCount += 1;
        existing.lastPracticedAt = new Date();
        if (correctPrediction) {
          existing.masteryLevel = Math.min(100, existing.masteryLevel + 5);
        } else {
          existing.masteryLevel = Math.max(0, existing.masteryLevel - 2);
        }
      } else {
        progress.push({
          id: Math.random().toString(36).substr(2, 9),
          gestureId,
          practiceCount: 1,
          lastPracticedAt: new Date(),
          masteryLevel: correctPrediction ? 5 : 0,
        });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  },

  async getSessionId(): Promise<string> {
    try {
      let sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      }
      return sessionId;
    } catch (error) {
      console.error('Error getting session ID:', error);
      return `session_${Date.now()}`;
    }
  },

  async resetSessionId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    } catch (error) {
      console.error('Error resetting session ID:', error);
    }
  },
};
