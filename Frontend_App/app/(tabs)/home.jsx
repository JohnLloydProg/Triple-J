import { Image, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, Modal, Linking, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';
import colors from '../../constants/globalStyles';

import { fetchCurrentProgram, fetchGymPopulation, fetchQrCode, generateNewQrCode, fetchLatestAnnouncement, fetchAllAnnouncements } from '../../components/generalFetchFunction';
import { getToken, refreshAccessToken } from '../../components/storageComponent'; // Added missing imports

import heartIcon from '@/assets/images/Cardio-Workout-icon.png';
import treadmillIcon from '@/assets/images/Lower-Workout-icon.png';
import situpIcon from '@/assets/images/Core-Workout-icon.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import kotsIcon from '@/assets/images/Coach-icon.png';
import placeholderQrIcon from '@/assets/images/placeholder-qr.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';

const exerciseIconMap = {
  'lower': treadmillIcon,
  'core': situpIcon,
  'upper': bicepIcon,
  'PS': push,  
  'PL': pull,  
};

const tripleJ_URL = "https://triple-j.onrender.com";

async function nextSchedule() {
  try {
    let accessToken = await getToken("accessToken");

    let response = await fetch(tripleJ_URL + "/api/scheduling/schedule/next", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(tripleJ_URL + "/api/scheduling/schedule/next", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
    
    const data = await response.json();
    console.log("Next session data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching next schedule:", error);
    throw error;
  }
}

const HomeScreen = () => {
  // Network state
  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);

      if (state.isConnected === false) {
        router.push('/');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  // State for UI data
  const [currentFormattedDate, setCurrentFormattedDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [nextSession, setNextSession] = useState(null);
  const [trainerId, settrainerId] = useState("");
  const [nextSessionLoading, setNextSessionLoading] = useState(false);
  const [nextSessionError, setNextSessionError] = useState(null);

  // Announcement State
  const [announcement, setAnnouncement] = useState(null);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementModal, setannouncementModal] = useState(false);
  const [announcementAll, setAnnouncementAll] = useState([]);
  
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

  const fetchNextSession = async () => {
    try {
      setNextSessionLoading(true);
      setNextSessionError(null);
      const session = await nextSchedule();
      setNextSession(session);
      const trainerGet = await getToken("gymTrainerId");
      settrainerId(trainerGet);
    } catch (error) {
      setNextSessionError(error.message || 'Failed to load next session');
    } finally {
      setNextSessionLoading(false);
    }
  };

  const updateDisplayedDate = useCallback(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, options);
    setCurrentFormattedDate(formattedDate);
  }, []);

  useEffect(() => {
    async function getLatestAnn() {
      const response = await fetchAllAnnouncements();
      setAnnouncementAll(response);
    }
    getLatestAnn();
  }, []);

  useEffect(() => {
    const loadAnnouncement = async () => {
      setAnnouncementLoading(true);
      try {
        let announcementData = await fetchLatestAnnouncement();
        setAnnouncement(announcementData); 
      } catch (error) {
        console.error("Failed to load announcement:", error);
        setAnnouncement(null); 
      } finally {
        setAnnouncementLoading(false);
      }
    };
    loadAnnouncement();
  }, []);

  const loadProgramData = useCallback(async () => {
    setProgramLoading(true);
    setProgramError(false);
    setErrorMessage('');
    setCoachInfo(null);

    try {
      const programPayload = await fetchCurrentProgram(exerciseIconMap);
      
      if (programPayload && Array.isArray(programPayload.exercises)) {
        setExercises(programPayload.exercises);
        setCoachInfo(programPayload.coach); 

        if (programPayload.exercises.length === 0) {
          const today = new Date();
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayName = dayNames[today.getDay()];
          setErrorMessage(`No exercises scheduled for ${currentDayName}.`);
        }
      } 
      else if (programPayload && Array.isArray(programPayload)) {
        setExercises(programPayload);
        setCoachInfo(null);

        if (programPayload.length === 0) {
          const today = new Date();
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayName = dayNames[today.getDay()];
          setErrorMessage(`No exercises scheduled for ${currentDayName}.`);
        }
      }
      else {
        setExercises([]);
        setErrorMessage('Workout data is not in the expected format or none found for today.');
      }

    } catch (error) {
      console.error("Error in loadProgramData:", error);
      if (error.message.includes("log in again")) {
      }
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
      console.error("Failed to load gym population:", error);
      setGymPopCount({ Number: 0 });
    }
  }, []); 

  const loadQrData = useCallback(async () => {
    try {
      const data = await fetchQrCode();
      setQrData(data);
    } catch (error) {
      console.error("Failed to load QR code:", error);
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
      await loadProgramData();
      await loadGymPopulation();
      await loadQrData();
      await fetchNextSession();
    };

    if (fontsLoaded) {
      updateDisplayedDate();
      fetchInitialData();
    } else if (fontError) {
      console.error("Font loading error:", fontError);
    }
  }, [fontsLoaded, fontError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    updateDisplayedDate();
    await Promise.all([
      loadProgramData(),
      loadGymPopulation(),
      loadQrData(),
      fetchNextSession(),
      fetchLatestAnnouncement().then(data => setAnnouncement(data))
    ]);
    setRefreshing(false);
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
    <View style={{flex:1}}>
      <View style={[{backgroundColor:"rgba(35, 31, 31, 0.54)"},{width: "100%"}, {height: "16%"}, {justifyContent: "center"}, {alignItems:"center"},
              {paddingTop:30}]}>
              <Text style={[{fontSize: 40},{color: colors.redAccent},{fontFamily: 'KeaniaOne'}]}>
                Triple J
              </Text>
            </View>
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
          ) : announcement ? (
            <TouchableOpacity onPress={() => setannouncementModal(true)}>
              <View style={styles.announcementCard}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementContent}>{announcement.content}</Text>
              </View>
            </TouchableOpacity>
          ) : (
              <View style={styles.announcementCard}>
                  <Text style={styles.announcementContent}>No announcements at the moment.</Text>
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
                source={qrData && qrData.image ? { uri: qrData.image} : placeholderQrIcon}
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

          {/* Trainer/Profile Section with Next Session */}
          <View style={styles.profileContainer}>
            <View>
            <Image 
              source={coachInfo && coachInfo.profile_image_url ? { uri: `https://triple-j.onrender.com${coachInfo.profile_image_url}` } : kotsIcon} 
              style={styles.profileImage}
              onError={() => console.log("Failed to load coach image.")}
            />

            <Text style={styles.textTrainerInfo}>{coachInfo?.name || trainerId}</Text>
            <Text style={styles.details}>{coachInfo?.title || 'Fitness Coach'}</Text>
            </View>
            <View style={styles.profileTextContainer}>
              
              {/* Next Session Display */}
              {nextSessionLoading ? (
                <ActivityIndicator size="small" color="#4CAF50" style={{marginVertical: 10}} />
              ) : nextSessionError ? (
                <View style={{marginVertical: 10, alignItems: 'center'}}>
                  <Text style={[styles.details, {color: 'red', marginBottom: 5}]}>
                    Failed to load session info
                  </Text>
                  <TouchableOpacity 
                    style={[styles.button, {paddingHorizontal: 15, paddingVertical: 5}]}
                    onPress={fetchNextSession}
                  >
                    <Text style={styles.buttonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : nextSession ? (
                <View style={{marginVertical: 10, alignItems: 'center'}}>
                  <Text style={[styles.details, {fontWeight: 'bold'}]}>Next Session:</Text>
                  <Text style={styles.details}>
                    {new Date(nextSession.datetime).toLocaleDateString()} at {new Date(nextSession.datetime).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.details}>{nextSession.type || 'Training Session'}</Text>
                </View>
              ) : (
                <Text style={[styles.details, {marginVertical: 10}]}>No upcoming sessions</Text>
              )}

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
                      source={{ uri:qrData.image }}
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

          <Modal visible={announcementModal} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              {/* Close Button at Upper Right */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setannouncementModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              <View>
                <Text style={styles.announcementHeader}>
                  Announcements
                </Text>
              </View> 
              <View style={styles.modalContainer}>
                {/* Announcements Scroll List */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                  {announcementAll && announcementAll.length > 0 ? (
                    announcementAll.map((announcement, index) => {
                      // Format date and time
                      const dateObj = new Date(announcement.updated_at);
                      const formattedDate = dateObj.toISOString().split('T')[0];

                      let hours = dateObj.getHours();
                      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      hours = hours % 12 || 12;

                      const formattedTime = `${hours}:${minutes} ${ampm}`;

                      return (
                        <View key={index} style={styles.announcementCard}>
                          <Text style={styles.announcementTitle}>{announcement.title}</Text>

                          <Text style={styles.announcementDate}>
                            {formattedDate} | {formattedTime}
                          </Text>
                          
                          <View style={styles.announcementDivider} />
                          
                          <Text style={styles.announcementContent}>{announcement.content}</Text>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.noAnnouncements}>
                      <Text style={styles.noAnnouncementsText}>No announcements available.</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </View>
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
    backgroundColor: '#3D3D3D', 
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    minHeight: 60,
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
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
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
    color: 'white',
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
    backgroundColor: '#3D3D3D',
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
    backgroundColor: '#555', 
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
    backgroundColor: 'red',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '1E1E1E',
    borderRadius: 12,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#eee',
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#333',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  announcementDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  noAnnouncements: {
    alignItems: 'center',
    marginTop: 20,
  },
  noAnnouncementsText: {
    fontSize: 14,
    color: 'white',
  },
  announcementHeader: {
    fontSize: 35,
    fontFamily: 'KeaniaOne',
    color: colors.redAccent
  },

  textTrainerInfo: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'KeaniaOne',
    textAlign: 'center',
    marginTop: 5,
  }

});

export default HomeScreen;