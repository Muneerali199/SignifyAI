import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, CircleStop as StopCircle, RotateCw } from 'lucide-react-native';
import { lightweightGestureRecognition } from '@/services/gestureRecognitionLightweight';
import { useApp } from '@/contexts/AppContext';
import { TranslationResult } from '@/types/gesture';

const { width, height } = Dimensions.get('window');

interface TranslatorCameraProps {
  onGestureDetected: (result: TranslationResult) => void;
}

export const TranslatorCamera = ({ onGestureDetected }: TranslatorCameraProps) => {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [bufferStatus, setBufferStatus] = useState({ current: 0, required: 30, percentage: 0 });
  const { settings, gestures, sessionId } = useApp();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={64} color="#666" />
        <Text style={styles.permissionText}>Camera access is required</Text>
        <Text style={styles.permissionSubtext}>
          We need camera permission to detect sign language gestures
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startRecording = () => {
    setIsRecording(true);
    let frameCount = 0;

    // Simulate frame capture and prediction
    intervalRef.current = setInterval(async () => {
      frameCount++;
      
      // Update buffer status (simulate frame collection)
      const percentage = Math.min((frameCount / 30) * 100, 100);
      setBufferStatus({
        current: frameCount,
        required: 30,
        percentage: percentage
      });

      // Every 30 frames (~3 seconds at 10fps), make a prediction
      if (frameCount >= 30 && lightweightGestureRecognition.isReady()) {
        try {
          console.log('📸 Making prediction after 30 frames...');
          
          // In a real implementation, we'd capture actual camera frame here
          const mockImageUri = 'mock://camera/frame.jpg';
          
          const prediction = await lightweightGestureRecognition.predictGesture(mockImageUri);
          console.log('🎯 Prediction result:', prediction);

          if (prediction && prediction.confidence >= settings.confidenceThreshold) {
            // Find matching gesture from our gestures list
            const matchedGesture = gestures.find(g => 
              g.name === prediction.gesture || 
              g.name.includes(prediction.gesture)
            );

            console.log('✅ Matched gesture:', matchedGesture);

            if (matchedGesture) {
              const result: TranslationResult = {
                id: `result_${Date.now()}`,
                gesture: matchedGesture,
                confidenceScore: prediction.confidence,
                timestamp: new Date(),
                sessionId,
              };

              onGestureDetected(result);
              
              // Reset frame count
              frameCount = 0;
              setBufferStatus({ current: 0, required: 30, percentage: 0 });
            }
          } else {
            console.log('⚠️ Confidence too low:', prediction?.confidence, 'threshold:', settings.confidenceThreshold);
            // Reset anyway to try again
            frameCount = 0;
            setBufferStatus({ current: 0, required: 30, percentage: 0 });
          }
        } catch (error) {
          console.error('❌ Prediction error:', error);
          frameCount = 0;
          setBufferStatus({ current: 0, required: 30, percentage: 0 });
        }
      }
    }, 100);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBufferStatus({ current: 0, required: 30, percentage: 0 });
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <RotateCw size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerArea}>
            <View style={styles.frameGuide} />
            {isRecording && (
              <View style={styles.bufferIndicator}>
                <View style={[styles.bufferBar, { width: `${bufferStatus.percentage}%` }]} />
              </View>
            )}
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <StopCircle size={36} color="#fff" />
              ) : (
                <Camera size={36} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 60,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameGuide: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  bufferIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bufferBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  bottomBar: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
});
