import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

export default function PodcastsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Podcasts</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Podcast */}
        <View style={styles.featuredContainer}>
          <View style={styles.featuredImagePlaceholder}>
            <Ionicons name="mic" size={64} color="#666666" />
          </View>
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredTitle}>TARDE 103</Text>
            <Text style={styles.featuredDescription}>
              Entrevistas e conversas descontraídas sobre temas relevantes para a comunidade.
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            <TouchableOpacity style={styles.categoryButton}>
              <Ionicons name="mic" size={24} color="#FFFFFF" />
              <Text style={styles.categoryText}>Entrevistas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Ionicons name="newspaper" size={24} color="#FFFFFF" />
              <Text style={styles.categoryText}>Notícias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Ionicons name="football" size={24} color="#FFFFFF" />
              <Text style={styles.categoryText}>Esportes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
              <Text style={styles.categoryText}>Vereadores</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recent Episodes */}
        <View style={styles.episodesContainer}>
          <Text style={styles.sectionTitle}>Episódios Recentes</Text>
          {/* Episode List */}
          <View style={styles.episodeList}>
            {/* Placeholder for episodes */}
            <Text style={styles.comingSoon}>
              Em breve: Integração com Spotify
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  featuredContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    padding: 15,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  categoriesContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  episodesContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  episodeList: {
    marginTop: 15,
  },
  comingSoon: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 