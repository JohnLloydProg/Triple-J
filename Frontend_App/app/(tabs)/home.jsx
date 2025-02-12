import { Image, StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

import heartIcon from '@/assets/images/Cardio-Workout-icon.png';
import treadmillIcon from '@/assets/images/Lower-Workout-icon.png';
import situpIcon from '@/assets/images/Core-Workout-icon.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import kotsIcon from '@/assets/images/Coach-icon.png';

const initialExercises = [
  { icon: treadmillIcon, name: 'Treadmill', details: '10 km', completed: false },
  { icon: situpIcon, name: 'Jumping Jacks', details: '4 sets   30 reps', completed: false },
  { icon: bicepIcon, name: 'Burpees', details: '4 sets   15 reps', completed: false },
];

const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const [exercises, setExercises] = useState(initialExercises);

  const toggleExercise = (index) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === index ? { ...exercise, completed: !exercise.completed } : exercise
    );
    setExercises(updatedExercises);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 30 }} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Program for Today */}
        <View style={styles.card}>
          <Text style={styles.heading}>Your program for today</Text>
          {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              {exercise.icon && (
                <Image source={exercise.icon} style={styles.exerciseIcon} resizeMode="contain" />
              )}

              <View style={styles.exerciseTextContainer}>
                <Text style={styles.text}>{exercise.name}</Text>
                <Text style={styles.details}>{exercise.details}</Text>
              </View>

              <CheckBox
                checked={exercise.completed}
                onPress={() => toggleExercise(index)}
                checkedColor="green"
                uncheckedColor="red"
                containerStyle={[styles.checkbox, { transform: [{ scale: 1.5 }] }]}
              />
            </View>
          ))}
        </View>

        {/* Gym Members Count */}
        <View style={styles.membersCard}>
          <Text style={styles.bigText}>30</Text>
          <Text style={styles.details}>Gym members currently making gains</Text>
        </View>
        
        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <AntDesign name="qrcode" size={150} color="black" />
          </View>

          <View style={styles.qrDetails}>
            <Text style={styles.text}>Days until your QR code expires:</Text>
            <Text style={styles.expiry}>5</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Generate QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image source={kotsIcon} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.text}>Louis Anton L. Gascon</Text>
            <Text style={styles.schedule}>12/24/2025 - 00:04:20</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Contact Me</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop:-50,
    paddingBottom: -15,
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 10,
  },
  card: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 10,
  },
  heading: {
    color: 'white',
    fontSize: 25,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  details: {
    color: 'gray',
    fontSize: 14,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  bigText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D3D3D',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    marginLeft: 15,
  },
  exerciseTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  membersCard: {
    backgroundColor: '#3D3D3D',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  qrContainer: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  qrBox: {
    width: 150,
    height: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  qrDetails: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 17,
  },
  schedule: {
    color: '#FF4D4D',
    fontSize: 16,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  expiry: {
    color: '#FF4D4D',
    fontSize: 30,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  profileContainer: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 40,
    marginRight: 15,
  },
  profileTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default HomeScreen;
