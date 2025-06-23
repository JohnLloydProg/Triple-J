import React from 'react';
import { View, Text, TouchableOpacity, Image,StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { deleteProgram, getProgram } from '@/components/generalFetchFunction';
import { useEffect, useState, useContext } from 'react';

import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';

import LoadingModal from '@/components/ui/LoadingModal';


//constants for icons associated with workout types
const workoutTypes = {
  'U': upper, 
  'L': lower, 
  'C': core,  
  'PS': push,  
  'PL': pull,    
  'N/A': 'Rest Day'
};



const WorkoutItem = ({ title, workouts, programId, setProgramData, setOfflineInfo, OfflineInfo, setRenderer, renderer}) => {
  const [isLoading, setisLoading] = useState(false);
  
  return(
  <View style={styles.mainProgramsCont}>
    <LoadingModal modalVisible={isLoading} />
    <View style={styles.programCont}>
      <Text style={styles.programText}>{title ? title : "No Set Day"}</Text>
      <TouchableOpacity onPress={ async ()=>{
        try{
        setisLoading(true);
        await deleteProgram(programId);
        await getProgram().then(data => {setProgramData(data)});
        await setOfflineInfo(OfflineInfo => !OfflineInfo);
        setRenderer(renderer = !renderer)
        console.log("deleted a program");
        }catch(e){
        console.log("Select Trash Program Error: "+ e)
      }finally{
                  setisLoading(false);
                }
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
};

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