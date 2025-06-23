import { Image, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, Modal, Linking, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { fetchCurrentProgram, fetchGymPopulation, fetchQrCode, generateNewQrCode, fetchLatestAnnouncement } from '../../components/generalFetchFunction';

import heartIcon from '@/assets/images/Cardio-Workout-icon.png';
import treadmillIcon from '@/assets/images/Lower-Workout-icon.png';
import situpIcon from '@/assets/images/Core-Workout-icon.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import kotsIcon from '@/assets/images/Coach-icon.png';

const exerciseIconMap = {
  'cardio': heartIcon,
  'lower': treadmillIcon,
  'core': situpIcon,
  'upper': bicepIcon,
};

// --- HELPER FUNCTION TO FIND THE NEXT UPCOMING SESSION ---
const findNextUpcomingSession = (scheduleSlots) => {
  if (!scheduleSlots || scheduleSlots.length === 0) {
    return null;
  }

  const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
  const now = new Date();
  let upcomingSessions = [];

  scheduleSlots.forEach(slot => {
    const targetDay = dayMap[slot.day];
    if (targetDay === undefined) return;

    // Parse the start time (e.g., "7:00 AM")
    const timeParts = slot.start.match(/(\d+):(\d+)\s+(AM|PM)/);
    if (!timeParts) return;

    let [ , hour, minute, ampm] = timeParts;
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);

    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    }
    if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }

    // Calculate the date of the next occurrence of this day and time
    const nextSessionDate = new Date(now);
    nextSessionDate.setDate(now.getDate() + (targetDay - now.getDay() + 7) % 7);
    nextSessionDate.setHours(hour, minute, 0, 0);

    // If the calculated session is in the past (e.g., it's 3 PM on Monday for a 10 AM Monday session),
    // then the *real* next session is next week.
    if (nextSessionDate < now) {
      nextSessionDate.setDate(nextSessionDate.getDate() + 7);
    }
    
    upcomingSessions.push({ date: nextSessionDate, originalSlot: slot });
  });

  if (upcomingSessions.length === 0) {
    return null;
  }

  // Sort sessions to find the one that is soonest
  upcomingSessions.sort((a, b) => a.date - b.date);

  return upcomingSessions[0].originalSlot;
};


// --- COMPONENT TO DISPLAY THE SCHEDULE ---
const ScheduleDisplay = ({ scheduleData }) => {
  let parsedSchedule = [];
  try {
    if (scheduleData && typeof scheduleData === 'string') {
      const data = JSON.parse(scheduleData);
      if (Array.isArray(data)) parsedSchedule = data;
    }
  } catch (error) {
    console.error("Failed to parse schedule JSON:", error);
  }

  const nextSession = findNextUpcomingSession(parsedSchedule);

  return (
    <View style={styles.scheduleContainer}>
      <Text style={styles.scheduleTitle}>Next Session:</Text>
      <Text style={styles.scheduleText}>
        {nextSession ? `${nextSession.day} at ${nextSession.start}` : 'Not scheduled'}
      </Text>
    </View>
  );
};


const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  const [currentFormattedDate, setCurrentFormattedDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [coachInfo, setCoachInfo] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [programError, setProgramError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gymPopCount, setGymPopCount] = useState({ Number: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Unchanged useEffects and functions
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected === false) router.push('/');
    });
    return () => unsubscribe();
  }, []);

  const updateDisplayedDate = useCallback(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentFormattedDate(today.toLocaleDateString(undefined, options));
  }, []);

  const loadAllData = useCallback(async () => {
    setProgramLoading(true);
    setAnnouncementLoading(true);
    try {
      await Promise.all([
        (async () => {
            const announcementData = await fetchLatestAnnouncement();
            if (announcementData && announcementData.title) setAnnouncement(announcementData);
            else setAnnouncement(null);
        })(),
        (async () => {
            const programPayload = await fetchCurrentProgram(exerciseIconMap);
            if (programPayload) {
                setExercises(programPayload.exercises || []);
                setCoachInfo(programPayload.coach || null);
                setSchedule(programPayload.schedule || null);
                if (!programPayload.exercises || programPayload.exercises.length === 0) {
                    const today = new Date();
                    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    setErrorMessage(`No exercises scheduled for ${dayNames[today.getDay()]}.`);
                } else {
                    setErrorMessage('');
                }
            } else {
                setExercises([]);
                setErrorMessage('No workout found for today.');
            }
        })(),
        (async () => {
            const popData = await fetchGymPopulation();
            setGymPopCount(popData || { Number: 0 });
            setLastUpdated(new Date());
        })(),
        (async () => {
            const qrCodeData = await fetchQrCode();
            setQrData(qrCodeData);
        })(),
      ]);
    } catch (error) {
        console.error("HomeScreen: Failed to load data:", error);
        setProgramError(true);
        setErrorMessage(error.message || "Could not load data. Pull to refresh.");
    } finally {
        setProgramLoading(false);
        setAnnouncementLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      updateDisplayedDate();
      loadAllData();
    }
  }, [fontsLoaded]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    updateDisplayedDate();
    loadAllData().finally(() => setRefreshing(false));
  }, []);

  const toggleExercise = (index) => {
    const updatedExercises = exercises.map((ex, i) => i === index ? { ...ex, completed: !ex.completed } : ex);
    setExercises(updatedExercises);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Loading...';
    const diffSeconds = Math.floor((new Date() - lastUpdated) / 1000);
    if (diffSeconds < 5) return 'Updated just now';
    if (diffSeconds < 60) return `Updated ${diffSeconds}s ago`;
    return `Updated ${Math.floor(diffSeconds / 60)}m ago`;
  };

  if (!fontsLoaded) {
    return <SafeAreaView style={styles.safeContainer}><ActivityIndicator size="large" color="#4CAF50" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} tintColor="#4CAF50" />}>
        {announcementLoading ? (
            <View style={[styles.announcementCard, {paddingVertical: 30, alignItems: 'center'}]}><ActivityIndicator color="#FFFFFF" /></View>
        ) : announcement ? (
            <View style={styles.announcementCard}><Text style={styles.announcementTitle}>{announcement.title}</Text><Text style={styles.announcementContent}>{announcement.content}</Text></View>
        ) : (
            <View style={styles.announcementCard}><Text style={styles.announcementContent}>No announcements at the moment.</Text></View>
        )}

        <View style={styles.card}>
          <Text style={styles.heading}>{currentFormattedDate}</Text>
          {programLoading ? (
            <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4CAF50" /><Text style={styles.loadingText}>Loading workout...</Text></View>
          ) : programError ? (
            <View style={styles.noExercisesContainer}><Text style={[styles.noExercisesText, {color: 'red'}]}>{errorMessage}</Text></View>
          ) : exercises.length > 0 ? (
            exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseItem}><Image source={exercise.icon} style={styles.exerciseIcon} resizeMode="contain"/><View style={styles.exerciseTextContainer}><Text style={styles.text}>{exercise.name}</Text><Text style={styles.details}>{exercise.details}</Text></View><CheckBox checked={!!exercise.completed} onPress={() => toggleExercise(index)} checkedColor="green" uncheckedColor="red" containerStyle={styles.checkbox}/></View>
            ))
          ) : (
            <View style={styles.noExercisesContainer}><Text style={styles.noExercisesText}>{errorMessage || "No exercises scheduled."}</Text><Text style={styles.restDayText}>Enjoy your rest day!</Text></View>
          )}
        </View>

        <View style={styles.membersCard}><Text style={styles.bigText}>{gymPopCount?.Number ?? '...'}</Text><Text style={styles.details}>Gym members currently making gains</Text><Text style={styles.updateTimeText}>{formatLastUpdated()}</Text></View>

        <View style={styles.qrContainer}>
          <TouchableOpacity onPress={() => { if (qrData?.image) setQrModalVisible(true); else Alert.alert("QR Code", "QR Code not available.")}}>
            {qrData?.image ? (<Image source={{ uri: qrData.image }} style={styles.qrBox} />) : (<View style={[styles.qrBox, { backgroundColor: '#777', justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: '#ccc', fontFamily: 'KeaniaOne' }}>No QR</Text></View>)}
          </TouchableOpacity>
          <View style={styles.qrDetails}><Text style={styles.text}>Days left:</Text><Text style={styles.expiry}>{qrData?.days_remaining ?? '...'}</Text><TouchableOpacity style={styles.button} onPress={() => Alert.alert("Generate New QR", "Are you sure?", [{ text: "Cancel" }, { text: "Yes", onPress: async () => { try { await generateNewQrCode(); await loadAllData(); Alert.alert("Success", "New QR Code Generated!"); } catch (e) { Alert.alert("Error", "Could not generate QR code."); } } }])}><Text style={styles.buttonText}>New QR</Text></TouchableOpacity></View>
        </View>

        {/* --- COACH CARD UPDATED TO INCLUDE SCHEDULE --- */}
        <View style={styles.profileContainer}>
          <Image source={coachInfo?.profile_image_url ? { uri: `https://triple-j.onrender.com${coachInfo.profile_image_url}` } : kotsIcon} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.text}>{coachInfo?.name || 'Your Coach'}</Text>
            <Text style={styles.details}>{coachInfo?.title || 'Fitness Coach'}</Text>
            
            {/* The schedule is now displayed here */}
            <ScheduleDisplay scheduleData={schedule} />
            
            <TouchableOpacity style={[styles.button, !coachInfo?.contact_url && {backgroundColor: '#555'}]} disabled={!coachInfo?.contact_url} onPress={() => { if (coachInfo?.contact_url) Linking.openURL(coachInfo.contact_url)}}>
              <Text style={styles.buttonText}>Contact Me</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={qrModalVisible} transparent={true} animationType="fade" onRequestClose={() => setQrModalVisible(false)}>
            <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPressOut={() => setQrModalVisible(false)}>
              <View style={styles.modalContent}>
                {qrData?.image ? (<Image source={{ uri:qrData.image }} style={{ width: 280, height: 280, resizeMode: 'contain' }}/>) : (<Text style={styles.text}>QR not available.</Text>)}
                <TouchableOpacity onPress={() => setQrModalVisible(false)} style={[styles.button, {marginTop: 20, backgroundColor: '#FF4D4D'}]}><Text style={styles.buttonText}>Close</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#1E1E1E' },
  container: { flex: 1, backgroundColor: '#1E1E1E', paddingHorizontal: 10, paddingBottom: 20 },
  announcementCard: { backgroundColor: '#3D3D3D', borderRadius: 10, padding: 15, marginBottom: 15, justifyContent: 'center', minHeight: 60 },
  announcementTitle: { color: 'white', fontSize: 18, fontFamily: 'KeaniaOne', textAlign: 'center', marginBottom: 5 },
  announcementContent: { color: '#E0E0E0', fontSize: 14, fontFamily: 'KeaniaOne', textAlign: 'center' },
  card: { backgroundColor: '#2D2D2D', borderRadius: 10, padding: 15, marginBottom: 15 },
  heading: { color: 'white', fontSize: 22, fontFamily: 'KeaniaOne', textAlign: 'center', marginBottom: 10 },
  text: { color: 'white', fontSize: 20, fontFamily: 'KeaniaOne', textAlign: 'center' },
  details: { color: 'gray', fontSize: 14, fontFamily: 'KeaniaOne', textAlign: 'center', marginTop: 4, marginBottom: 8 },
  bigText: { color: 'white', fontSize: 32, fontFamily: 'KeaniaOne', textAlign: 'center', marginBottom: 5 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3D3D3D', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 15, marginTop: 10 },
  exerciseIcon: { width: 40, height: 40, marginRight: 15 },
  exerciseTextContainer: { flex: 1 },
  checkbox: { backgroundColor: 'transparent', borderWidth: 0, padding: 0, marginLeft: 10, transform: [{ scale: 1.5 }] },
  membersCard: { backgroundColor: '#3D3D3D', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15 },
  updateTimeText: { color: '#AAAAAA', fontSize: 12, fontFamily: 'KeaniaOne', marginTop: 5 },
  qrContainer: { backgroundColor: '#2D2D2D', borderRadius: 10, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  qrBox: { width: 120, height: 120, backgroundColor: 'white', borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  qrDetails: { flex: 1, alignItems: 'center', marginLeft: 15 },
  expiry: { color: '#FF4D4D', fontSize: 30, fontFamily: 'KeaniaOne', textAlign: 'center', marginVertical: 5 },
  button: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 20, marginTop: 10, minWidth: 150, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 14, fontFamily: 'KeaniaOne', textAlign: 'center' },
  profileContainer: { backgroundColor: '#3D3D3D', borderRadius: 10, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20, },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginRight: 15, backgroundColor: '#555' },
  profileTextContainer: { flex: 1, alignItems: 'center' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 100 },
  loadingText: { color: '#AAAAAA', fontSize: 16, fontFamily: 'KeaniaOne', marginTop: 10 },
  noExercisesContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 100 },
  noExercisesText: { color: 'white', fontSize: 16, fontFamily: 'KeaniaOne', textAlign: 'center' },
  restDayText: { color: '#4CAF50', fontSize: 14, fontFamily: 'KeaniaOne', marginTop: 10 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#2D2D2D', padding: 20, borderRadius: 10, alignItems: 'center', width: '90%', maxWidth: 350 },

  // --- STYLES FOR THE SCHEDULE WITHIN THE COACH CARD ---
  scheduleContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    width: '100%',
  },
  scheduleTitle: {
    color: '#BDBDBD',
    fontSize: 12,
    fontFamily: 'KeaniaOne',
  },
  scheduleText: {
    color: '#4CAF50',
    fontSize: 16,
    fontFamily: 'KeaniaOne',
    marginTop: 2,
  },
});

export default HomeScreen;