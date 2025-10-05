import { FrameFeatures, LandmarkData } from '@/types/gesture';
import { ISL_GESTURES, SEQUENCE_LENGTH } from '@/constants/gestures';

export class GestureRecognitionService {
  private frameBuffer: FrameFeatures[] = [];
  private isProcessing: boolean = false;

  extractFeatures(landmarks: LandmarkData): number[] {
    const features: number[] = [];

    if (landmarks.pose && landmarks.pose.length > 0) {
      landmarks.pose.forEach(point => {
        features.push(point[0] || 0, point[1] || 0, point[2] || 0);
      });
    }

    if (landmarks.face && landmarks.face.length > 0) {
      landmarks.face.forEach(point => {
        features.push(point[0] || 0, point[1] || 0, point[2] || 0);
      });
    }

    if (landmarks.leftHand && landmarks.leftHand.length > 0) {
      landmarks.leftHand.forEach(point => {
        features.push(point[0] || 0, point[1] || 0, point[2] || 0);
      });
    }

    if (landmarks.rightHand && landmarks.rightHand.length > 0) {
      landmarks.rightHand.forEach(point => {
        features.push(point[0] || 0, point[1] || 0, point[2] || 0);
      });
    }

    while (features.length < 171) {
      features.push(0);
    }

    return features.slice(0, 171);
  }

  addFrame(landmarks: LandmarkData): void {
    const vector = this.extractFeatures(landmarks);
    const frame: FrameFeatures = {
      landmarks,
      timestamp: Date.now(),
      vector,
    };

    this.frameBuffer.push(frame);

    if (this.frameBuffer.length > SEQUENCE_LENGTH) {
      this.frameBuffer.shift();
    }
  }

  isReadyForPrediction(): boolean {
    return this.frameBuffer.length === SEQUENCE_LENGTH && !this.isProcessing;
  }

  async predictGesture(): Promise<{ gestureIndex: number; confidence: number } | null> {
    if (!this.isReadyForPrediction()) {
      return null;
    }

    this.isProcessing = true;

    try {
      const sequence = this.frameBuffer.map(frame => frame.vector);

      const mockPrediction = this.mockTFLiteInference(sequence);

      return mockPrediction;
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  private mockTFLiteInference(sequence: number[][]): { gestureIndex: number; confidence: number } {
    const gestureIndex = Math.floor(Math.random() * ISL_GESTURES.length);
    const confidence = 0.75 + Math.random() * 0.2;

    return { gestureIndex, confidence };
  }

  clearBuffer(): void {
    this.frameBuffer = [];
  }

  getBufferStatus(): { current: number; required: number; percentage: number } {
    return {
      current: this.frameBuffer.length,
      required: SEQUENCE_LENGTH,
      percentage: (this.frameBuffer.length / SEQUENCE_LENGTH) * 100,
    };
  }
}

export const gestureRecognitionService = new GestureRecognitionService();
