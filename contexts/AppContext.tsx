import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, TranslationResult, Gesture } from '@/types/gesture';
import { StorageService } from '@/services/storage';
import { SpeechService } from '@/services/speechService';
import { ISL_GESTURES } from '@/constants/gestures';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => Promise<void>;
  history: TranslationResult[];
  addToHistory: (result: TranslationResult) => Promise<void>;
  clearHistory: () => Promise<void>;
  gestures: Gesture[];
  speechService: SpeechService;
  sessionId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>({
    speechEnabled: true,
    speechRate: 1.0,
    confidenceThreshold: 0.7,
    cameraResolution: 'medium',
  });
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [speechService, setSpeechService] = useState<SpeechService>(new SpeechService(settings));
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const loadedSettings = await StorageService.getSettings();
    setSettings(loadedSettings);
    setSpeechService(new SpeechService(loadedSettings));

    const loadedHistory = await StorageService.getHistory();
    setHistory(loadedHistory);

    const session = await StorageService.getSessionId();
    setSessionId(session);

    const loadedGestures: Gesture[] = ISL_GESTURES.map((g, index) => ({
      ...g,
      id: `gesture_${index}`,
      createdAt: new Date(),
    }));
    setGestures(loadedGestures);
  };

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
    speechService.updateSettings(newSettings);
  };

  const addToHistory = async (result: TranslationResult) => {
    await StorageService.addToHistory(result);
    const updatedHistory = await StorageService.getHistory();
    setHistory(updatedHistory);
  };

  const clearHistory = async () => {
    await StorageService.clearHistory();
    setHistory([]);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        history,
        addToHistory,
        clearHistory,
        gestures,
        speechService,
        sessionId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
