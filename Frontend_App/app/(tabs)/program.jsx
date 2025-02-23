import { Image, StyleSheet, Platform, View, Text, TextInput, TouchableOpacity, Linking} from 'react-native';
import colors from '../../constants/globalStyles';
import jordi from '@/assets/images/jordi.png';
import bicepIcon from '@/assets/images/Upper-Workout-icon.png';
import { useFonts } from 'expo-font';
import {Link} from 'expo-router';
import { FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import jwtDecode from "jwt-decode";
import { useEffect } from 'react';

const DATA = [
  {
    id: '1',
    date: 'Monday',
    workouts: {
      type: ['core', 'leg', 'upper'],
      description: ['(4 sets, 30 reps)', '(3 sets, 12 reps)', '(2 sets, 30 reps)'],
    },
    img: bicepIcon,
  },
  {
    id: '2',
    date: 'Tuesday',
    workouts: {
      type: ['core', 'leg', 'upper', 'cardio'],
      description: ['(4 sets, 30 reps)', '(3 sets, 12 reps)', '(2 sets, 30 reps)', '10 min'],
    },
    img: bicepIcon,
  },
  {
    id: '3',
    date: 'Wednesday',
    workouts: {
      type: ['core', 'leg', 'upper'],
      description: ['(4 sets, 30 reps)', '(3 sets, 12 reps)', '(2 sets, 30 reps)'],
    },
    img: bicepIcon,
  },

];


//function for creating each component of programs and its necessary workouts
const Item = ({title, workouts, img}) => (
  <View style={{backgroundColor: '#1E1F26', marginBottom:10,borderRadius: 10, padding:15}}>
    
    <View style={{borderBottomColor:'white', borderBottomWidth: 1, marginBottom: 10, paddingBottom: 8}}> 

    <Text style={{color:'white', fontFamily: 'KeaniaOne'}}>{title}</Text>

    </View>

    <View>
      {workouts.type.map((type, index) => (
        <View key={`${title}-${type}-${index}`} style={styles.indivWorkCont}>
          <Image  source={img} style={{width: 40, height: 40, marginRight:10}} />

          <View>
          <Text style={{color:'white', fontFamily: 'KeaniaOne', marginBottom: 3}}>{type}</Text>
          <Text style={{color:'white', fontFamily: 'KeaniaOne'}}>{workouts.description[index]}</Text>
          </View> 
        </View>
      ))}
    </View>

  </View>
);

//function for getting the localized variables for the access tokens
async function getToken(key) {
  return await SecureStore.getItemAsync(key);
}  


//function to get the necessary info to display the programs and workouts
async function testApi() {

  let accessToken = await getToken("accessToken");
  let refreshToken = await getToken("refreshToken");

  console.log("access: " + accessToken);
  console.log("refresh: " + refreshToken);

  
//   fetch("https://triple-j.onrender.com/api/gym/program", {
//     method: "GET",
//     headers: {
//         "Authorization": `Bearer ${accessToken}`,
//         "Content-Type": "application/json"
//     }
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error("Error:", error));

// fetch("https://triple-j.onrender.com/api/gym/workout/1", {
//   method: "GET",
//   headers: {
//       "Authorization": `Bearer ${accessToken}`,
//       "Content-Type": "application/json"
//   }
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error("Error:", error));


}


export default function program() {
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
        data={DATA}
        renderItem={({item}) => 
          <Item id={item.id} description={item.description} img={item.img} title={item.date} workouts={item.workouts} />
      }
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator= {false}

      />


      <Link href="/home" asChild>
            <TouchableOpacity style={styles.addBtn} onPress={()=>{testApi()}} >
              <Text style={{fontSize: 40, position: 'relative', bottom: 3}}>
                +
              </Text>
            </TouchableOpacity>
      </Link>

    </View>
 

  )
  
}

const styles = StyleSheet.create({
  container:{
    backgroundColor: colors.primaryBackground,
    flex: 1,
    padding: 20,
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
   workoutContainer:{
    backgroundColor: 'red',
    flex: 1,
    borderRadius: 30,
    padding: 20
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
