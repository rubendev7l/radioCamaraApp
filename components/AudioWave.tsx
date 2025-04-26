import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

/** 
 * Props do componente de onda de áudio
 * Controla a animação baseada no estado de reprodução
 */
interface AudioWaveProps {
  isPlaying: boolean;  // Indica se o áudio está tocando
}

/** 
 * Componente que renderiza uma onda de áudio animada
 * Cria um efeito visual de equalizador durante a reprodução
 */
export function AudioWave({ isPlaying }: AudioWaveProps) {
  /** 
   * Array de valores animados para cada barra da onda
   * Controla a altura de cada barra individualmente
   */
  const waveAnimations = useRef<Animated.Value[]>(
    Array(8).fill(0).map(() => new Animated.Value(0.5))
  ).current;

  /** 
   * Array de valores animados para o efeito de brilho
   * Controla a opacidade e sombra de cada barra
   */
  const glowAnimations = useRef<Animated.Value[]>(
    Array(8).fill(0).map(() => new Animated.Value(0))
  ).current;

  /** 
   * Efeito que controla as animações baseado no estado de reprodução
   * Inicia/para as animações quando o estado muda
   */
  useEffect(() => {
    if (isPlaying) {
      // Cria animações para cada barra da onda
      const animations = waveAnimations.map((anim, index) => {
        const duration = 400 + (index * 50);  // Duração progressiva para cada barra
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      });

      // Cria efeitos de brilho para cada barra
      const glowEffects = glowAnimations.map((_, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnimations[index], {
              toValue: 1,
              duration: 800 + (index * 100),  // Duração mais longa para o brilho
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnimations[index], {
              toValue: 0,
              duration: 800 + (index * 100),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      });

      // Inicia todas as animações
      animations.forEach((anim: Animated.CompositeAnimation) => anim.start());
      glowEffects.forEach((anim: Animated.CompositeAnimation) => anim.start());

      // Limpa as animações ao desmontar
      return () => {
        animations.forEach((anim: Animated.CompositeAnimation) => anim.stop());
        glowEffects.forEach((anim: Animated.CompositeAnimation) => anim.stop());
      };
    } else {
      // Reseta as animações quando para de tocar
      waveAnimations.forEach(anim => anim.setValue(0.5));
      glowAnimations.forEach(anim => anim.setValue(0));
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {waveAnimations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.wave,
            {
              // Anima a escala vertical da barra
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
              // Anima a opacidade baseada no brilho
              opacity: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
              // Configura o efeito de sombra
              shadowColor: '#FFFFFF',
              shadowOffset: {
                width: 0,
                height: 0,
              },
              // Anima a opacidade da sombra
              shadowOpacity: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
              // Anima o raio da sombra
              shadowRadius: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 5],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

/** 
 * Estilos do componente
 * Define o layout e aparência das barras da onda
 */
const styles = StyleSheet.create({
  /** Container principal que organiza as barras horizontalmente */
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginVertical: 20,
  },
  /** Estilo individual de cada barra da onda */
  wave: {
    width: 4,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
}); 