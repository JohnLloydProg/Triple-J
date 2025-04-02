
import {RefreshControl, Image, StyleSheet, View, Text, TextInput,TouchableOpacity,Modal, ScrollView} from 'react-native';
import React from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import colors from '../../constants/globalStyles';


const AvailableWorkoutModal = ({ availableWorkouts, workoutTypes, handlePressChoice,setavailWorkoutVisible }) => {
 return (
    <ScrollView contentContainerStyle={[{justifyContent: 'center'},{alignItems: 'center'}]} style={styles.modalContainer}>

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

            <TouchableOpacity style={styles.closeBtn} onPress={() => setavailWorkoutVisible(false)}> 
                <Text style={styles.closeBtnText} >Close </Text>
            </TouchableOpacity>
    </ScrollView>
 )
}
export default AvailableWorkoutModal;

const styles = StyleSheet.create({
    modalContainer:{
        flex: 1,
        backgroundColor: colors.primaryBackground,
        paddingTop: 20,
        borderRadius: 20,
    },
    modalTitleCont:{
        backgroundColor: '#1E1F26',
        padding: 10,
        borderRadius: 10,
        width:"90%",
        alignItems: 'center',
        marginBottom: 10,
      },
    modalTitle:{
        fontSize: 20,
        color: 'white',
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
      workoutNameModal:{
        fontSize: 20,
        color: 'white',
        fontFamily: 'KeaniaOne',
      },
      addProgramBtn:{
        backgroundColor: colors.redAccent,
        padding: 10,
        borderRadius: 10,
        position: 'absolute',
        right: 15
      },
      noWorkoutModal:{
        color: 'white',
        fontFamily: 'KeaniaOne',
        marginTop: 10,
        marginBottom: 10,
        fontSize: 20,
      },
      closeBtn:{
        backgroundColor: colors.redAccent,
        padding: 10,
        borderRadius: 10,
        marginBottom: 40,
      },
      closeBtnText:{
        fontSize: 20,
        color: 'white',
        fontFamily: 'KeaniaOne',
    },  
})