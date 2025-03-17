import { Image, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

// Import simple QR code library - uses less dependencies
import QRCode from 'react-native-qrcode-svg';

import heartIcon from '@/assets/images/Cardio-Workout-icon.png';
import treadmillIcon from '@/assets/images/Lower-Workout-icon.png';
import situpIcon from '@/assets/images/Core-Workout-icon.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import kotsIcon from '@/assets/images/Coach-icon.png';

// API configuration
const API_CONFIG = {
  BASE_URL: 'https://your-api-endpoint.com',
  ENDPOINTS: {
    USER_DATA: '/user-data',
    MEMBER_COUNT: '/active-members',
    USER_PROGRAM: '/user-program',
  },
  HEADERS: {
    'Content-Type': 'application/json',
    // Add authorization headers if needed
    // 'Authorization': 'Bearer YOUR_TOKEN'
  }
};

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

// Reusable fetch function with error handling and caching
const fetchWithCache = async (endpoint, options = {}) => {
  const cacheKey = `cache_${endpoint}`;
  const cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  
  try {
    // Check if we have cached data
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > cacheDuration;
      
      if (!isExpired) {
        console.log(`Using cached data for ${endpoint}`);
        return data;
      }
    }
    
    // Fetch fresh data
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: API_CONFIG.HEADERS,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the data
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  const [exercises, setExercises] = useState(mockProgram);
  const [programLoading, setProgramLoading] = useState(false);
  const [programError, setProgramError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qrVisible, setQrVisible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(5);
  const [memberCount, setMemberCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    id: '',
  });

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithCache(API_CONFIG.ENDPOINTS.USER_DATA);
      setUserData({
        name: data.name || 'Guest User',
        id: data.id || 'Unknown',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data. Using cached data if available.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch active members count
  const fetchMemberCount = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithCache(API_CONFIG.ENDPOINTS.MEMBER_COUNT);
      setMemberCount(data.activeMembers || 0);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching member count:', error);
      // Fallback to mock data if API fails
      const mockCount = Math.floor(Math.random() * 31) + 20;
      setMemberCount(mockCount);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch user program
  const fetchUserProgram = async () => {
    try {
      setProgramLoading(true);
      setProgramError(false);
      const data = await fetchWithCache(API_CONFIG.ENDPOINTS.USER_PROGRAM);
      
      if (data && data.exercises && data.exercises.length > 0) {
        // Map API data to our exercise format
        const formattedExercises = data.exercises.map(exercise => {
          return {
            icon: exerciseIconMap[exercise.type] || situpIcon, // Default to situp icon if type not found
            type: exercise.type || 'unknown',
            name: exercise.name,
            details: exercise.details,
            completed: exercise.completed || false
          };
        });
        setExercises(formattedExercises);
      } else {
        // If no exercises in response, use empty array to show rest day message
        setExercises([]);
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      setProgramError(true);
      setErrorMessage('Could not load your exercise program. Please try again later.');
      // Fallback to mock data
      setExercises(mockProgram);
    } finally {
      setProgramLoading(false);
    }
  };

  // Combined refresh function for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUserData(),
        fetchMemberCount(),
        fetchUserProgram()
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchUserData(),
          fetchMemberCount(),
          fetchUserProgram()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
    
    // Set up periodic refresh for member count only
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

  // Generate QR code
  const generateQR = () => {
    if (!userData.name || !userData.id) {
      Alert.alert('Error', 'User data is not available. Please try again later.');
      return;
    }

    setQrVisible(true);
    setDaysRemaining(5);
    Alert.alert('Success', 'QR code generated successfully!');
  };

  // QR code value
  const qrValue = JSON.stringify({
    name: userData.name,
    membershipId: userData.id,
    timestamp: new Date().toISOString(),
    expires: new Date(Date.now() + daysRemaining * 86400000).toISOString(),
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
          {programLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your workout...</Text>
            </View>
          ) : programError ? (
            <View style={styles.noExercisesContainer}>
              <Text style={styles.noExercisesText}>{errorMessage}</Text>
            </View>
          ) : exercises.length === 0 ? (
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
        </View>

        {/* Gym Members Count */}
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
          {qrVisible && (
            <View style={styles.qrBox}>
              <QRCode
                value={qrValue}
                size={150}
                backgroundColor="white"
                color="black"
              />
            </View>
          )}
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
            <Text style={styles.text}>{userData.name || 'Loading...'}</Text>
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