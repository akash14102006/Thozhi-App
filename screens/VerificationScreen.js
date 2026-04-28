import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

const VerificationScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [aadhaar, setAadhaar] = useState('');
  const [verificationStep, setVerificationStep] = useState('Look Center');
  const [isVerified, setIsVerified] = useState(false);

  const borderScale = useSharedValue(1);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const simulateFaceCheck = () => {
    setIsCameraActive(true);
    setVerificationStep('Look Center');
    
    setTimeout(() => setVerificationStep('Turn Right'), 2000);
    setTimeout(() => setVerificationStep('Turn Left'), 4000);
    setTimeout(() => {
      setIsCameraActive(false);
      setIsVerified(true);
      Alert.alert("Success", "Identity verified successfully!");
    }, 6000);
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: isVerified ? Theme.colors.success : Theme.colors.primary,
    borderWidth: 4,
    borderRadius: 150,
  }));

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>This helps us provide safer and trusted support</Text>
          <Text style={styles.badge}>Step 2 of 3</Text>
        </View>

        {/* Aadhaar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🪪 Aadhaar Verification</Text>
          <GlassInput 
            label="Aadhaar Number" 
            placeholder="XXXX XXXX 1234" 
            keyboardType="numeric"
            maxLength={12}
            value={aadhaar}
            onChangeText={setAadhaar}
          />
        </View>

        {/* Selfie Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤳 Selfie Verification</Text>
          <View style={styles.cameraWrapper}>
            {isCameraActive ? (
              <View style={styles.cameraPreview}>
                <Camera style={styles.camera} type={Camera.Constants.Type.front} />
                <View style={[styles.overlay, { borderColor: isVerified ? Theme.colors.success : Theme.colors.primary }]} />
                <Text style={styles.instructionText}>{verificationStep}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.cameraPlaceholder} onPress={simulateFaceCheck}>
                <Ionicons name="person-circle-outline" size={80} color={Theme.colors.primary} />
                <Text style={styles.cameraText}>Tap to Start Live Face Check</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <GlassButton 
            title={isVerified ? "Complete Verification" : "Verify & Continue"} 
            onPress={() => navigation.replace('Home')}
            style={styles.primaryBtn}
          />
          <TouchableOpacity onPress={() => navigation.replace('Home')}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.xs,
  },
  badge: {
    backgroundColor: Theme.colors.primary + '33',
    color: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: Theme.spacing.md,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  cameraWrapper: {
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: Theme.colors.primary,
    fontWeight: '600',
    marginTop: Theme.spacing.sm,
  },
  cameraPreview: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    backgroundColor: 'transparent',
  },
  instructionText: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  skipText: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  }
});

export default VerificationScreen;
