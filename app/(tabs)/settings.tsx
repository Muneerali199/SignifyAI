import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Settings as SettingsIcon, Volume2, Camera, Info, Trash2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { StorageService } from '@/services/storage';

export default function SettingsScreen() {
  const { settings, updateSettings, clearHistory } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggleSpeech = async (value: boolean) => {
    const newSettings = { ...localSettings, speechEnabled: value };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleSpeechRateChange = async (rate: number) => {
    const newSettings = { ...localSettings, speechRate: rate };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleThresholdChange = async (threshold: number) => {
    const newSettings = { ...localSettings, confidenceThreshold: threshold };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleResolutionChange = async (resolution: 'low' | 'medium' | 'high') => {
    const newSettings = { ...localSettings, cameraResolution: resolution };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all history and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            await StorageService.resetSessionId();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <SettingsIcon size={28} color="#007AFF" />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Volume2 size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Speech Output</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Speech</Text>
            <Switch
              value={localSettings.speechEnabled}
              onValueChange={handleToggleSpeech}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>

          {localSettings.speechEnabled && (
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Speech Rate</Text>
                <Text style={styles.settingValue}>{localSettings.speechRate.toFixed(1)}x</Text>
              </View>
              <View style={styles.rateButtons}>
                <TouchableOpacity
                  style={[
                    styles.rateButton,
                    localSettings.speechRate === 0.5 && styles.rateButtonActive,
                  ]}
                  onPress={() => handleSpeechRateChange(0.5)}
                >
                  <Text
                    style={[
                      styles.rateButtonText,
                      localSettings.speechRate === 0.5 && styles.rateButtonTextActive,
                    ]}
                  >
                    Slow
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.rateButton,
                    localSettings.speechRate === 1.0 && styles.rateButtonActive,
                  ]}
                  onPress={() => handleSpeechRateChange(1.0)}
                >
                  <Text
                    style={[
                      styles.rateButtonText,
                      localSettings.speechRate === 1.0 && styles.rateButtonTextActive,
                    ]}
                  >
                    Normal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.rateButton,
                    localSettings.speechRate === 1.5 && styles.rateButtonActive,
                  ]}
                  onPress={() => handleSpeechRateChange(1.5)}
                >
                  <Text
                    style={[
                      styles.rateButtonText,
                      localSettings.speechRate === 1.5 && styles.rateButtonTextActive,
                    ]}
                  >
                    Fast
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Camera size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Camera & Recognition</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Confidence Threshold</Text>
              <Text style={styles.settingValue}>
                {Math.round(localSettings.confidenceThreshold * 100)}%
              </Text>
            </View>
            <View style={styles.rateButtons}>
              <TouchableOpacity
                style={[
                  styles.rateButton,
                  localSettings.confidenceThreshold === 0.5 && styles.rateButtonActive,
                ]}
                onPress={() => handleThresholdChange(0.5)}
              >
                <Text
                  style={[
                    styles.rateButtonText,
                    localSettings.confidenceThreshold === 0.5 && styles.rateButtonTextActive,
                  ]}
                >
                  Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rateButton,
                  localSettings.confidenceThreshold === 0.7 && styles.rateButtonActive,
                ]}
                onPress={() => handleThresholdChange(0.7)}
              >
                <Text
                  style={[
                    styles.rateButtonText,
                    localSettings.confidenceThreshold === 0.7 && styles.rateButtonTextActive,
                  ]}
                >
                  Medium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rateButton,
                  localSettings.confidenceThreshold === 0.9 && styles.rateButtonActive,
                ]}
                onPress={() => handleThresholdChange(0.9)}
              >
                <Text
                  style={[
                    styles.rateButtonText,
                    localSettings.confidenceThreshold === 0.9 && styles.rateButtonTextActive,
                  ]}
                >
                  High
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Camera Resolution</Text>
              <Text style={styles.settingValue}>
                {localSettings.cameraResolution.charAt(0).toUpperCase() +
                  localSettings.cameraResolution.slice(1)}
              </Text>
            </View>
            <View style={styles.rateButtons}>
              <TouchableOpacity
                style={[
                  styles.rateButton,
                  localSettings.cameraResolution === 'low' && styles.rateButtonActive,
                ]}
                onPress={() => handleResolutionChange('low')}
              >
                <Text
                  style={[
                    styles.rateButtonText,
                    localSettings.cameraResolution === 'low' && styles.rateButtonTextActive,
                  ]}
                >
                  Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rateButton,
                  localSettings.cameraResolution === 'medium' && styles.rateButtonActive,
                ]}
                onPress={() => handleResolutionChange('medium')}
              >
                <Text
                  style={[
                    styles.rateButtonText,
                    localSettings.cameraResolution === 'medium' && styles.rateButtonTextActive,
                  ]}
                >
                  Medium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rateButton,
                  localSettings.cameraResolution === 'high' && styles.rateButtonActive,
                ]}
                onPress={() => handleResolutionChange('high')}
              >
                <Text
                  style={[
                    styles.rateButtonText,
                    localSettings.cameraResolution === 'high' && styles.rateButtonTextActive,
                  ]}
                >
                  High
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
            <Trash2 size={20} color="#FF3B30" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Dynamic ISL Translator</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            AI-powered Indian Sign Language translator using deep learning and computer vision
          </Text>
          <Text style={styles.aboutCredits}>
            Developed by Shreya Mittal, Shrishti Sharma & Vasu Kumar
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  rateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rateButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  rateButtonActive: {
    backgroundColor: '#007AFF',
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  rateButtonTextActive: {
    color: '#fff',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  aboutSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginBottom: 32,
    padding: 20,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutCredits: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
