import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { TranslationResult } from '@/types/gesture';

interface TranslationDisplayProps {
  result: TranslationResult | null;
  onSpeak: () => void;
  isSpeaking: boolean;
}

export const TranslationDisplay = ({ result, onSpeak, isSpeaking }: TranslationDisplayProps) => {
  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholderText}>Start recording to detect gestures</Text>
      </View>
    );
  }

  const confidencePercentage = Math.round(result.confidenceScore * 100);
  const confidenceColor = result.confidenceScore >= 0.8 ? '#4CAF50' : result.confidenceScore >= 0.6 ? '#FF9800' : '#F44336';

  return (
    <View style={styles.container}>
      <View style={styles.resultCard}>
        <Text style={styles.gestureName}>{result.gesture.name}</Text>
        <Text style={styles.gestureDescription}>{result.gesture.description}</Text>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: `${confidencePercentage}%`,
                  backgroundColor: confidenceColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {confidencePercentage}%
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
          onPress={onSpeak}
        >
          {isSpeaking ? (
            <VolumeX size={24} color="#fff" />
          ) : (
            <Volume2 size={24} color="#fff" />
          )}
          <Text style={styles.speakButtonText}>
            {isSpeaking ? 'Stop Speaking' : 'Speak'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    paddingVertical: 32,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gestureName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  gestureDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  speakButtonActive: {
    backgroundColor: '#FF3B30',
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
