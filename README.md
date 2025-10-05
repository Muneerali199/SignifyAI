# 🤟 Dynamic Indian Sign Language Translator

An AI-powered mobile application for real-time Indian Sign Language (ISL) translation using React Native, Deep Learning, and Computer Vision.

## Overview

The Dynamic ISL Translator bridges the communication gap between deaf and hearing communities by recognizing Indian Sign Language gestures through the phone's camera and converting them into text and speech in real-time.

## Features

- **Real-Time Gesture Recognition**: Uses camera to capture and interpret ISL gestures instantly
- **Text-to-Speech**: Automatically speaks recognized gestures aloud
- **Translation History**: Tracks all detected gestures with timestamps and confidence scores
- **Learning Mode**: Browse and learn 22+ ISL gestures with descriptions
- **Customizable Settings**: Adjust speech rate, confidence threshold, and camera resolution
- **Offline Capable**: Model runs on-device using TensorFlow Lite

## Technology Stack

- **Frontend**: React Native + Expo
- **Camera**: Expo Camera with real-time video processing
- **Speech**: Expo Speech for text-to-speech conversion
- **Storage**: AsyncStorage for local data persistence
- **Computer Vision**: MediaPipe (for landmark detection - integration ready)
- **AI Model**: TensorFlow Lite (ready for deployment)
- **TypeScript**: Full type safety

## App Structure

### Screens

1. **Translator Tab** (`app/(tabs)/index.tsx`)
   - Real-time camera view with gesture detection
   - Live translation display with confidence scores
   - Text-to-speech output

2. **History Tab** (`app/(tabs)/history.tsx`)
   - Complete translation history
   - Confidence scores and timestamps
   - Replay speech functionality

3. **Learn Tab** (`app/(tabs)/learn.tsx`)
   - Browse 22 ISL gestures
   - Search and filter by category
   - Practice tracking and mastery levels

4. **Settings Tab** (`app/(tabs)/settings.tsx`)
   - Speech output controls
   - Recognition sensitivity
   - Data management

### Services

- `gestureRecognition.ts`: Handles landmark extraction and ML inference
- `speechService.ts`: Manages text-to-speech output
- `storage.ts`: Local data persistence

## Supported Gestures

The app recognizes 22 common ISL gestures including:

- **Phrases**: Hello, Thank You, Sorry
- **Common Words**: Help, Yes, No, Please, Good, Bad
- **Needs**: Water, Food, Medicine
- **Relations**: Family, Friend, Love
- **Emotions**: Happy, Sad
- **Questions**: Where, When, How
- **Others**: Understand, Name

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

### Building for Web

```bash
npm run build:web
```

### Type Checking

```bash
npm run typecheck
```

## Integration Guide

### MediaPipe Integration

To integrate real MediaPipe landmark detection:

1. Install MediaPipe for React Native
2. Update `TranslatorCamera.tsx` to use actual landmark detection
3. Replace mock data in the interval with real MediaPipe output

### TensorFlow Lite Model

To integrate your trained model:

1. Convert your Keras model to TFLite format
2. Add the `.tflite` file to `assets/models/`
3. Install `@tensorflow/tfjs-react-native`
4. Update `gestureRecognitionService.ts` to load and run inference

Example integration:

```typescript
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const model = await tf.loadLayersModel(
  bundleResourceIO(
    require('./assets/models/isl_model.json'),
    require('./assets/models/isl_weights.bin')
  )
);
```

## Architecture

### Feature Extraction

Each frame extracts 171 features:
- Face landmarks: 468 points
- Pose landmarks: 33 points
- Left hand: 21 points
- Right hand: 21 points

### Sequence Processing

- Buffers 30 frames per gesture
- Extracts temporal features
- Feeds to Conv1D + BiLSTM + Attention model

### Model Architecture

```
Input (30 frames × 171 features)
    ↓
Conv1D (64 filters)
    ↓
Bidirectional LSTM (128 units)
    ↓
Multi-Head Attention (2 heads)
    ↓
Dense + Dropout
    ↓
Output (22 gesture classes)
```

## Development Team

- **Shreya Mittal**
- **Shrishti Sharma**
- **Vasu Kumar**

**Supervisor**: Mrs. Mohini Preetam Singh
**Institution**: Meerut Institute of Engineering and Technology

## Future Enhancements

- [ ] Continuous sentence translation
- [ ] Cloud-based model updates
- [ ] 3D gesture capture with transformers
- [ ] Bidirectional translation (speech-to-sign)
- [ ] Interactive learning mode with AR/VR
- [ ] Expanded gesture vocabulary

## License

Educational project - All rights reserved to the development team.
