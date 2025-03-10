import { Image, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

// Import simple QR code library - uses less dependencies
import QRCode from 'react-native-qrcode-svg';

import heartIcon from '@/assets/images/Cardio-Workout-icon.png';
import treadmillIcon from '@/assets/images/Lower-Workout-icon.png';
import situpIcon from '@/assets/images/Core-Workout-icon.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import kotsIcon from '@/assets/images/Coach-icon.png';

// API URLs for the gym member count and user's program
const MEMBERS_API_URL = 'https://your-api-endpoint.com/active-members';
const PROGRAM_API_URL = 'https://your-api-endpoint.com/user-program';

// Map exercise types to their corresponding icons
const exerciseIconMap = {
  'cardio': heartIcon,
  'lower': treadmillIcon,
  'core': situpIcon,
  'upper': bicepIcon
};

// Mock program data for fallback
const mockProgram = [
  { icon: heartIcon, type: 'cardio', name: 'Treadmill Run', details: '20 minutes, moderate pace', completed: false },
  { icon: treadmillIcon, type: 'lower', name: 'Squats', details: '4 sets   12 reps', completed: false },
  { icon: bicepIcon, type: 'upper', name: 'Dumbbell Curls', details: '3 sets   10 reps', completed: false },
  { icon: situpIcon, type: 'core', name: 'Russian Twists', details: '3 sets   15 reps each side', completed: false },
];

const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  const [exercises, setExercises] = useState(mockProgram); // Use mock data directly
  const [programLoading, setProgramLoading] = useState(false); // No loading state needed for mock data
  const [programError, setProgramError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // QR code states
  const [qrVisible, setQrVisible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(5);
  
  // Gym member count state
  const [memberCount, setMemberCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Safe JSON parse function with error handling (kept for future use)
  const safeJsonParse = async (response) => {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        throw new Error('API returned non-JSON response');
      }
    } catch (error) {
      console.error('Response parse error:', error.message);
      throw new Error(`Parse error: ${error.message}`);
    }
  };

  // Fetch user's program from API (disabled for now)
  const fetchUserProgram = async () => {
    // Disabled for now, only mock data is used
    console.log('Fetch functionality is disabled. Using mock data.');
  };

  // Fetch member count from API (disabled for now)
  const fetchMemberCount = async () => {
    setIsLoading(true);
    try {
      // Demo data, simulate API response with random count between 20-50
      const mockResponse = {
        activeMembers: Math.floor(Math.random() * 31) + 20,
        timestamp: new Date().toISOString()
      };
      
      setMemberCount(mockResponse.activeMembers);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching member count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMemberCount();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchMemberCount();
    const intervalId = setInterval(fetchMemberCount, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const toggleExercise = (index) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === index ? { ...exercise, completed: !exercise.completed } : exercise
    );
    setExercises(updatedExercises);
  };
  
  // Simple function to generate QR code
  const generateQR = () => {
    setQrVisible(true);
    setDaysRemaining(5);
    Alert.alert("Success", "QR code generated successfully!");
  };

  // Create QR code value with user information
  const qrValue = JSON.stringify({
    name: "Louis Anton L. Gascon",
    membershipId: "GYM-12345",
    timestamp: new Date().toISOString(),
    expires: new Date(Date.now() + daysRemaining * 86400000).toISOString()
  });

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastUpdated) / 60000);
    
    if (diffInMinutes < 1) return 'Updated just now';
    if (diffInMinutes === 1) return 'Updated 1 minute ago';
    return `Updated ${diffInMinutes} minutes ago`;
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 30 }} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
            title="Pull to refresh..."
            titleColor="#AAAAAA"
          />
        }
      >
        {/* Program for Today */}
        <View style={styles.card}>
          <Text style={styles.heading}>Your program for today</Text>
          {exercises.length === 0 ? (
            <View style={styles.noExercisesContainer}>
              <Text style={styles.noExercisesText}>No exercises scheduled for today</Text>
              <Text style={styles.restDayText}>Enjoy your rest day!</Text>
            </View>
          ) : (
            <>
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
            </>
          )}
          <Text style={styles.programNote}>
            Program optimized for current gym occupancy: {memberCount} members
          </Text>
        </View>

        {/* Gym Members Count - Now with pull-to-refresh functionality */}
        <View style={styles.membersCard}>
          <Text style={styles.bigText}>{isLoading ? '...' : memberCount}</Text>
          <Text style={styles.details}>Gym members currently making gains</Text>
          {lastUpdated && (
            <Text style={styles.updateTimeText}>{formatLastUpdated()}</Text>
          )}
          <Text style={styles.pullToRefreshHint}>Pull down to refresh</Text>
        </View>
        
        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            {qrVisible ? (
              <QRCode
                value={qrValue}
                size={150}
                backgroundColor="white"
                color="black"
              />
            ) : (
              <AntDesign name="qrcode" size={150} color="black" />
            )}
          </View>

          <View style={styles.qrDetails}>
            <Text style={styles.text}>Days until your QR code expires:</Text>
            <Text style={styles.expiry}>{daysRemaining}</Text>
            <TouchableOpacity style={styles.button} onPress={generateQR}>
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
    paddingTop: -50,
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
  updateTimeText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: 'KeaniaOne',
    marginTop: 5,
  },
  pullToRefreshHint: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'KeaniaOne',
    marginTop: 8,
    opacity: 0.7,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontFamily: 'KeaniaOne',
  },
  noExercisesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noExercisesText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'KeaniaOne',
  },
  restDayText: {
    color: '#4CAF50',
    fontSize: 14,
    fontFamily: 'KeaniaOne',
    marginTop: 10,
  },
  programNote: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default HomeScreen;