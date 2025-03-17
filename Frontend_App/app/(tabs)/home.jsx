import { Image, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, Modal, Linking } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { CheckBox } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Import simple QR code library
import QRCode from 'react-native-qrcode-svg';

import heartIcon from '@/assets/images/Cardio-Workout-icon.png';
import treadmillIcon from '@/assets/images/Lower-Workout-icon.png';
import situpIcon from '@/assets/images/Core-Workout-icon.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import kotsIcon from '@/assets/images/Coach-icon.png';

import {refreshAccessToken} from '../../components/refreshToken';


async function getCurrentProgram() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let response = await fetch("https://triple-j.onrender.com/api/gym/program/current", {
      method: "GET",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    if (response.status === 401) {
      accessToken = await refreshAccessToken();
      response = await fetch("https://triple-j.onrender.com/api/member/program/current", {
        method: "GET",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      });
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching current program:", error);
    return null;
  }
}

async function getGymPopulation() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    const response = await fetch("https://triple-j.onrender.com/api/attendance/logging", {
      method: "GET",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    if (response.status === 401) {
      accessToken = await refreshAccessToken();
      response = await fetch("https://triple-j.onrender.com/api/attendance/logging", {
        method: "GET",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      });
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching gym population:", error);
  }
}

async function getQrCode() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let response = await fetch("https://triple-j.onrender.com/api/attendance/qr-code", {
      method: "GET",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    if (response.status === 401) {
      accessToken = await refreshAccessToken();
      response = await fetch("https://triple-j.onrender.com/api/attendance/qr-code", {
        method: "GET",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      });
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching QR Code:", error);
    return null;
  }
}

async function postQrCode() {
  let accessToken = await SecureStore.getItemAsync("accessToken");
    const response = await fetch("https://triple-j.onrender.com/api/attendance/qr-code", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      credentials : "same-origin"
    })
    if (!response.ok) {
      try {
        refreshAccessToken();
      }catch (err) {
        return "";
      }
    }
    const data = await response.json();
    console.log(data);
    return data;
}




// API configuration
const API_CONFIG = {
  BASE_URL: 'https://triple-j.onrender.com/api',
  ENDPOINTS: {
    USER_PROFILE: '/user/profile',
    MEMBER_COUNT: '/gym/active-members',
    USER_PROGRAM: '/user/workout-program',
    GENERATE_QR: '/user/generate-qr',
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



const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [qrCode, setqrCode] = useState([]);
  const [gymPopCount, setgymPopCount] = useState([]);
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
  const [qr, setQr] = useState('');
 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userId = await SecureStore.getItemAsync("userId");
        let userName = await SecureStore.getItemAsync("userName");
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
    getGymPopulation().then(data => setgymPopCount(data));
    getQrCode().then(data => setQr(data));
    
  }, []);


 
  // Combined refresh function for pull-to-refresh
  const onRefresh = useCallback(() => {
    console.log("refreshing")
    setRefreshing(true);
    getQrCode().then(data => setQr(data));
    getGymPopulation().then(data => setgymPopCount(data));
    setTimeout(() => { 
      setRefreshing(false);
    }, 2000);
  }, []);

  



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
            <Text style={styles.bigText}>{gymPopCount.Number}</Text>
            <Text style={styles.details}>Gym members currently making gains</Text>
            {lastUpdated && (
              <Text style={styles.updateTimeText}>{formatLastUpdated()}</Text>
            )}
            <Text style={styles.pullToRefreshHint}>Pull down to refresh</Text>
          </View>




        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <TouchableOpacity>
            <Image source={{uri: `https://triple-j.onrender.com${qr.image}`}} style={styles.qrBox}/>
          </TouchableOpacity>

          <View style={styles.qrDetails}>
            <Text style={styles.text}>Days until your QR code expires:</Text>
            <Text style={styles.expiry}>{daysRemaining}</Text>
            
            <TouchableOpacity style={styles.button} onPress={() => {
              postQrCode().then(data => alert(data.details));
            }}>
              <Text style={styles.buttonText}>
                {daysRemaining <= 0 ? "Generate New QR" : "Show QR code"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal for Enlarged QR Code */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image source={kotsIcon} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.text}>{'Loading...'}</Text>
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 5,
  },
  summaryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  summaryValue: {
    color: '#4CAF50',
    fontSize: 24,
    fontFamily: 'KeaniaOne',
  },
  summaryLabel: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'KeaniaOne',
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  
});

export default HomeScreen;