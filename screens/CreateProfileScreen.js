import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  TextInput 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import { Ionicons } from '@expo/vector-icons';

const CreateProfileScreen = ({ navigation }) => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: '', relationship: '', phone: '', priority: 'Primary' }
  ]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const addContact = () => {
    if (emergencyContacts.length < 5) {
      setEmergencyContacts([...emergencyContacts, { 
        id: Date.now(), 
        name: '', 
        relationship: '', 
        phone: '', 
        priority: 'Secondary' 
      }]);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Complete Your Profile</Text>
        
        {/* Profile Photo */}
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={40} color={Theme.colors.primary} />
            </View>
          )}
          <Text style={styles.photoText}>Upload Profile Photo</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <GlassInput label="Full Name" placeholder="Enter your name" />
          <GlassInput label="Date of Birth" placeholder="YYYY-MM-DD" />
          <GlassInput label="Blood Group" placeholder="e.g. O+" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <GlassInput label="Mobile Number" placeholder="+91 00000 00000" keyboardType="phone-pad" />
          <GlassInput label="Email Address" placeholder="email@example.com" keyboardType="email-address" />
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity onPress={addContact}>
              <Text style={styles.addText}>+ Add Contact</Text>
            </TouchableOpacity>
          </View>

          {emergencyContacts.map((contact, index) => (
            <View key={contact.id} style={styles.contactCard}>
              <Text style={styles.contactIndex}>Contact #{index + 1}</Text>
              <GlassInput placeholder="Name" />
              <GlassInput placeholder="Relationship" />
              <GlassInput placeholder="Phone Number" keyboardType="phone-pad" />
            </View>
          ))}
        </View>

        <GlassButton 
          title="Continue to Verification" 
          onPress={() => navigation.navigate('Verification')} 
          style={styles.continueButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  photoText: {
    marginTop: Theme.spacing.sm,
    color: Theme.colors.primary,
    fontWeight: '600',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  contactCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  contactIndex: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
  },
  continueButton: {
    marginTop: Theme.spacing.lg,
  }
});

export default CreateProfileScreen;
