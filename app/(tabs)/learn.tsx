import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, BookOpen, Volume2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { Gesture, UserProgress } from '@/types/gesture';
import { StorageService } from '@/services/storage';

export default function LearnScreen() {
  const { gestures, speechService } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'alphabet' | 'word' | 'phrase'>('all');
  const [progress, setProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const userProgress = await StorageService.getProgress();
    setProgress(userProgress);
  };

  const filteredGestures = gestures.filter(gesture => {
    const matchesSearch = gesture.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || gesture.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getGestureProgress = (gestureId: string): UserProgress | undefined => {
    return progress.find(p => p.gestureId === gestureId);
  };

  const handleSpeak = async (gesture: Gesture) => {
    await speechService.speak(gesture.name);
  };

  const renderCategory = (category: 'all' | 'alphabet' | 'word' | 'phrase') => {
    const isSelected = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}
        onPress={() => setSelectedCategory(category)}
      >
        <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Gesture }) => {
    const gestureProgress = getGestureProgress(item.id);
    const masteryLevel = gestureProgress?.masteryLevel || 0;
    const masteryColor = masteryLevel >= 70 ? '#4CAF50' : masteryLevel >= 40 ? '#FF9800' : '#999';

    return (
      <View style={styles.gestureCard}>
        <View style={styles.gestureContent}>
          <View style={styles.gestureHeader}>
            <Text style={styles.gestureName}>{item.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.gestureDescription}>{item.description}</Text>

          {gestureProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${masteryLevel}%`, backgroundColor: masteryColor },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Practiced {gestureProgress.practiceCount} times
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.speakButton}
          onPress={() => handleSpeak(item)}
        >
          <Volume2 size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn ISL</Text>
        <BookOpen size={28} color="#007AFF" />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search gestures..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.categoryContainer}>
        {renderCategory('all')}
        {renderCategory('word')}
        {renderCategory('phrase')}
      </View>

      <FlatList
        data={filteredGestures}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No gestures found</Text>
          </View>
        }
      />
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  gestureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gestureContent: {
    flex: 1,
  },
  gestureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  gestureName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  gestureDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  speakButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
