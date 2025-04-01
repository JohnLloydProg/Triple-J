import React from 'react';
import { View, Text, TouchableOpacity, Image,StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { deleteProgram, getProgram } from '@/components/generalFetchFunction';

import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';


//constants for icons associated with workout types
const workoutTypes = {
  'U': upper, 
  'L': lower, 
  'C': core,  
  'PS': push,  
  'PL': pull,    
  'N/A': 'Rest Day'
};

const WorkoutItem = ({ title, workouts, programId, setProgramData }) => (
  <View style={styles.mainProgramsCont}>
    
    <View style={styles.programCont}>
      <Text style={styles.programText}>{title}</Text>
      <TouchableOpacity onPress={ async ()=>{
        await deleteProgram(programId);
        await getProgram().then(data => {setProgramData(data)});
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

export default WorkoutItem;

const styles = StyleSheet.create({
    mainProgramsCont:{
        backgroundColor: '#1E1F26',
        padding:20,
        borderRadius:20,
        marginBottom: 20,
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
   indivProgCont:{
        flex:1,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
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
});