import { Image, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, Modal, Linking, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { fetchCurrentProgram, fetchGymPopulation, fetchQrCode, generateNewQrCode } from '../../components/generalFetchFunction';

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
  const [fontsLoaded, fontError] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  const [currentFormattedDate, setCurrentFormattedDate] = useState('');
  const [exercises, setExercises] = useState([]);
  const [programLoading, setProgramLoading] = useState(true);
  const [programError, setProgramError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [gymPopCount, setGymPopCount] = useState({ Number: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);

  const [qrData, setQrData] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const updateDisplayedDate = useCallback(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, options);
    setCurrentFormattedDate(formattedDate);
  }, []);

  
  const loadProgramData = useCallback(async () => {
    console.log("DEBUG: HomeScreen loadProgramData IS DEFINITELY CALLING fetchCurrentProgram NOW!"); // Unique Log
    setProgramLoading(true);
    setProgramError(false);
    setErrorMessage('');

    try {

      const programDataFromFetch = await fetchCurrentProgram(exerciseIconMap);
      
      console.log("HomeScreen: fetchCurrentProgram (from API service) returned:", JSON.stringify(programDataFromFetch, null, 2));

      if (programDataFromFetch && Array.isArray(programDataFromFetch)) {

        setExercises(programDataFromFetch); 
        if (programDataFromFetch.length === 0) {
          const today = new Date();
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayName = dayNames[today.getDay()];

          setErrorMessage(`No exercises scheduled for ${currentDayName}.`);
        }
      } else {
        console.warn("HomeScreen: fetchCurrentProgram did not return a valid array. Received:", programDataFromFetch);
        setExercises([]);
        setErrorMessage('Workout data is not in the expected format or none found for today.');
      }
    } catch (error) {
      console.error("HomeScreen: Error in loadProgramData's try-catch (using fetchCurrentProgram):", error);
      setProgramError(true);
      
      setErrorMessage(error.message || "Could not load your program. Pull down to refresh.");
      setExercises([]);
    } finally {
      setProgramLoading(false);
      console.log("HomeScreen: loadProgramData FINISHED (using fetchCurrentProgram).");
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
    console.log("HomeScreen: loadQrData called to fetch QR details.");
    try {
      const data = await fetchQrCode(); 
      console.log("HomeScreen: fetchQrCode (GET) returned:", data);
      setQrData(data);
    } catch (error) {
      console.error("HomeScreen: Failed to load QR code via loadQrData:", error);
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
              console.log("HomeScreen: Attempting to generate new QR (POST)...");
              const generationResponse = await generateNewQrCode();
              console.log("HomeScreen: generateNewQrCode (POST) response:", generationResponse);

              console.log("HomeScreen: New QR generated, now fetching updated QR data (GET)...");
              await loadQrData(); 

              Alert.alert("Success", generationResponse.details || "New QR Code Generated! Displaying updated QR.");
            } catch (error) {
              console.error("HomeScreen: Error during new QR generation or fetch:", error);
              Alert.alert("Error", error.message || "Could not generate or fetch new QR code.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      // ...
      await loadProgramData();
      await loadGymPopulation();
      await loadQrData(); 
      // ...
    };

    if (fontsLoaded) {
      updateDisplayedDate();
      fetchInitialData();
    } else if (fontError) {
        console.error("HomeScreen: Font loading error:", fontError);
    }
  }, [fontsLoaded, fontError, updateDisplayedDate, loadProgramData, loadGymPopulation, loadQrData]);

  const onRefresh = useCallback(async () => {
    console.log("Refreshing data...");
    setRefreshing(true);
    updateDisplayedDate();
    await loadProgramData();
    await loadGymPopulation();
    await loadQrData(); // Refresh QR data
    setRefreshing(false);
    console.log("Refreshing data finished.");
  }, [updateDisplayedDate, loadProgramData, loadGymPopulation, loadQrData]);

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
            <Text style={{color: 'white', marginTop: 10, fontFamily: 'KeaniaOne'}}>Loading Fonts...</Text>
        </View>
      </View>
    );
  }
  if (fontError) {
     return (
      <View style={styles.safeContainer}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E'}}>
            <Text style={{color: 'white', fontFamily: 'KeaniaOne'}}>Error loading fonts. Please restart.</Text>
            <Text style={{color: 'red', marginTop: 5}}>{fontError.message || "Unknown font error"}</Text>
        </View>
      </View>
    );
  }

  const currentDaysRemaining = qrData?.days_remaining ?? 0;
  const today = new Date(); // Used for rest day message conditional rendering
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
            title="Pull to refresh..."
            titleColor="#AAAAAA"
          />
        }
      >
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
              <TouchableOpacity onPress={loadProgramData} style={[styles.button, {marginTop: 15, backgroundColor: '#555'}]}>
                  <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : exercises && exercises.length > 0 ? (
            <>
              {exercises.map((exercise, index) => {
                if (!exercise || !exercise.id) {
                  console.warn(`JSX: Rendering exercise [${index}] is invalid or missing id:`, JSON.stringify(exercise));
                  return null;
                }
                return (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    {exercise.icon ? (
                      <Image
                        source={exercise.icon}
                        style={styles.exerciseIcon}
                        resizeMode="contain"
                        onError={(e) => console.error(`Error loading image for exercise ${exercise.name || index} (ID: ${exercise.id}):`, e.nativeEvent.error, "Icon source:", exercise.icon)}
                      />
                    ) : <View style={[styles.exerciseIcon, {backgroundColor: '#555'}]} /> }
                    <View style={styles.exerciseTextContainer}>
                      <Text style={styles.text}>{exercise.name}</Text>
                      <Text style={styles.details}>{exercise.details}</Text>
                    </View>
                    <CheckBox
                      checked={!!exercise.completed}
                      onPress={() => toggleExercise(index)}
                      checkedColor="green"
                      uncheckedColor="red"
                      containerStyle={[styles.checkbox, { transform: [{ scale: 1.5 }] }]}
                    />
                  </View>
                );
              })}
            </>
          ) : (
            <View style={styles.noExercisesContainer}>
              <Text style={styles.noExercisesText}>{errorMessage || "No exercises scheduled for today."}</Text>
              {(!errorMessage || errorMessage === 'No exercises scheduled for today.' || (errorMessage && errorMessage.includes(`No exercises scheduled for ${currentDayNameForMessage}`))) &&
                <Text style={styles.restDayText}>Enjoy your rest day!</Text>}
            </View>
          )}
        </View>

        {/* Gym Members Count */}
        <View style={styles.membersCard}>
          <Text style={styles.bigText}>{gymPopCount?.Number ?? '...'}</Text>
          <Text style={styles.details}>Gym members currently making gains</Text>
          <Text style={styles.updateTimeText}>{formatLastUpdated()}</Text>
          <Text style={styles.pullToRefreshHint}>Pull down to refresh</Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <TouchableOpacity onPress={() => { if (qrData && qrData.image) setQrModalVisible(true); else Alert.alert("QR Code", "QR Code not available. Please try refreshing or generate a new one.")}}>
            <Image
              source={qrData && qrData.image ? { uri: `https://triple-j.onrender.com${qrData.image}` } : placeholderQrIcon}
              style={styles.qrBox}
              onError={(e) => {
                console.log("Error loading QR image:", e.nativeEvent.error);
              }}
            />
          </TouchableOpacity>
          <View style={styles.qrDetails}>
            <Text style={styles.text}>Days until QR expires:</Text>
            <Text style={styles.expiry}>{currentDaysRemaining}</Text>
            <TouchableOpacity style={styles.button} onPress={handleGenerateNewQr}>
              <Text style={styles.buttonText}>Generate New QR</Text>
            </TouchableOpacity>
          </View>
          <Modal
            visible={qrModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setQrModalVisible(false)}
          >
            <TouchableOpacity
                style={styles.modalBackground}
                activeOpacity={1}
                onPressOut={() => setQrModalVisible(false)}
            >
              <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
                {qrData && qrData.image ? (
                  <Image
                    source={{ uri: `https://triple-j.onrender.com${qrData.image}` }}
                    style={{ width: 280, height: 280, resizeMode: 'contain',  backgroundColor: 'white', padding: 10, borderRadius: 5 }}
                  />
                ) : (
                  <Text style={styles.text}>QR code not available.</Text>
                )}
                <TouchableOpacity onPress={() => setQrModalVisible(false)} style={[styles.button, styles.closeButtonModal]}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image source={kotsIcon} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.text}>Louis Gascon</Text>
            <Text style={styles.schedule}>12/24/2025 - 00:04:20</Text>
            <TouchableOpacity style={styles.button} onPress={() => {Linking.openURL("https://web.facebook.com/louisanton.gascon").catch(err => console.error('An error occurred', err));}}>
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
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 10,
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
    marginTop: 2,
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
  schedule: {
    color: '#FF4D4D',
    fontSize: 16,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
    marginVertical: 5,
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
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
});

export default HomeScreen;