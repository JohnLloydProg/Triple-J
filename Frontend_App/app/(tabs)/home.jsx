import { Image, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, Modal, Linking, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { router} from 'expo-router';

// Make sure to import the new fetch function
import { fetchCurrentProgram, fetchGymPopulation, fetchQrCode, generateNewQrCode, fetchLatestAnnouncement } from '../../components/generalFetchFunction';

import heartIcon from '@/assets/images/Cardio-Workout-icon.png';
import treadmillIcon from '@/assets/images/Lower-Workout-icon.png';
import situpIcon from '@/assets/images/Core-Workout-icon.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import kotsIcon from '@/assets/images/Coach-icon.png';
import placeholderQrIcon from '@/assets/images/placeholder-qr.png';

const exerciseIconMap = {
  'cardio': heartIcon,
  'lower': treadmillIcon,
  'core': situpIcon,
  'upper': bicepIcon,
};

const HomeScreen = () => {
  // Network state
  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Network state changed:", state);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);

      if (state.isConnected === false) {
        router.push('/');
        console.log("Device is offline!");
      } else if (state.isConnected === true) {
        console.log("Device is back online!");
      }
    });

    return () => {
      unsubscribe();
      console.log("NetInfo listener unsubscribed.");
    };
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  // State for UI data
  const [currentFormattedDate, setCurrentFormattedDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Announcement State
  const [announcement, setAnnouncement] = useState(null);
  const [announcementLoading, setAnnouncementLoading] = useState(true);

  // Program and Coach State
  const [exercises, setExercises] = useState([]);
  const [coachInfo, setCoachInfo] = useState(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [programError, setProgramError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Gym Population State
  const [gymPopCount, setGymPopCount] = useState({ Number: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);

  // QR Code State
  const [qrData, setQrData] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const updateDisplayedDate = useCallback(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, options);
    setCurrentFormattedDate(formattedDate);
  }, []);

  const loadAnnouncement = useCallback(async () => {
    setAnnouncementLoading(true);
    try {
        const announcementData = await fetchLatestAnnouncement();
        setAnnouncement(announcementData); // Can be null if none, which is fine
    } catch (error) {
        console.error("HomeScreen: Failed to load announcement:", error);
        setAnnouncement(null); // On error, just hide the announcement section
    } finally {
        setAnnouncementLoading(false);
    }
  }, []);
  
  const loadProgramData = useCallback(async () => {
    setProgramLoading(true);
    setProgramError(false);
    setErrorMessage('');
    setCoachInfo(null);

    try {
      const programPayload = await fetchCurrentProgram(exerciseIconMap);
      console.log("HomeScreen: fetchCurrentProgram returned:", JSON.stringify(programPayload, null, 2));

      if (programPayload && Array.isArray(programPayload.exercises)) {
        setExercises(programPayload.exercises);
        setCoachInfo(programPayload.coach); // Set coach info from the payload

        if (programPayload.exercises.length === 0) {
          const today = new Date();
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayName = dayNames[today.getDay()];
          setErrorMessage(`No exercises scheduled for ${currentDayName}.`);
        }
      } else {
        console.warn("HomeScreen: fetchCurrentProgram did not return a valid payload. Received:", programPayload);
        setExercises([]);
        setErrorMessage('Workout data is not in the expected format or none found for today.');
      }
    } catch (error) {
      console.error("HomeScreen: Error in loadProgramData:", error);
      setProgramError(true);
      setErrorMessage(error.message || "Could not load your program. Pull down to refresh.");
      setExercises([]);
    } finally {
      setProgramLoading(false);
    }
  }, []);

  const loadGymPopulation = useCallback(async () => {
    try {
      const data = await fetchGymPopulation();
      setGymPopCount(data || { Number: 0 });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("HomeScreen: Failed to load gym population:", error);
      setGymPopCount({ Number: 0 });
    }
  }, []); 

  const loadQrData = useCallback(async () => {
    try {
      const data = await fetchQrCode();
      setQrData(data);
    } catch (error) {
      console.error("HomeScreen: Failed to load QR code:", error);
      setQrData(null); 
    }
  }, []); 

  const handleGenerateNewQr = async () => {
    Alert.alert(
      "Generate New QR",
      "Are you sure you want to generate a new QR code? Your current one will be invalidated.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Generate",
          onPress: async () => {
            try {
              const generationResponse = await generateNewQrCode();
              await loadQrData(); 
              Alert.alert("Success", generationResponse.details || "New QR Code Generated!");
            } catch (error) {
              Alert.alert("Error", error.message || "Could not generate new QR code.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await loadAnnouncement();
      await loadProgramData();
      await loadGymPopulation();
      await loadQrData();
    };

    if (fontsLoaded) {
      updateDisplayedDate();
      fetchInitialData();
    } else if (fontError) {
        console.error("HomeScreen: Font loading error:", fontError);
    }
  }, [fontsLoaded, fontError]); // Dependencies simplified to run once on load

  const onRefresh = useCallback(async () => {
    console.log("Refreshing data...");
    setRefreshing(true);
    updateDisplayedDate();
    await Promise.all([
        loadAnnouncement(),
        loadProgramData(),
        loadGymPopulation(),
        loadQrData()
    ]);
    setRefreshing(false);
    console.log("Refreshing data finished.");
  }, []);

  const toggleExercise = (index) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === index ? { ...exercise, completed: !exercise.completed } : exercise
    );
    setExercises(updatedExercises);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Loading...';
    const now = new Date();
    const diffInSeconds = Math.floor((now - lastUpdated) / 1000);
    if (diffInSeconds < 5) return 'Updated just now';
    if (diffInSeconds < 60) return `Updated ${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes === 1) return 'Updated 1 minute ago';
    return `Updated ${diffInMinutes} minutes ago`;
  };

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.safeContainer}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E'}}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={{color: 'white', marginTop: 10, fontFamily: 'KeaniaOne'}}>Loading App...</Text>
        </View>
      </View>
    );
  }

  const currentDaysRemaining = qrData?.days_remaining ?? '...';
  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayNameForMessage = dayNames[today.getDay()];

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
          />
        }
      >
        {/* Announcement Section */}
        {announcementLoading ? (
            <View style={[styles.announcementCard, {paddingVertical: 30, alignItems: 'center'}]}>
                <ActivityIndicator color="#FFFFFF" />
            </View>
        ) : announcement && (
            <View style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementContent}>{announcement.content}</Text>
            </View>
        )}

        {/* Program for Today Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>{currentFormattedDate || "Loading Date..."}</Text>
          {programLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading your workout...</Text>
            </View>
          ) : programError ? (
            <View style={styles.noExercisesContainer}>
              <Text style={[styles.noExercisesText, {color: 'red'}]}>{errorMessage}</Text>
              <TouchableOpacity onPress={onRefresh} style={[styles.button, {marginTop: 15, backgroundColor: '#555'}]}>
                  <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : exercises.length > 0 ? (
            <>
              {exercises.map((exercise, index) => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    <Image source={exercise.icon} style={styles.exerciseIcon} resizeMode="contain"/>
                    <View style={styles.exerciseTextContainer}>
                      <Text style={styles.text}>{exercise.name}</Text>
                      <Text style={styles.details}>{exercise.details}</Text>
                    </View>
                    <CheckBox
                      checked={!!exercise.completed}
                      onPress={() => toggleExercise(index)}
                      checkedColor="green"
                      uncheckedColor="red"
                      containerStyle={styles.checkbox}
                    />
                  </View>
              ))}
            </>
          ) : (
            <View style={styles.noExercisesContainer}>
              <Text style={styles.noExercisesText}>{errorMessage || "No exercises scheduled for today."}</Text>
              {(!errorMessage || errorMessage.includes(`No exercises scheduled for ${currentDayNameForMessage}`)) &&
                <Text style={styles.restDayText}>Enjoy your rest day!</Text>}
            </View>
          )}
        </View>

        {/* Gym Members Count */}
        <View style={styles.membersCard}>
          <Text style={styles.bigText}>{gymPopCount?.Number ?? '...'}</Text>
          <Text style={styles.details}>Gym members currently making gains</Text>
          <Text style={styles.updateTimeText}>{formatLastUpdated()}</Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <TouchableOpacity onPress={() => { if (qrData && qrData.image) setQrModalVisible(true); else Alert.alert("QR Code", "QR Code not available. Please refresh.")}}>
            <Image
              source={qrData && qrData.image ? { uri: `https://triple-j.onrender.com${qrData.image}` } : placeholderQrIcon}
              style={styles.qrBox}
            />
          </TouchableOpacity>
          <View style={styles.qrDetails}>
            <Text style={styles.text}>Days until QR expires:</Text>
            <Text style={styles.expiry}>{currentDaysRemaining}</Text>
            <TouchableOpacity style={styles.button} onPress={handleGenerateNewQr}>
              <Text style={styles.buttonText}>Generate New QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trainer/Profile Section */}
        <View style={styles.profileContainer}>
          <Image 
            source={coachInfo && coachInfo.profile_image_url ? { uri: `https://triple-j.onrender.com${coachInfo.profile_image_url}` } : kotsIcon} 
            style={styles.profileImage}
            onError={() => console.log("Failed to load coach image.")}
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.text}>{coachInfo?.name || 'Your Coach'}</Text>
            <Text style={styles.details}>{coachInfo?.title || 'Fitness Coach'}</Text>
            <TouchableOpacity 
              style={[styles.button, !coachInfo?.contact_url && {backgroundColor: '#555'}]} 
              disabled={!coachInfo?.contact_url}
              onPress={() => {
                if (coachInfo?.contact_url) {
                  Linking.openURL(coachInfo.contact_url).catch(() => Alert.alert("Error", "Could not open contact link."));
                }
              }}
            >
              <Text style={styles.buttonText}>Contact Me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QR Modal */}
        <Modal
            visible={qrModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setQrModalVisible(false)}
        >
            <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPressOut={() => setQrModalVisible(false)}>
              <View style={styles.modalContent}>
                {qrData && qrData.image ? (
                  <Image
                    source={{ uri: `https://triple-j.onrender.com${qrData.image}` }}
                    style={{ width: 280, height: 280, resizeMode: 'contain', backgroundColor: 'white', padding: 10, borderRadius: 5 }}
                  />
                ) : (
                  <Text style={styles.text}>QR code not available.</Text>
                )}
                <TouchableOpacity onPress={() => setQrModalVisible(false)} style={[styles.button, styles.closeButtonModal]}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 10,
  },
  announcementCard: {
    backgroundColor: '#334D7A', // A distinct but subtle blue
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  announcementTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
    marginBottom: 5,
  },
  announcementContent: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
    // Using a system font can be more readable for paragraphs
  },
  card: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 30,
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
    marginTop: 4,
    marginBottom: 8,
  },
  bigText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
    marginBottom: 5,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D3D3D',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  exerciseTextContainer: {
    flex: 1,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 10,
    transform: [{ scale: 1.5 }],
  },
  membersCard: {
    backgroundColor: '#3D3D3D',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  updateTimeText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: 'KeaniaOne',
    marginTop: 5, 
  },
  qrContainer: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  qrBox: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  qrDetails: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 15,
  },
  expiry: {
    color: '#FF4D4D',
    fontSize: 30,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 10,
    minWidth: 150,
    alignItems: 'center',
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
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    backgroundColor: '#555', // Placeholder background
  },
  profileTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 100,
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontFamily: 'KeaniaOne',
    marginTop: 10,
  },
  noExercisesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 100,
  },
  noExercisesText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
  },
  restDayText: {
    color: '#4CAF50',
    fontSize: 14,
    fontFamily: 'KeaniaOne',
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2D2D2D',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    maxWidth: 350,
  },
  closeButtonModal: {
    marginTop: 20,
    backgroundColor: '#FF4D4D',
  },
});

export default HomeScreen;