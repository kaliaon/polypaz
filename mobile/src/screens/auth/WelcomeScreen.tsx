/**
 * Welcome Screen
 * First screen users see when opening the app
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
          <Text style={styles.appName}>PolyPath</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Learn Languages</Text>
          <Text style={styles.title}>Your Way</Text>
          <Text style={styles.subtitle}>
            AI-powered personalized learning paths tailored to your goals and pace
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="📊" text="Personalized learning roadmaps" />
          <FeatureItem icon="💬" text="Interactive dialogue practice" />
          <FeatureItem icon="🎯" text="Adaptive exercises" />
          <FeatureItem icon="📈" text="Track your progress" />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Register')}
          fullWidth
          size="large"
          style={styles.primaryButton}
        />

        <Button
          title="I Already Have an Account"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
};

interface FeatureItemProps {
  icon: string;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  textContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    lineHeight: 24,
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  primaryButton: {
    marginBottom: 0,
  },
});

export default WelcomeScreen;
