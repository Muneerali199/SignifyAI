/**
 * Real TFLite Model Gesture Recognition Service
 * 
 * This service loads and uses the trained ISL model for real-time predictions.
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';

// Import model labels
import modelLabels from '../app/assets/models/labels.json';

interface PredictionResult {
  gestureIndex: number;
  gesture: string;
  confidence: number;
  allPredictions: { label: string; confidence: number }[];
}

export class TFLiteGestureRecognition {
  private model: tf.GraphModel | null = null;
  private isModelLoaded: boolean = false;
  private labels: { [key: string]: string } = modelLabels;
  private isProcessing: boolean = false;

  /**
   * Initialize TensorFlow and load the model
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing TensorFlow.js...');
      
      // Wait for TensorFlow to be ready
      await tf.ready();
      console.log('✓ TensorFlow.js ready');
      console.log('  Backend:', tf.getBackend());

      // Load the model
      await this.loadModel();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize TensorFlow:', error);
      return false;
    }
  }

  /**
   * Load the TFLite model from assets
   */
  private async loadModel(): Promise<void> {
    try {
      console.log('📦 Loading TFLite model...');

      // Get model file from assets
      const modelAsset = Asset.fromModule(
        require('../app/assets/models/isl_model_quantized.tflite')
      );
      
      await modelAsset.downloadAsync();
      
      if (!modelAsset.localUri) {
        throw new Error('Failed to get model local URI');
      }

      // Load the model using TensorFlow.js
      // Note: For TFLite, we'll use the converter approach
      const modelUri = modelAsset.localUri;
      
      // Since TFLite direct loading isn't fully supported in tfjs-react-native,
      // we'll use the converted model approach
      this.model = await tf.loadGraphModel(modelUri);
      
      this.isModelLoaded = true;
      console.log('✓ Model loaded successfully');
      
      // Warm up the model with a dummy prediction
      await this.warmUp();
      
    } catch (error) {
      console.error('❌ Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Warm up the model with a dummy prediction
   */
  private async warmUp(): Promise<void> {
    try {
      console.log('🔥 Warming up model...');
      
      // Create dummy input tensor (64x64x3)
      const dummyInput = tf.randomUniform([1, 64, 64, 3]);
      
      // Run prediction
      const prediction = this.model!.predict(dummyInput) as tf.Tensor;
      
      // Clean up
      dummyInput.dispose();
      prediction.dispose();
      
      console.log('✓ Model warmed up');
    } catch (error) {
      console.error('⚠ Model warm-up failed:', error);
    }
  }

  /**
   * Preprocess image for model input
   */
  private async preprocessImage(imageUri: string): Promise<tf.Tensor3D> {
    try {
      // Resize image to 64x64 (model input size)
      const resizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 64, height: 64 } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
      );

      // Read image as base64
      const imageBase64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to tensor
      const imageTensor = await this.base64ToTensor(imageBase64);
      
      return imageTensor;
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      throw error;
    }
  }

  /**
   * Convert base64 image to tensor
   */
  private async base64ToTensor(base64: string): Promise<tf.Tensor3D> {
    // Decode base64 to image data
    const imageData = tf.util.encodeString(base64, 'base64');
    
    // Decode JPEG
    const imageTensor = tf.node.decodeJpeg(imageData);
    
    // Ensure it's 64x64x3
    const resized = tf.image.resizeBilinear(imageTensor, [64, 64]);
    
    // Normalize to [0, 1]
    const normalized = resized.div(255.0);
    
    // Clean up intermediate tensors
    imageTensor.dispose();
    resized.dispose();
    
    return normalized as tf.Tensor3D;
  }

  /**
   * Predict gesture from camera image
   */
  async predictGesture(imageUri: string): Promise<PredictionResult | null> {
    if (!this.isModelLoaded || !this.model) {
      console.error('❌ Model not loaded');
      return null;
    }

    if (this.isProcessing) {
      console.log('⚠ Already processing a prediction');
      return null;
    }

    this.isProcessing = true;

    try {
      // Preprocess image
      const inputTensor = await this.preprocessImage(imageUri);
      
      // Add batch dimension (1, 64, 64, 3)
      const batchedInput = inputTensor.expandDims(0);
      
      // Run prediction
      const predictions = this.model.predict(batchedInput) as tf.Tensor;
      
      // Get prediction data
      const predictionData = await predictions.data();
      
      // Find best prediction
      let maxConfidence = 0;
      let bestIndex = 0;
      
      for (let i = 0; i < predictionData.length; i++) {
        if (predictionData[i] > maxConfidence) {
          maxConfidence = predictionData[i];
          bestIndex = i;
        }
      }
      
      // Get all predictions with labels
      const allPredictions = Array.from(predictionData).map((confidence, index) => ({
        label: this.labels[index.toString()] || `Unknown_${index}`,
        confidence: confidence,
      }));
      
      // Sort by confidence
      allPredictions.sort((a, b) => b.confidence - a.confidence);
      
      // Clean up tensors
      inputTensor.dispose();
      batchedInput.dispose();
      predictions.dispose();
      
      const result: PredictionResult = {
        gestureIndex: bestIndex,
        gesture: this.labels[bestIndex.toString()] || 'Unknown',
        confidence: maxConfidence,
        allPredictions: allPredictions.slice(0, 5), // Top 5 predictions
      };
      
      console.log(`🎯 Prediction: ${result.gesture} (${(result.confidence * 100).toFixed(1)}%)`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if model is ready
   */
  isReady(): boolean {
    return this.isModelLoaded && this.model !== null;
  }

  /**
   * Get model info
   */
  getModelInfo(): { loaded: boolean; labels: string[] } {
    return {
      loaded: this.isModelLoaded,
      labels: Object.values(this.labels),
    };
  }

  /**
   * Dispose of model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
      console.log('🗑️ Model disposed');
    }
  }
}

// Singleton instance
export const gestureRecognition = new TFLiteGestureRecognition();
