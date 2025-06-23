
import {RefreshControl, Image, StyleSheet, View, Text, TextInput,TouchableOpacity,Modal, ScrollView, Alert} from 'react-native';
import React from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import colors from '../../constants/globalStyles';
import {addWorkout, getProgram, getWorkout,getAvailableWorkouts} from '@/components/generalFetchFunction';
import {useState} from 'react';

import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';


const AvailableWorkoutModal = ({ availableWorkouts, workoutTypes, handlePressChoice,setavailWorkoutVisible, modalChoiceVisible, selectedProgram, setSelectedItem, setAvailableWorkouts, setmodalChoiceVisible,selectedWorkoutItem, setRenderer, renderer, setOfflineInfo, OfflineInfo}) => {
  const [reps,setReps] = useState("");
  const [sets,setSets] = useState("");
  const [time,setTime] = useState("");
  const [weight,setWeight] = useState("");
  const [distance,setDistance] = useState("");

  const [categorizedWorkoutsModal, setcategorizedWorkoutsModal] = useState(false);
  const [selectedCategory, setselectedCategory] = useState("Push");

  

  const workoutCategories = ["Push", "Pull", "Lower", "Upper", "Core"]
  const convertedworkoutCategories = {
    "Push": push, 
    "Pull": pull, 
    "Lower": lower, 
    "Upper": upper, 
    "Core": core
  }

 return (
    <ScrollView contentContainerStyle={[{justifyContent: 'center'},{alignItems: 'center'}]} style={styles.modalContainer}>

            <View style={styles.modalTitleCont}>
                <Text style={styles.modalTitle}> Available Category/s </Text>
            </View>

            <View style={styles.modalWorkoutCont}>
              {workoutCategories ? workoutCategories.map((category) => (
                <TouchableOpacity style={styles.indivWorkoutModalViewCont}
                  key={category}
                  onPress={() => {
                    setselectedCategory(category);
                    setcategorizedWorkoutsModal(true);
                  }}
                >

                  <Image source={convertedworkoutCategories[category] || 'Unknown'} style={{width: 40, height: 40, marginRight:10}}/>

                  <View> 
                    <Text style={styles.workoutNameModal}>
                      {category}
                    </Text>
                  </View>

                </TouchableOpacity>
              )):(
                <View>
                  <Text style={styles.noWorkoutModal}>No category/s available</Text>
                </View>
              )}

            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setavailWorkoutVisible(false)}> 
                <Text style={styles.closeBtnText} >Close </Text>
            </TouchableOpacity>

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
                              const numberRegex = /^\d+(\.\d{1})?$/;

                              const errors = [];

                              if (selectedWorkoutItem.reps && (!numberRegex.test(reps))) errors.push('Reps');
                              if (selectedWorkoutItem.sets && (!numberRegex.test(sets))) errors.push('Sets');
                              if (selectedWorkoutItem.time && (!numberRegex.test(time))) errors.push('Time');
                              if (selectedWorkoutItem.weight && (!numberRegex.test(weight))) errors.push('Weight');
                              if (selectedWorkoutItem.distance && (!numberRegex.test(distance))) errors.push('Distance');

                              if (errors.length > 0) {
                                Alert.alert(`Please enter valid numeric input (up to one decimal) for: ${errors.join(', ')}`);
                                return;
                              }

                              const choiceData = {
                                ...(reps && { reps }),
                                ...(sets && { sets }),
                                ...(time && { time }),
                                ...(weight && { weight }),
                                ...(distance && { distance })
                              };

                              console.log(choiceData);
                              await addWorkout(selectedProgram.id, selectedWorkoutItem.id, choiceData);
                              const updatedItem = await getWorkout(selectedProgram.id);
                              setSelectedItem(updatedItem); 
                              setRenderer(!renderer); 
                              setmodalChoiceVisible(false);
                              setOfflineInfo(OfflineInfo => !OfflineInfo);
                            }}>
                          <Text style={styles.closeBtnText}>Create Workout</Text>
                        </TouchableOpacity>
            
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setmodalChoiceVisible(false)}> 
                          <Text style={styles.closeBtnText} >Cancel </Text>
                        </TouchableOpacity>
            
                      </View>
            
                  </View>
                </Modal>


                <Modal visible={categorizedWorkoutsModal} animationType="slide" transparent={true}>
                    <ScrollView contentContainerStyle={[{justifyContent: 'center'},{alignItems: 'center'}]} style={styles.modalContainer}>

                      <View style={styles.modalTitleCont}>
                          <Text style={styles.modalTitle}> Available Workout/s </Text>
                      </View>

                      <View style={styles.modalWorkoutCont}>
                        {availableWorkouts ? availableWorkouts[selectedCategory].map((workout, index) => (
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

                      <TouchableOpacity style={styles.closeBtn} onPress={() => setcategorizedWorkoutsModal(false)}> 
                          <Text style={styles.closeBtnText} >Close </Text>
                      </TouchableOpacity>

                   </ScrollView>
                </Modal>

            
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
    workoutChoiceCont:{
        marginRight: 5,
        marginLeft: 5,
        alignItems: 'center',
    },
    workoutdetailsModal:{
        fontSize: 15,
        color: 'gray',
        fontFamily: 'KeaniaOne',
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
    mainButtonCont:{
        flexDirection: 'row',
        marginTop:20,
    },
    createWorkoutBtn:{
        backgroundColor: colors.greenAccent,
        padding: 10,
        borderRadius: 10,
        marginRight: 15,
        marginBottom: 40,
    },
    closeBtnText:{
      fontSize: 20,
      color: 'white',
      fontFamily: 'KeaniaOne',
    },
    closeBtn:{
        backgroundColor: colors.redAccent,
        padding: 10,
        borderRadius: 10,
        marginBottom: 40,
      },

})