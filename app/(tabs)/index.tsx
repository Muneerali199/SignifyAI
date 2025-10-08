import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TranslatorCamera } from '@/components/TranslatorCamera';
import { TranslationDisplay } from '@/components/TranslationDisplay';
import { TranslationResult } from '@/types/gesture';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Sparkles } from 'lucide-react-native';

export default function TranslatorScreen() {
  const [currentResult, setCurrentResult] = useState<TranslationResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speechService, addToHistory } = useApp();

  const handleGestureDetected = async (result: TranslationResult) => {
    console.log('🎉 Gesture detected in index.tsx:', result.gesture.name);
    console.log('   Confidence:', (result.confidenceScore * 100).toFixed(1) + '%');
    
    setCurrentResult(result);
    await addToHistory(result);

    if (speechService) {
      console.log('🔊 Speaking:', result.gesture.name);
      setIsSpeaking(true);
      await speechService.speak(result.gesture.name);
      setIsSpeaking(false);
      console.log('✅ Speech complete');
    } else {
      console.warn('⚠️ Speech service not available');
    }
  };

  const handleSpeak = async () => {
    if (!currentResult) return;

    if (isSpeaking) {
      await speechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await speechService.speak(currentResult.gesture.name);
      setIsSpeaking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTitle}>
              <Sparkles size={24} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.headerText}>SignSpeak</Text>
            </View>
            <Text style={styles.headerSubtext}>AI-Powered ISL Translation</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Camera Section */}
      <View style={styles.cameraContainer}>
        <TranslatorCamera onGestureDetected={handleGestureDetected} />
      </View>

      {/* Results Section */}
      <ScrollView style={styles.displayContainer}>
        <TranslationDisplay
          result={currentResult}
          onSpeak={handleSpeak}
          isSpeaking={isSpeaking}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingBottom: Spacing.md,
  },
  headerContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerText: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtext: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
  cameraContainer: {
    flex: 2,
  },
  displayContainer: {
    flex: 1,
  },
});
