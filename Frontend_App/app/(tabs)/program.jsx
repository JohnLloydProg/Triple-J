import {RefreshControl, Image, StyleSheet, Platform, View, Text, TextInput, Button, TouchableOpacity,Modal, ScrollView} from 'react-native';
import colors from '../../constants/globalStyles';
import jordi from '@/assets/images/jordi.png';
import React from 'react';
import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';
import { router, useRouter } from 'expo-router';

import { useFonts } from 'expo-font';
import {Link} from 'expo-router';
import { FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import jwtDecode from "jwt-decode";
import { useEffect, useState } from 'react';

import {refreshAccessToken} from '../../components/refreshToken';
import { color, fonts } from '@rneui/base';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { SelectList } from 'react-native-dropdown-select-list'
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const dataDropdown = [
  { key: '0', value: 'Monday' },
  { key: '1', value: 'Tuesday' },
  { key: '2', value: 'Wednesday' },
  { key: '3', value: 'Thursday' },
  { key: '4', value: 'Friday' },
  { key: '5', value: 'Saturday' },
  { key: '6', value: 'Sundays' },
];


//dummy data for drop list

//constants for processing dates and workout types
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


const workoutTypes = {
  'U': upper, //upper body
  'L': lower, //lower body
  'C': core,  //core
  'PS': push,   //push
  'PL': pull,    //pull
  'N/A': 'Rest Day'
};

const daysOfWeekOrder = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

const workoutConvert = {
  "Bench Press": 1,
  "Push Up": 2,
  "Squats": 3,
  "Plank": 4,
  "Sit Ups": 5
};



//function for getting the localized variables for the access tokens
async function getToken(key) {
  return await SecureStore.getItemAsync(key);
}  

export default function program() {


const [selected, setSelected] = useState("");
const [selectedWorkoutId, setselectedWorkoutId ] = useState("")

const [programData, setProgramData] = useState([]);
const [modalVisible, setModalVisible] = useState(false);
const [modalChoiceVisible, setmodalChoiceVisible] = useState(false);
const [modalRecordVisible, setmodalRecordVisible] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
const [availableWorkouts, setAvailableWorkouts] = useState([]);
const [selectedProgram, setSelectedProgram] = useState([]);
const [selectedWorkoutItem, setselectedWorkoutItem] = useState([]);
const [selectedWorkoutRecord, setselectedWorkoutRecord] = useState([]);

const [currentTimeLineInfo, setcurrentTimeLineInfo] = useState({});

const [reps,setReps] = useState("");
const [sets,setSets] = useState("");
const [time,setTime] = useState("");
const [weight,setWeight] = useState("");
const [distance,setDistance] = useState("");

const resetChoiceValues = () => {
  setReps("");
  setSets("");
  setTime("");
  setWeight("");
  setDistance("");
};

//get current timeline info
async function getCurrentTimeline()  {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);

    const response = await fetch("https://triple-j.onrender.com/api/gym/progress/current", {
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
      
      response = await fetch("https://triple-j.onrender.com/api/gym/progress/current", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
    
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}

//function for fetching available workouts within the app
async function newTestApi()  {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);
    console.log(userId);

    let response = await fetch("https://triple-j.onrender.com/api/gym/workouts", {
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
      
      response = await fetch("https://triple-j.onrender.com/api/gym/workouts", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      setAvailableWorkouts(data);
    } catch (error) {
      console.error("Error:", error);
    }
}

//function to fetch the programs and associated workouts
async function testApi() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}`, {
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      setProgramData(data);
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
}

//function to add blank programs
async function addProgram() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/create`, {
      method: "POST",
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
}


//fucntion to delete a program
async function deleteProgram(programId) {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);
    parseInt(programId);
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/delete/${programId}`, {
      method: "DELETE",
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/delete/${programId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
      // const data = await response.json();
      // console.log(data);
    } catch (error) {
      console.error("Error from delete prog:", error);
    }
}

//update program function 
async function updateProgram(programId,mainDate) {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);
    parseInt(programId);
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/update/${programId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'day':mainDate
      }),
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/update/${programId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          'day':mainDate
        }),
      });
    }
      // const data = await response.json();
      // console.log(data);
    } catch (error) {
      console.error("Error from delete prog:", error);
    }
}

//function to get all workouts associated with a program
async function viewWorkout(programId) {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(programId);
    console.log(programId);
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/workout/${programId}`, {
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/workout/${programId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      // console.log(data);
      // console.log(JSON.stringify(data, null, 2));

      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}

//function to add a workout
async function addWorkout(programId, workoutType, mainDetails) {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(programId);
    parseInt(workoutType);
    console.log(programId);
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/workout/${programId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },body: JSON.stringify({
        'workout': workoutType,
        'details': mainDetails
      
      })
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/workout/${programId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },body: JSON.stringify({
          'workout': workoutType,
          'details': mainDetails
        })
      });
    }

      const data = await response.json();
      console.log(data);
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error:", error);
    }
}

//function to delete a workout
async function deleteWorkout(programId, workoutId) {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(programId);
    parseInt(workoutId);
    console.log("progID: " + programId);
    console.log("workoutID: " + workoutId);
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/workout/${programId}/delete/${workoutId}`, {
      method: "DELETE",
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/workout/${programId}/delete/${workoutId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
        
      });
    }


    } catch (error) {
      console.error("Error:", error);
    }
}

async function getRecord(programWorkout)  {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);
  

    let response = await fetch(`https://triple-j.onrender.com/api/gym/workout-record/${programWorkout}`, {
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/workout-record/${programWorkout}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      console.log( data);
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}

async function setRecord(programWorkout, mainDetails)  {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let userId = await SecureStore.getItemAsync("userId");
    parseInt(userId);
  

    let response = await fetch(`https://triple-j.onrender.com/api/gym/workout-record/${programWorkout}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },body: JSON.stringify({
        'details': mainDetails
      })
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/workout-record/${programWorkout}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },body: JSON.stringify({
          'details': mainDetails
        })
      });
    }

      const data = await response.json();
      console.log( data);
    } catch (error) {
      console.error("Error:", error);
    }
}

//funnction to handle the modal of selected program
const handlePress =  async (item) => {
  setSelectedProgram(item);
  setSelectedItem(await viewWorkout(item.id));
  console.log("Selected item: ", item.id);
  setModalVisible(true);
};

const handlePressChoice =  async (item) => {
  const updatedItem = [...selectedItem];
  setSelectedItem(updatedItem);
  resetChoiceValues();
  setselectedWorkoutItem(item);
  setmodalChoiceVisible(true);
};

const handlePressRecord =  async (item, workoutid) => {
  console.log(workoutid);
  resetChoiceValues();
  setselectedWorkoutId(workoutid);
  setselectedWorkoutRecord(item);
  setmodalRecordVisible(true);
};

useEffect(() => {
  console.log("Updated Selected Program: ", selectedProgram);
}, [selectedProgram]);

  //loads the needed custom font styles
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  //loads the information for programs and workouts during the first loading of the programs page
  useEffect(()=>{
    testApi();
    newTestApi();
    getCurrentTimeline().then(data => {
      console.log(data);
      setcurrentTimeLineInfo(data);
    });
  },[]);

// refreshed modal after calling the updateProgram function
  useEffect(() => {
    if (selectedProgram) {
      const updatedItem = programData.find(item => item.id === selectedProgram.id);
      if (updatedItem) {
        setSelectedProgram(updatedItem);
      }
    }
    
  }, [programData]);
  
  
  
  //sorts the programs from monday-sunday
  const sortedProgramData = [...programData].sort((a, b) => {
    const dayA = daysOfWeekOrder[daysOfWeek[a.day]] ?? 0; 
    const dayB = daysOfWeekOrder[daysOfWeek[b.day]] ?? 0;
    return dayA - dayB;
  });


  //program and workout component for rendering the flatlist that would display the programs and workouts
const WorkoutItem = ({ title, workouts, programId }) => (
  <View style={styles.mainProgramsCont}>
    
    <View style={styles.programCont}>
      <Text style={styles.programText}>{title}</Text>
      <TouchableOpacity style={styles.deleteProg} onPress={ async ()=>{
        await deleteProgram(programId);
        await testApi();
        console.log(programData);
        console.log()
        
        }}>
        <View>
        <FontAwesome6 name="trash" size={20} color="red" />
        </View>
      </TouchableOpacity>
    </View>

    <View>
      {workouts.length > 0 ? workouts.map((workout, index) => (
        <View style={styles.indivProgCont} key={`${title}-${index}`}>
          <Image source={workoutTypes[workout.type] || 'Unknown'} style={{width: 40, height: 40, marginRight:10}} />
          <View>
            <Text style={styles.workoutName}>{workout.name}</Text>
          </View>
        </View>
      )) : (
        <Text style={styles.noWorkout}>No workouts today</Text>
      )}
    </View>

  </View>
);

const getWorkoutDetails = (workoutName) => {
  const workout = availableWorkouts.find(item => item.name === workoutName);
  if (!workout) {
    return "Workout not found";
  }
  const { sets, reps, time, distance, weight } = workout;
  return { sets, reps, time, distance, weight };
};


const processData = (data) => {
  // Ensure data is an array and not null/undefined
  if (!data || !Array.isArray(data) || data.length === 0) {
    // Return empty data structure if no valid data
    return {
      labels: [],
      datasets: [],
    };
  }

  // Safely extract data with proper type checking
  const labels = data.map((item) => item.date || '');
  
  // Create datasets for all possible metrics
  const datasets = [];
  
  // Check if any workout has sets data
  const hasSetsData = data.some(item => 
    item.details?.sets !== undefined && 
    item.details?.sets !== null && 
    !isNaN(parseInt(item.details.sets, 10))
  );
  
  if (hasSetsData) {
    const setsData = data.map((item) => {
      const sets = item.details?.sets;
      return sets && !isNaN(parseInt(sets, 10)) ? parseInt(sets, 10) : null;
    });
    
    // Only add dataset if we have actual values (not all null)
    if (setsData.some(value => value !== null)) {
      datasets.push({
        data: setsData.map(value => value === null ? 0 : value),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red for sets
        strokeWidth: 2,
        legendLabel: 'Sets'
      });
    }
  }
  
  // Check if any workout has reps data
  const hasRepsData = data.some(item => 
    item.details?.reps !== undefined && 
    item.details?.reps !== null && 
    !isNaN(parseInt(item.details.reps, 10))
  );
  
  if (hasRepsData) {
    const repsData = data.map((item) => {
      const reps = item.details?.reps;
      return reps && !isNaN(parseInt(reps, 10)) ? parseInt(reps, 10) : null;
    });
    
    // Only add dataset if we have actual values (not all null)
    if (repsData.some(value => value !== null)) {
      datasets.push({
        data: repsData.map(value => value === null ? 0 : value),
        color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Green for reps
        strokeWidth: 2,
        legendLabel: 'Reps'
      });
    }
  }
  
  // Check if any workout has time data
  const hasTimeData = data.some(item => 
    item.details?.time !== undefined && 
    item.details?.time !== null && 
    !isNaN(parseInt(item.details.time, 10))
  );
  
  if (hasTimeData) {
    const timeData = data.map((item) => {
      const time = item.details?.time;
      return time && !isNaN(parseInt(time, 10)) ? parseInt(time, 10) : null;
    });
    
    // Only add dataset if we have actual values (not all null)
    if (timeData.some(value => value !== null)) {
      datasets.push({
        data: timeData.map(value => value === null ? 0 : value),
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue for time
        strokeWidth: 2,
        legendLabel: 'Time'
      });
    }
  }
  
  // Check if any workout has weight data
  const hasWeightData = data.some(item => 
    item.details?.weight !== undefined && 
    item.details?.weight !== null && 
    !isNaN(parseFloat(item.details.weight))
  );
  
  if (hasWeightData) {
    const weightData = data.map((item) => {
      const weight = item.details?.weight;
      return weight && !isNaN(parseFloat(weight)) ? parseFloat(weight) : null;
    });
    
    // Only add dataset if we have actual values (not all null)
    if (weightData.some(value => value !== null)) {
      datasets.push({
        data: weightData.map(value => value === null ? 0 : value),
        color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`, // Purple for weight
        strokeWidth: 2,
        legendLabel: 'Weight'
      });
    }
  }
  
  // Check if any workout has distance data
  const hasDistanceData = data.some(item => 
    item.details?.distance !== undefined && 
    item.details?.distance !== null && 
    !isNaN(parseFloat(item.details.distance))
  );
  
  if (hasDistanceData) {
    const distanceData = data.map((item) => {
      const distance = item.details?.distance;
      return distance && !isNaN(parseFloat(distance)) ? parseFloat(distance) : null;
    });
    
    // Only add dataset if we have actual values (not all null)
    if (distanceData.some(value => value !== null)) {
      datasets.push({
        data: distanceData.map(value => value === null ? 0 : value),
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange for distance
        strokeWidth: 2,
        legendLabel: 'Distance'
      });
    }
  }

  return {
    labels,
    datasets,
    legend: datasets.map(dataset => dataset.legendLabel)
  };
};


const WorkoutModalItem = ({workout}) => {

  const [recordData, setRecordData] = useState(null);
  // Start with all metrics enabled, but they'll only show if data exists
  const [selectedMetrics, setSelectedMetrics] = useState(['sets', 'reps', 'time', 'weight', 'distance']);

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: true, // Use dataset colors
    decimalPlaces: 1, // Allow one decimal place for weight/distance
    formatYLabel: (value) => value.toString(),
    formatXLabel: (value) => value.toString(),
    propsForDots: {
      r: "5", // Dot radius
    }, 
    propsForLabels: {
      xLabelsOffset: 15, 
      fontSize: 10,
    },
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        console.log("Fetching record for workout:", workout.id);
        const data = await getRecord(workout.id);
        // Ensure data is valid before setting state
        if (data && Array.isArray(data)) {
          setRecordData(data);
        } else {
          console.error("Invalid record data received:", data);
          setRecordData([]);
        }
      } catch (error) {
        console.error("Error fetching workout record:", error);
        setRecordData([]);
      }
    };

    fetchRecord(); 
  }, []);

  // Process data safely
  const chartData = processData(recordData);
  
  // Toggle specific metrics on/off
  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };
  
  // Filter datasets based on selected metrics
  const filterDatasets = (data) => {
    if (!data || !data.datasets) return { labels: [], datasets: [] };
    
    const metricToLabelMap = {
      'sets': 'Sets',
      'reps': 'Reps',
      'time': 'Time',
      'weight': 'Weight',
      'distance': 'Distance'
    };
    
    const filteredDatasets = data.datasets.filter(dataset => 
      selectedMetrics.some(metric => dataset.legendLabel === metricToLabelMap[metric])
    );
    
    return {
      ...data,
      datasets: filteredDatasets
    };
  };

  return (
    <View style={styles.mainModalCont}>

    <View style={styles.indivWorkoutModalCont}>
      <Image source={workoutTypes[workout.workout.type] || 'Unknown'} style={{width: 40, height: 40, marginRight:10}} />
      <View>
        <View>
        <Text style={styles.workoutNameModal}>{workout.workout.name}</Text>
        </View>
        <View style={{flexDirection: "row"}}>
        {workout.details.reps && (
          <Text style={styles.workoutdetailsModal}>Reps: {workout.details.reps} </Text>
        )}
        {workout.details.sets && (
          <Text style={styles.workoutdetailsModal}>Sets: {workout.details.sets} </Text>
        )}
        {workout.details.time && (
          <Text style={styles.workoutdetailsModal}>Time: {workout.details.time} </Text>
        )}
        {workout.details.weight && (
          <Text style={styles.workoutdetailsModal}>Weight: {workout.details.weight} </Text>
        )}
        {workout.details.distance && (
          <Text style={styles.workoutdetailsModal}>Distance: {workout.details.distance} </Text>
        )}
        </View>
        
      </View>
      <TouchableOpacity style={styles.deleteProgramBtn} onPress={ async ()=>{
        console.log("selected workout for deletion:" +workout.workout.name + "id: " + workout.id);
        await deleteWorkout(selectedProgram.id,workout.id);
        const updatedItem = await viewWorkout(selectedProgram.id);
        setSelectedItem(updatedItem);
        testApi();
        }}>
          
        <FontAwesome6 name="minus" size={20} color="black" />
      </TouchableOpacity>

      {/* <TouchableOpacity style={[{backgroundColor: 'blue'}, {position:'absolute'},{right: 80}]} onPress={async ()=>{
          console.log("workout id: " + workout.id);
          setTimeout(async () => {
            await getRecord(workout.id);
          }, 0);
        }}>
        <FontAwesome6 name="chart-simple" size={20} color="black" />
      </TouchableOpacity> */}

    </View>

    <View style={styles.workoutAnalyticsCont}>
        <View style={[{flex: 1}, {alignItems:'center'}, {position:'relative'}, {left:-13}]}>
          {recordData && recordData.length > 0 && chartData.datasets && chartData.datasets.length > 0 ? (
            <LineChart
              data={filterDatasets(chartData)}
              width={380}
              height={310}
              verticalLabelRotation={45}
              chartConfig={chartConfig}
              withDots={true}
              withInnerLines={true}
              withOuterLines={true}
              withShadow={false}
              fromZero={true}
              legend={chartData.legend}
            />
          ) : (
            <View style={{justifyContent:'center'}}>
              <Text style={{ marginTop: 20, color: 'white',fontFamily: 'KeaniaOne'}}>No workout data available</Text>
            </View>
          )}
                    
            
          </View>

      
      
      <TouchableOpacity style={styles.addRecordBtn} onPress={() => {
        // console.log(availableWorkouts);
        // console.log(workout.workout.name);
        // console.log(workout.id);
        console.log(getWorkoutDetails(workout.workout.name));
        handlePressRecord(getWorkoutDetails(workout.workout.name),workout.id);
      }}> 
        <Text style={styles.addRecordText} >Add Record</Text>
      </TouchableOpacity>
      
    </View>


    </View>
  )
};

const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);

    testApi();
    newTestApi();
    getCurrentTimeline().then(data => {
      console.log(data);
      setcurrentTimeLineInfo(data);
    });
  }, []);
  

  return(
    <View style={{flex: 1}}>
    <ScrollView  refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    } style={styles.container}>



      <TouchableOpacity onPress={()=>{router.push('/timeline')}}>

        <View style={styles.progressContainer}>
          <View style={{marginRight: 15}}>
            <Image source={{uri : `https://triple-j.onrender.com${currentTimeLineInfo.img}`}} style={styles.profileImage} />
          </View>

          <View>
            <Text style={styles.progressText}>
              Date: {currentTimeLineInfo.date}
            </Text>
            <Text style={styles.progressText}>
            BMI: {Math.round(currentTimeLineInfo.weight / ((currentTimeLineInfo.height) ** 2))} 
                {" "}
                ({(() => {
                  const bmi = Math.round(currentTimeLineInfo.weight / ((currentTimeLineInfo.height) ** 2));
                  
                  if (bmi < 18.5) {
                    return "Underweight";
                  } else if (bmi >= 18.5 && bmi < 24.9) {
                    return "Normal weight";
                  } else if (bmi >= 25 && bmi < 29.9) {
                    return "Overweight";
                  } else {
                    return "Obese";
                  }
                })()})
            </Text>
            <Text style={styles.progressText}>
              Weight: {currentTimeLineInfo.weight + "kg"}
            </Text>
            <Text style={styles.progressText} >
              Height: {currentTimeLineInfo.height + "m"}
            </Text>
          </View>
        </View>

      </TouchableOpacity>
      
      
      <FlatList
      style={{marginBottom:25}}
      data={sortedProgramData}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} >
          <WorkoutItem title={daysOfWeek[item.day]} workouts={item.workouts} programId={item.id}/>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      />


    
    
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <ScrollView contentContainerStyle={[{justifyContent: 'center'},{alignItems: 'center'}]} style={styles.modalContainer}>
          <View style={styles.modalContent}> 
            
           {selectedItem && (
            <>
              <View style={styles.modalTitleCont}>
                {daysOfWeek[selectedProgram.day]  ? (
                  <Text style={styles.modalTitle}>{daysOfWeek[selectedProgram.day]}</Text>
                ) : (

                  <View style={styles.updateDaySelection}>
                    <SelectList 
                        setSelected={(val) => setSelected(val)} 
                        data={dataDropdown} 
                        save="value"
                        dropdownTextStyles={[{color: 'white'},{fontFamily: 'KeaniaOne'}]}
                        inputStyles={[{ color: 'red' },{fontFamily: 'KeaniaOne'},{fontSize: 18}]}
                        dropdownStyles={[{ color: 'white' },{fontFamily: 'KeaniaOne'}]}
                        boxStyles={[{ width: 300 },{borderWidth:0}]}
                        placeholder='Select Program Day'
                        search={false}

                        
                    />
                    <TouchableOpacity onPress={ async ()=>{
                      console.log("IDDDDDDDDDD" + selectedProgram.id + " DAYYYYY: " +selectedProgram.day);
                      console.log(daysOfWeekOrder[selectedProgram.day]);
                      await updateProgram(selectedProgram.id,daysOfWeekOrder[selected]);
                      await testApi();
                      const updatedItem = programData.find(item => item.id === selectedProgram.id);
                      setSelectedItem(...updatedItem);
                      //setModalVisible(false);

                      }} style={styles.updateButton}>
                        
                        <View style={[{alignItems: 'center'}]}>
                        <FontAwesome6 name="check" size={20} color="green" />
                        </View>

                    </TouchableOpacity>
                  </View>
              
                )}
              </View>

              <View style={styles.modalTitleCont}>
                <Text style={styles.modalTitle}> Current Workout/s </Text>
              </View>

              <View style={styles.modalWorkoutCont}>
              {selectedItem.length > 0 ? selectedItem.map((workout, index) => (
                <WorkoutModalItem key={`${workout.workout.title}-${index}`} workout={workout} />
              )) : (
                <View>
                  <Text style={styles.noWorkoutModal}>No workout/s today</Text>
                </View>
              )}
            </View>

              {/* renders the available workouts */}

            <View style={styles.modalTitleCont}>
                <Text style={styles.modalTitle}> Available Workout/s </Text>
            </View>

            <View style={styles.modalWorkoutCont}>
              {availableWorkouts.length > 0 ? availableWorkouts.map((workout, index) => (
                <View style={styles.indivWorkoutModalViewCont} key={`${workout.name}-${index}`}>
                  <Image source={workoutTypes[workout.type] || 'Unknown'} style={{width: 40, height: 40, marginRight:10}} />

                  <View>
                    <Text style={styles.workoutNameModal}>{workout.name}</Text>
                  </View>

                  <TouchableOpacity style={styles.addProgramBtn} onPress={async ()=>{
                    handlePressChoice(workout);
                    }}>
                    <FontAwesome6 name="plus" size={20} color="black" />
                  </TouchableOpacity>

                </View>
              )) : (
                <View>
                  <Text style={styles.noWorkoutModal}>No workout/s available</Text>
                </View>
              )}
            </View>


              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}> 
                <Text style={styles.closeBtnText} >Close</Text>
              </TouchableOpacity>

            </>
           )}
          </View>
        </ScrollView>
    </Modal>

    {/* renders the modal for adjusting details of workouts */}

    <Modal visible={modalChoiceVisible} animationType="slide" transparent={true}>
      <View style={styles.modalChoiceCont}>

          <View style={styles.mainInputCont}>
            {selectedWorkoutItem.reps && (
              <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Reps:  </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setReps(newText)} style={styles.choiceInputCont}/>
              </View>
              
            )}
            {selectedWorkoutItem.sets && (
              <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Sets:  </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setSets(newText)} style={styles.choiceInputCont}/>
              </View>
            )}
            {selectedWorkoutItem.time && (
               <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Time:  </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setTime(newText)} style={styles.choiceInputCont}/>
               </View>
            )}
            {selectedWorkoutItem.weight && (
                <View style={styles.workoutChoiceCont}>
                  <Text style={styles.workoutdetailsModal}>Weight:  </Text>
                  <TextInput cursorColor={colors.redAccent} onChangeText={newText => setWeight(newText)} style={styles.choiceInputCont}/>
                </View>

            )}
            {selectedWorkoutItem.distance && (
              <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Distance: </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setDistance(newText)} style={styles.choiceInputCont}/>
              </View>
              
            )}
          </View>
          <View style={styles.mainButtonCont}>

            <TouchableOpacity style={styles.createWorkoutBtn} onPress={ async ()=>{
              const choiceData = {
                ...(reps && { reps }),
                ...(sets && { sets }),
                ...(time && { time }),
                ...(weight && { weight }),
                ...(distance && { distance })
              };
              console.log(choiceData);
              addWorkout(selectedProgram.id,selectedWorkoutItem.id, choiceData);
              const updatedItem = await viewWorkout(selectedProgram.id);
              setSelectedItem(updatedItem);
              await testApi();
              await newTestApi();
              setmodalChoiceVisible(false);

            }}>
              <Text style={styles.closeBtnText}>Create Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setmodalChoiceVisible(false)}> 
              <Text style={styles.closeBtnText} >Cancel </Text>
            </TouchableOpacity>

          </View>

      </View>
    </Modal>

    {/* renders the modal for adding records to a workout */}

    <Modal visible={modalRecordVisible} animationType="slide" transparent={true}>
      <View style={styles.modalChoiceCont}>

          <View style={styles.mainInputCont}>
            {selectedWorkoutRecord.reps && (
              <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Reps:  </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setReps(newText)} style={styles.choiceInputCont}/>
              </View>
              
            )}
            {selectedWorkoutRecord.sets && (
              <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Sets:  </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setSets(newText)} style={styles.choiceInputCont}/>
              </View>
            )}
            {selectedWorkoutRecord.time && (
               <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Time:  </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setTime(newText)} style={styles.choiceInputCont}/>
               </View>
            )}
            {selectedWorkoutRecord.weight && (
                <View style={styles.workoutChoiceCont}>
                  <Text style={styles.workoutdetailsModal}>Weight:  </Text>
                  <TextInput cursorColor={colors.redAccent} onChangeText={newText => setWeight(newText)} style={styles.choiceInputCont}/>
                </View>

            )}
            {selectedWorkoutRecord.distance && (
              <View style={styles.workoutChoiceCont}>
                <Text style={styles.workoutdetailsModal}>Distance: </Text>
                <TextInput cursorColor={colors.redAccent} onChangeText={newText => setDistance(newText)} style={styles.choiceInputCont}/>
              </View>
              
            )}
          </View>
          <View style={styles.mainButtonCont}>

            <TouchableOpacity style={styles.createWorkoutBtn} onPress={ async ()=>{
              const choiceData = {
                ...(reps && { reps }),
                ...(sets && { sets }),
                ...(time && { time }),
                ...(weight && { weight }),
                ...(distance && { distance })
              };
              console.log(choiceData);
              await setRecord(selectedWorkoutId, choiceData);
              setmodalRecordVisible(false);

            }}>
              <Text style={styles.closeBtnText}>Add Record</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setmodalRecordVisible(false)}> 
              <Text style={styles.closeBtnText} >Cancel </Text>
            </TouchableOpacity>

          </View>

      </View>
    </Modal>

      
      
      
    </ScrollView>
 
    <TouchableOpacity style={styles.addBtn} onPress={ async ()=>{
      await addProgram();
      await testApi();
      console.log(programData);
      console.log()
      
      }} >
      <Text style={{fontSize: 40}}>
        +
      </Text>
    </TouchableOpacity>
    </View>
  )
  
}

const styles = StyleSheet.create({
  container:{
    backgroundColor: colors.primaryBackground,
    flex: 1,
    padding: 20,
   },
   workoutName:{
    color: 'white',
    fontFamily: 'KeaniaOne',
    fontSize: 18
   },
   noWorkout:{
    color: 'white',
    fontFamily: 'KeaniaOne',
    marginTop: 10,
   },
   indivProgCont:{
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
   },
   mainProgramsCont:{
    backgroundColor: '#1E1F26',
    padding:20,
    borderRadius:20,
    marginBottom: 20,
   },
   progressContainer:{
    flexDirection: 'row',
    backgroundColor: '#1E1F26',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    maxHeight: 140
    
   },
   profileImage:{
    width: 100,
    height: 100,
    borderRadius: 20,
   },
   programCont:{
    backgroundColor: '#1E1F26',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
   },
   programText:{
    fontSize: 20,
    color: 'white',
    fontFamily: 'KeaniaOne',
   }, 
   indivWorkCont:{
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
    
   },
   progressText:{
    color: 'white',
    fontFamily: 'KeaniaOne',
    marginBottom: 5,
   },
   addBtn:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#76D09C',
    padding: 5,
    borderRadius: 22,
    width: 60,
    height: 60,
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom:10,
    right: 20
  },

  //modal styles
  modalContainer:{
    flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: "100%",
    height: "100%",
    padding: 20,
    backgroundColor: colors.primaryBackground,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalTitle:{
    fontSize: 20,
    color: 'white',
    fontFamily: 'KeaniaOne',
  },
  modalTitleCont:{
    backgroundColor: '#1E1F26',
    padding: 10,
    borderRadius: 10,
    width:"90%",
    alignItems: 'center',
    marginBottom: 10,
  },
  closeBtn:{
    backgroundColor: colors.redAccent,
    padding: 10,
    borderRadius: 10,
  },
  closeBtnText:{
    fontSize: 20,
    color: 'white',
    fontFamily: 'KeaniaOne',
  },
  noWorkoutModal:{
    color: 'white',
    fontFamily: 'KeaniaOne',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 20,
    
  },
  workoutNameModal:{
    fontSize: 20,
    color: 'white',
    fontFamily: 'KeaniaOne',
  },
  workoutdetailsModal:{
    fontSize: 15,
    color: 'gray',
    fontFamily: 'KeaniaOne',
  },

  modalWorkoutCont:{
    height: "auto",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
   
  },
  indivWorkoutModalViewCont:{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#1E1F26',
    padding: 15,
    borderRadius: 20,
  },
  mainModalCont:{
    marginBottom: 10,
    backgroundColor: '#1E1F26',
    borderRadius: 15
    
  },
  indivWorkoutModalCont:{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  
  workoutAnalyticsCont:{
    minHeight: 100,
    alignItems: 'center',    
  },
  addRecordBtn:{
    backgroundColor: colors.redAccent,
    padding: 10,
    borderRadius: 10,
    margin: 20,
    width: '50%'
  },
  addRecordText:{
    fontSize: 14,
    color: 'white',
    fontFamily: 'KeaniaOne',
    textAlign: 'center'
  },
  updateDaySelection:{
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  updateButton:{
    marginLeft: 20,
    width: "10%",
    height: 45,
    justifyContent: 'center',
   
  },
  addProgramBtn:{
    backgroundColor: colors.redAccent,
    padding: 10,
    borderRadius: 10,
    position: 'absolute',
    right: 15
  },
  deleteProgramBtn:{
    backgroundColor: colors.redAccent,
    padding: 10,
    borderRadius: 10,
    position: 'absolute',
    right: 15
  },


  modalChoiceCont:{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: "100%",
    height: "100%",
    padding: 20,
    backgroundColor: colors.primaryBackground,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInputCont:{
    width:'100%',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  choiceInputCont:{
    backgroundColor: '#5E5C5C',
    borderRadius: 22,
    height: 50,
    width: 100,
    color: 'white',
    paddingLeft: 20,
    paddingRight: 20,
  },
  workoutChoiceCont:{
    marginRight: 5,
    marginLeft: 5,
    alignItems: 'center',
  },
  mainButtonCont:{
    flexDirection: 'row',
    marginTop:20,
  },
  createWorkoutBtn:{
    backgroundColor: colors.greenAccent,
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },

  modalChoiceAnalyticsCont:{
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10
  },

  recordChoiceBtnCont:{
    backgroundColor: colors.greenAccent,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 10
  },

  mainRecordContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
    
  },
  
  setAnalyticsBtn:{
    fontFamily: 'KeaniaOne',
    color: 'white',
  },

  analyticsInfoCont:{
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: colors.primaryBackground,
    borderRadius: 10,
    padding: 10,
  },
  analyticText:{
    fontFamily: 'KeaniaOne',
    color: 'white',
    fontSize: 20,
  },
  indivAnalyticsCont:{
    marginLeft: 10,
    marginRight:10,
    alignItems: 'center',
  },
  analyticSubText:{
    fontFamily: 'KeaniaOne',
    fontSize: 16,
    color: 'gray',
  },


});
