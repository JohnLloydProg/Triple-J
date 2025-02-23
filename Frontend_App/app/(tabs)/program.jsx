import { Image, StyleSheet, Platform, View, Text, TextInput, TouchableOpacity, Linking} from 'react-native';
import colors from '../../constants/globalStyles';
import jordi from '@/assets/images/jordi.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import treadmillIcon from '@/assets/images/Treadmill.png';
import { useFonts } from 'expo-font';
import {Link} from 'expo-router';
import { FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import jwtDecode from "jwt-decode";
import { useEffect, useState } from 'react';




const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const workoutTypes = {
  'U': bicepIcon,
  'L': 'Lower Body',
  'C': treadmillIcon,
  'F': 'Full Body',
  'M': 'Mobility',
  'N/A': 'Rest Day'
};


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

  //function to get the necessary info to display the programs and workouts
async function testApi() {

  let accessToken = await getToken("accessToken");
  let refreshToken = await getToken("refreshToken");

  console.log("access: " + accessToken);
  console.log("refresh: " + refreshToken);

  

  
fetch("https://triple-j.onrender.com/api/gym/program", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    }
})
.then(response => response.json())
.then(data => {
  setProgramData(data);
  console.log(data);})
.catch(error => console.error("Error:", error));
}

  //loads the needed custom font styles
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  //loads the information for programs and workouts during the first loading of the programs page
  useEffect(()=>{
    testApi();
  },[]);

  
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
      data={programData}
      renderItem={({ item }) => (
        <WorkoutItem title={daysOfWeek[item.day]} workouts={item.workouts} />
      )}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
    />


      
      <TouchableOpacity style={styles.addBtn} onPress={()=>{console.log(programData)}} >
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

});
