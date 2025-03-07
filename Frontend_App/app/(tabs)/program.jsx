import { Image, StyleSheet, Platform, View, Text, TextInput, Button, TouchableOpacity,Modal} from 'react-native';
import colors from '../../constants/globalStyles';
import jordi from '@/assets/images/jordi.png';

import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';


import { useFonts } from 'expo-font';
import {Link} from 'expo-router';
import { FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import jwtDecode from "jwt-decode";
import { useEffect, useState } from 'react';

import {refreshAccessToken} from '../../components/refreshToken';
import { fonts } from '@rneui/base';


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

//program and workout component for rendering the flatlist that would display the programs and workouts
const WorkoutItem = ({ title, workouts }) => (
  <View style={styles.mainProgramsCont}>
    
    <View style={styles.programCont}>
      <Text style={styles.programText}>{title}</Text>
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



//function for getting the localized variables for the access tokens
async function getToken(key) {
  return await SecureStore.getItemAsync(key);
}  

export default function program() {

const [programData, setProgramData] = useState([]);
const [modalVisible, setModalVisible] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);


//funnction to handle the modal of selected program
const handlePress = (item) => {
  setSelectedItem(item);
  console.log("Selected item: ", item);
  setModalVisible(true);
};

//function to fetch the programs and workouts
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

//function to add programs
async function addProgram() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);

    let response = await fetch("https://triple-j.onrender.com/api/gym/program/create", {
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
      
      response = await fetch("https://triple-j.onrender.com/api/gym/program/create", {
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


  //loads the needed custom font styles
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  //loads the information for programs and workouts during the first loading of the programs page
  useEffect(()=>{
    testApi();
  },[]);
  
  //sorts the programs from monday-sunday
  const sortedProgramData = [...programData].sort((a, b) => {
    const dayA = daysOfWeekOrder[daysOfWeek[a.day]] ?? 0; 
    const dayB = daysOfWeekOrder[daysOfWeek[b.day]] ?? 0;
    return dayA - dayB;
  });
  
  return(
    <View style={styles.container}>

      <View style={styles.progressContainer}>
        <View style={{marginRight: 15}}>
          <Image source={jordi} style={styles.profileImage} />
        </View>

        <View>
          <Text style={styles.progressText}>
            January 13, 2025
          </Text>
          <Text style={styles.progressText}>
            BMI: 20 (Healthy Weight)
          </Text>
          <Text style={styles.progressText}>
            Wieght: 100lbs
          </Text>
          <Text style={styles.progressText} >
            Height: 5' 0''
          </Text>
        </View>
      </View>

      
      <FlatList
      data={sortedProgramData}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} >
          <WorkoutItem title={daysOfWeek[item.day]} workouts={item.workouts} />
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      />
    
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}> 
            
           {selectedItem && (
            <>
              <View style={styles.modalTitleCont}>
                <Text style={styles.modalTitle}> {daysOfWeek[selectedItem.day] || "Unknown Day"} </Text>
              </View>

              <View style={styles.modalTitleCont}>
                <Text style={styles.modalTitle}> Current Workout/s </Text>
              </View>


              <View style={styles.modalWorkoutCont}>
              {selectedItem.workouts.length > 0 ? selectedItem.workouts.map((workout, index) => (
                <View style={styles.indivWorkoutModalCont} key={`${selectedItem.title}-${index}`}>
                  <Image source={workoutTypes[workout.type] || 'Unknown'} style={{width: 40, height: 40, marginRight:10}} />
                  <View>
                    <Text style={styles.workoutNameModal}>{workout.name}</Text>
                  </View>
                </View>
              )) : (
                <View>
                  <Text style={styles.noWorkoutModal}>No workouts today</Text>
                </View>
              )}
            </View>


              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}> 
                <Text style={styles.closeBtnText} >Close</Text>
              </TouchableOpacity>
            </>
           )}
          </View>
        </View>
    </Modal>

      
      <TouchableOpacity style={styles.addBtn} onPress={ async ()=>{
        await addProgram();
        await testApi();
        console.log(programData);
        console.log()
        
        }} >
        <Text style={{fontSize: 40, position: 'relative', bottom: 3}}>
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
    maxHeight: 100,
    maxWidth: 100,
    borderRadius: 20,
   },
   programCont:{
    backgroundColor: '#1E1F26',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
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
      justifyContent: 'center',
      alignItems: 'center',
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
  modalWorkoutCont:{
    backgroundColor: '#1E1F26',
    height: "auto",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: "90%",
  },
  indivWorkoutModalCont:{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  }


});
