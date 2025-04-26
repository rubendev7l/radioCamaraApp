import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
    >
      <Stack.Screen options={{ 
        title: 'Página não encontrada',
        headerShown: false 
      }} />
      
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/logo-white.png')}
          style={styles.logo}
        />
        
        <View style={styles.content}>
          <Ionicons name="alert-circle" size={64} color="#FFFFFF" />
          <Text style={styles.title}>Ops!</Text>
          <Text style={styles.message}>
            A página que você está procurando não existe ou foi removida.
          </Text>
          
          <Link href="/" asChild>
            <TouchableOpacity style={styles.button}>
              <Ionicons name="home" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Voltar para o início</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 150,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 30,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 