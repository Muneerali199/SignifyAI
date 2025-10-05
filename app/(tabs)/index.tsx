import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { TranslatorCamera } from '@/components/TranslatorCamera';
import { TranslationDisplay } from '@/components/TranslationDisplay';
import { TranslationResult } from '@/types/gesture';
import { useApp } from '@/contexts/AppContext';

export default function TranslatorScreen() {
  const [currentResult, setCurrentResult] = useState<TranslationResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speechService, addToHistory } = useApp();

  const handleGestureDetected = async (result: TranslationResult) => {
    setCurrentResult(result);
    await addToHistory(result);

    if (speechService) {
      setIsSpeaking(true);
      await speechService.speak(result.gesture.name);
      setIsSpeaking(false);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <TranslatorCamera onGestureDetected={handleGestureDetected} />
      </View>
      <ScrollView style={styles.displayContainer}>
        <TranslationDisplay
          result={currentResult}
          onSpeak={handleSpeak}
          isSpeaking={isSpeaking}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 2,
  },
  displayContainer: {
    flex: 1,
  },
});
