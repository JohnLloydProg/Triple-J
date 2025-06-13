import { StyleSheet, Image, View, Alert, Text, TextInput, TouchableOpacity, Linking, ScrollView} from 'react-native';
import { useState } from 'react';
import { useEffect } from 'react';
import { router, Link } from 'expo-router';

import colors from '../constants/globalStyles';
import {refreshAccessToken} from '@/components/refreshToken';
import { getToken,saveToken } from '@/components/storageComponent';
import { validateLoginInfo, getMemberInfo, checkIfTrainer } from '@/components/generalFetchFunction';
import NetInfo from '@react-native-community/netinfo';

import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';



export default function OfflineScreen() {

  //function to check if the user is online or offline
  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Network state changed:", state);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);

      if (state.isConnected === false) {

        console.log("Device is offline!");

      } else if (state.isConnected === true) {
        router.push('/');
        console.log("Device is back online!");

      }
    });

    return () => {
      unsubscribe();
      console.log("NetInfo listener unsubscribed.");
    };
  }, []);

  const getStatusText = () => {
    if (isConnected === null) {
      return "Checking connectivity...";
    } else if (isConnected) {
      //return `Online (${connectionType})`;
      return "Online";
    } else {
      return "Offline";
    }
  };

  const getStatusColor = () => {
    if (isConnected === null) {
      return 'gray';
    } else if (isConnected) {
      return 'green';
    } else {
      return 'red';
    }
  };

  const [offlineData, setOfflineData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const data = await getToken("offlineData");
        let parsedData = {};
        if (data) {
          try {
            parsedData = JSON.parse(data);
          } catch (parseError) {
            parsedData = typeof data === 'object' && data !== null ? data : {};
          }
        }
        setOfflineData(parsedData);
        console.log("Offline Data (fetched and set):", parsedData);
      } catch (error) {
        console.error("Error fetching offline data:", error);
        Alert.alert("Error", "Could not load offline workout data.");
        setOfflineData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfflineData();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.outerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.titleText}>Loading offline data...</Text>
      </View>
    );
  }

  const hasData = typeof offlineData === 'object' && offlineData !== null && Object.keys(offlineData).length > 0;

  //constants for icons associated with workout types
  const workoutTypes = {
    'U': upper, 
    'L': lower, 
    'C': core,  
    'PS': push,  
    'PL': pull,    
    'N/A': 'Rest Day'
  };

  // Define the desired order of days
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Get keys of offlineData and then sort them
  const sortedDays = Object.keys(offlineData).sort((a, b) => {
    const indexA = dayOrder.indexOf(a);
    const indexB = dayOrder.indexOf(b);

    // Handle days not in your predefined order (place them at the end, or handle as needed)
    if (indexA === -1 && indexB === -1) return 0; // Both not found, keep relative order
    if (indexA === -1) return 1; // a not found, b found, so b comes before a
    if (indexB === -1) return -1; // b not found, a found, so a comes before b

    return indexA - indexB; // Sort based on their index in dayOrder
  });

  return (
    <View style={styles.outerContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>
          Programs
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {hasData ? (
          // Use the sortedDays array here
          sortedDays.map(day => (
            <View key={day} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day}</Text>
              {Array.isArray(offlineData[day]) && offlineData[day].map(item => (
                <View key={item.id} style={styles.workoutItem}>
                  <View>
                    
                       <Image source={workoutTypes[item.workout.type] || 'Unknown'} style={{width: 40, height: 40, marginRight: 20}} />
                    
                  </View>
                  <View>
                    <Text style={styles.workoutName}>{item.workout.name}</Text>
                    <View style={styles.detailsContainer}>
                      {item.details.sets && <Text style={styles.detailText}>Sets: {item.details.sets}</Text>}
                      {item.details.reps && <Text style={styles.detailText}>Reps: {item.details.reps}</Text>}
                      {item.workout.weight && item.details.weight && <Text style={styles.detailText}>Weight: {item.details.weight}</Text>}
                      {item.workout.time && item.details.time && <Text style={styles.detailText}>Time: {item.details.time}</Text>}
                      {item.workout.distance && item.details.distance && <Text style={styles.detailText}>Distance: {item.details.distance}</Text>}
                    </View>
                  </View>
                  
                </View>
              ))}
              {!Array.isArray(offlineData[day]) && (
                <Text style={styles.errorText}>Error: Workout data for {day} is malformed.</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No offline workout data available.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
    padding: 30,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  titleText: {
    color: colors.redAccent,
    fontSize: 30,
    fontFamily: 'KeaniaOne',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  dayContainer: {
    marginBottom: 25,
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dayTitle: {
    fontFamily: 'KeaniaOne',
    fontSize: 22,
    marginBottom: 15,
    color: colors.redAccent,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingBottom: 10,
  },
  workoutItem: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    
  
  },
  workoutName: {
    fontFamily: 'KeaniaOne',
    fontSize: 18,
    marginBottom: 5,
    color: '#eee',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  detailText: {
    fontFamily: 'KeaniaOne',
    fontSize: 16,
    color: '#bbb',
    marginRight: 15,
    marginBottom: 5,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  noDataText: {
    color: 'white',
    fontSize: 18,
    fontStyle: 'italic',
  },
  errorText: {
    color: 'orange',
    fontSize: 14,
    marginTop: 10,
  }
});