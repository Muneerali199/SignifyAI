import * as Speech from 'expo-speech';
import { AppSettings } from '@/types/gesture';

export class SpeechService {
  private settings: AppSettings;
  private isSpeaking: boolean = false;

  constructor(settings: AppSettings) {
    this.settings = settings;
  }

  updateSettings(settings: AppSettings): void {
    this.settings = settings;
  }

  async speak(text: string): Promise<void> {
    if (!this.settings.speechEnabled) {
      return;
    }

    if (this.isSpeaking) {
      await this.stop();
    }

    this.isSpeaking = true;

    try {
      await Speech.speak(text, {
        rate: this.settings.speechRate,
        pitch: 1.0,
        language: 'en-IN',
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      this.isSpeaking = false;
    }
  }

  async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }
}
