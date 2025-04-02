import {RefreshControl, Image, StyleSheet, View, Text, TextInput,TouchableOpacity,Modal, ScrollView} from 'react-native';
import { router} from 'expo-router';
import { useFonts } from 'expo-font';
import { FlatList } from 'react-native';
import { useEffect, useState, useContext } from 'react';

import colors from '../../constants/globalStyles';
import React from 'react';
import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';

import { getCurrentTimeline, getAvailableWorkouts, getProgram, addProgram, deleteProgram, updateProgram, getWorkout, addWorkout, deleteWorkout, getRecord, setRecord} from '@/components/generalFetchFunction';

import WorkoutItem from '@/components/ui/WorkoutItem';
import WorkoutModalItem from '@/components/ui/WorkoutModalItem';
import AvailableWorkoutModal from '@/components/ui/AvailableWorkoutModal';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { SelectList } from 'react-native-dropdown-select-list'
import {LineChart} from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const WorkoutContext = React.createContext();


const dataDropdown = [
  { key: '0', value: 'Monday' },
  { key: '1', value: 'Tuesday' },
  { key: '2', value: 'Wednesday' },
  { key: '3', value: 'Thursday' },
  { key: '4', value: 'Friday' },
  { key: '5', value: 'Saturday' },
  { key: '6', value: 'Sundays' },
];

//constants for processing dates and workout types
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const daysOfWeekOrder = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6,
};

//constants for icons associated with workout types
const workoutTypes = {
  'U': upper, 
  'L': lower, 
  'C': core,  
  'PS': push,  
  'PL': pull,    
  'N/A': 'Rest Day'
};


export default function program() {

const [modalKey, setModalKey] = useState(0);

const forceRenderModal = () => {
  setModalKey(prevKey => prevKey + 1); // Update the key to trigger a re-render
};

const [selected, setSelected] = useState("");
const [selectedWorkoutId, setselectedWorkoutId ] = useState("")

const [programData, setProgramData] = useState([]);

const [modalVisible, setModalVisible] = useState(false);
const [modalChoiceVisible, setmodalChoiceVisible] = useState(false);
const [modalRecordVisible, setmodalRecordVisible] = useState(false);
const [availWorkoutVisible, setavailWorkoutVisible] = useState(false);

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

//funnction to handle the modal of selected program
const handlePress =  async (item) => {
  setSelectedProgram(item);
  setSelectedItem(await getWorkout(item.id));
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



useEffect(() => {
  console.log("Updated Selected Program: ", selectedProgram);
}, [selectedProgram]);

  //loads the needed custom font styles
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  //loads the information for programs and workouts during the first loading of the programs page
  useEffect(()=>{
    getProgram().then(data => {setProgramData(data)});
    getAvailableWorkouts().then(data => {setAvailableWorkouts(data)});
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



const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);

    getProgram().then(data => {setProgramData(data)});
    getAvailableWorkouts().then(data => {setAvailableWorkouts(data)});
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
        {currentTimeLineInfo.img ? (
          <View style={{marginRight: 15}}>
            <Image 
              source={{uri: `https://triple-j.onrender.com${currentTimeLineInfo.img}`}} 
              style={styles.profileImage} 
            />
          </View>
        ) : null}

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
          <WorkoutItem title={daysOfWeek[item.day]} workouts={item.workouts} programId={item.id} setProgramData={setProgramData} />
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      />


    
    
    <Modal key={modalKey} visible={modalVisible} animationType="slide" transparent={true}>
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
                      await getProgram().then(data => {setProgramData(data)});
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

            {/* renders each workout and its approriate details and records (including graphs) */}
              <View style={styles.modalWorkoutCont}>
              {selectedItem.length > 0 ? selectedItem.map((workout, index) => (
                <WorkoutModalItem key={`${workout.workout.title}-${index}`} 
                workout={workout} 
                availableWorkouts={availableWorkouts} 
                selectedProgram={selectedProgram}
                setSelectedItem={setSelectedItem}
                setProgramData={setProgramData}
                setselectedWorkoutId={setselectedWorkoutId}
                setselectedWorkoutRecord={setselectedWorkoutRecord}
                setmodalRecordVisible={setmodalRecordVisible}
                resetChoiceValues={resetChoiceValues}/>
              )) : (
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.noWorkoutModal}>No workout/s today</Text>
                </View>
              )}
            </View>

              {/* renders the available workouts */}

              <Modal visible={availWorkoutVisible} animationType="slide" transparent={true}>
                <AvailableWorkoutModal
                  availableWorkouts={availableWorkouts}
                  workoutTypes={workoutTypes}
                  handlePressChoice={handlePressChoice}
                  setavailWorkoutVisible={setavailWorkoutVisible}
                  
                />
              </Modal>

              <View style={styles.directionalBtnCont}>
                <TouchableOpacity style={styles.addworkoutBtn} onPress={() => setavailWorkoutVisible(true)}> 
                  <Text style={styles.closeBtnText} >Add Workout</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}> 
                  <Text style={styles.closeBtnText} >Close</Text>
                </TouchableOpacity>

              </View>
              

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
              const updatedItem = await getWorkout(selectedProgram.id);
              setSelectedItem(updatedItem);
              await getProgram().then(data => {setProgramData(data)});
              await getAvailableWorkouts().then(data => {setAvailableWorkouts(data)});
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
              forceRenderModal();
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
      await getProgram().then(data => {setProgramData(data)});
      console.log(programData);
      
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: "100%",
    height: "100%",
    padding: 20,
    backgroundColor: colors.primaryBackground,
    borderRadius: 10,
    alignItems: 'center',
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
  directionalBtnCont:{
    flexDirection: 'row',

  },
  closeBtn:{
    backgroundColor: colors.redAccent,
    padding: 10,
    borderRadius: 10,
    marginLeft: 15,
  },
  addworkoutBtn:{
    backgroundColor: colors.greenAccent,
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
