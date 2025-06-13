import {RefreshControl, Image, StyleSheet, View, Text, TextInput,TouchableOpacity,Modal, ScrollView} from 'react-native';
import { router} from 'expo-router';
import { FlatList } from 'react-native';
import { useEffect, useState, useContext } from 'react';

import colors from '../../constants/globalStyles';
import React from 'react';
import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';

import { checkIfTrainer, getCurrentTimeline, getAvailableWorkouts, getProgram, addProgram,  updateProgram, getWorkout} from '@/components/generalFetchFunction';

import WorkoutItem from '@/components/ui/WorkoutItem';
import WorkoutModalItem from '@/components/ui/WorkoutModalItem';
import AvailableWorkoutModal from '@/components/ui/AvailableWorkoutModal';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { SelectList } from 'react-native-dropdown-select-list'
import { Dimensions } from "react-native";
import { getToken, saveToken } from '@/components/storageComponent';
import { color } from '@rneui/base';
import NetInfo from '@react-native-community/netinfo';

const screenWidth = Dimensions.get("window").width;

const dataDropdown = [
  { key: '0', value: 'Monday' },
  { key: '1', value: 'Tuesday' },
  { key: '2', value: 'Wednesday' },
  { key: '3', value: 'Thursday' },
  { key: '4', value: 'Friday' },
  { key: '5', value: 'Saturday' },
  { key: '6', value: 'Sunday' },
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

const [selected, setSelected] = useState("");
const [selectedWorkoutId, setselectedWorkoutId ] = useState("")
const [programData, setProgramData] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [availableWorkouts, setAvailableWorkouts] = useState([]);
const [selectedProgram, setSelectedProgram] = useState([]);
const [selectedWorkoutItem, setselectedWorkoutItem] = useState([]);
const [selectedWorkoutRecord, setselectedWorkoutRecord] = useState([]);
const [currentTimeLineInfo, setcurrentTimeLineInfo] = useState({});

const [modalVisible, setModalVisible] = useState(false);
const [modalChoiceVisible, setmodalChoiceVisible] = useState(false);
const [modalRecordVisible, setmodalRecordVisible] = useState(false);
const [availWorkoutVisible, setavailWorkoutVisible] = useState(false);

const [isTrainer, setisTrainer] = useState(false);
const [assignedMembers, setassignedMembers] = useState([]);
const [selectedAccount, setselectedAccount] = useState("");

const [renderer ,setRenderer] = useState(false); 

//re-renders graphs after adding a record
const [modalKey, setModalKey] = useState(0);

const forceRenderModal = () => {
  setModalKey(prevKey => prevKey + 1); 
};

//function to detect if a user modifies the program and workouts and stores it into a variable for offline use

let offlinePrograms = [];
let offlineData = "";

const updateOfflineData = async () => {
  try {

    const data = await getProgram();
    offlinePrograms = data.map(item => ({
      id: item.id,
      dayIndex: item.day,
      day: daysOfWeek[item.day] || "Unknown"
    }));

    console.log("Offline Programs:", offlinePrograms);

    const workoutPromises = offlinePrograms.map(program =>
      getWorkout(program.id).then(workoutList => ({
        day: program.day,
        data: workoutList
      }))
    );

    const workoutDataArray = await Promise.all(workoutPromises);
    console.log("Fetched workout data for all programs:", workoutDataArray);
    const groupedWorkouts = {};

    workoutDataArray.forEach(({ day, data }) => {
      if (!groupedWorkouts[day]) {
        groupedWorkouts[day] = [];
      }

      const workoutsWithDay = data.map(workout => ({
        ...workout,
        day
      }));

      groupedWorkouts[day].push(...workoutsWithDay);
    });

    offlineData = JSON.stringify(groupedWorkouts);

    await saveToken("offlineData", offlineData)
    console.log("Offline data saved to secure storage:", offlineData);

    console.log("Workouts grouped by day (with day info included) and stringified:");
    console.log(offlineData);

  } catch (error) {
    console.error("Error fetching or grouping program workouts:", error);
    offlineData = JSON.stringify({ error: error.message });
  }
};

 //function to check if the user is online or offline
  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Network state changed:", state);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);

      if (state.isConnected === false) {
        router.push('/');
        console.log("Device is offline!");

      } else if (state.isConnected === true) {

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
      return `Online (${connectionType})`;
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




const [OfflineInfo, setOfflineInfo] = useState(false);
useEffect(() => {
updateOfflineData();
},[OfflineInfo]);

//re-renders workouts
useEffect(()=>{
    getassignedMembers();
    getIfUserTrainer();
    getProgram().then(data => {setProgramData(data)});
    getAvailableWorkouts().then(data => {setAvailableWorkouts(data)});
    getCurrentTimeline().then(data => {
      setcurrentTimeLineInfo(data);
    });
  },[renderer]);

//funnctions to handle the modal of selected program
const handlePress =  async (item) => {
  setSelectedProgram(item);
  setSelectedItem(await getWorkout(item.id));
  console.log("Selected item: ", item.id);
  setModalVisible(true);
};

const handlePressChoice =  async (item) => {
  const updatedItem = [...selectedItem];
  setSelectedItem(updatedItem);
  setselectedWorkoutItem(item);
  setmodalChoiceVisible(true);
};

//sets the variable to know whether or not use is a trainer
const getIfUserTrainer = async ()=> {
  const trainerCheck  = await getToken("isTrainer");
  if(trainerCheck == "true"){
    setisTrainer(true);
  }else{
    setisTrainer(false);
  }
}

//function to add the trainer's id alongside the members assigned to the trainer
const getassignedMembers = async () => {
  try {
    const fetchedData = await checkIfTrainer();

    const dynamicMembers = fetchedData.map(item => ({
      key: String(item.id),
      value: `${item.first_name} ${item.last_name}`,
    }));

    const predefinedEntry = {
      key: await getToken("userId"),
      value: `${await getToken("firstName")} ${await getToken("lastName")}`,
    };

    const updatedMembers = [predefinedEntry, ...dynamicMembers];
    setassignedMembers(updatedMembers);

    // Optional: Log directly
    console.log("Assigned members of trainer:", updatedMembers);
  } catch (error) {
    console.error("Error fetching assigned members:", error);
  }
};

const changeSelectedAccount = async (selAcc) => {
  saveToken("secondaryUserID", String(selAcc));
}

//re-renders the modal after adding a record to a workout
useEffect(() => {
  console.log("Updated Selected Program: ", selectedProgram);
}, [selectedProgram]);

useEffect(() => {
  console.log("Assigned members of trainer: " + JSON.stringify(assignedMembers));
}, [assignedMembers]);

  //loads the information for programs and workouts during the first loading of the programs page
  useEffect(()=>{
    getassignedMembers();
    getIfUserTrainer();
    getProgram().then(data => {setProgramData(data)});
    getAvailableWorkouts().then(data => {setAvailableWorkouts(data)});
    getCurrentTimeline().then(data => {
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

  //handles the refreshing of the page
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

       {/*Displays user information and current timeline photo */}

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

      {/*If a user is a trainer, it will allow the trainer to change the the usable userid so that trainers
      would be able to edit a certain assigned member's programs*/}
      <View>
  
          {isTrainer ? (
              <View style={[{marginBottom: 20},{backgroundColor: "#1E1F26"},{borderRadius:10}]}>
                <SelectList 
                        setSelected={(val) => setselectedAccount(val)} 
                        data={assignedMembers} 
                        save="key"
                        dropdownTextStyles={[{color: 'white'},{fontFamily: 'KeaniaOne'}]}
                        inputStyles={[{ color: 'red' },{fontFamily: 'KeaniaOne'},{fontSize: 18}]}
                        dropdownStyles={[{ color: 'white' },{fontFamily: 'KeaniaOne'},{borderWidth: null} ]}
                        boxStyles={[{ width: "100%" },{borderWidth: null}]}
                        placeholder='Select Account'
                        search={false}
                        onSelect={async () =>{
                          await changeSelectedAccount(selectedAccount)
                          console.log("Selected Account:", selectedAccount);
                          setRenderer(renderer => !renderer); 
                        }}
                        arrowicon={<FontAwesome6 name="chevron-down" size={20} color="red" />}
                    />
              </View>
          ) : null}
      </View>
      
      {/*Component to render all the programs and their associated workouts */}
      <FlatList
      style={{marginBottom:25}}
      data={sortedProgramData}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} >
          <WorkoutItem title={daysOfWeek[item.day]} workouts={item.workouts} programId={item.id} setProgramData={setProgramData} setOfflineInfo={setOfflineInfo} OfflineInfo={OfflineInfo} setRenderer={setRenderer} renderer={renderer}/>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      />

    
    <Modal key={modalKey} visible={modalVisible} animationType="slide" transparent={true}>
        <ScrollView contentContainerStyle={[{justifyContent: 'center'},{alignItems: 'center'}]} style={styles.modalContainer}>
          <View style={styles.modalContent}> 
            
          {/*Component to render all the programs and their associated workouts */}
           {selectedItem && (
            <>

              {/*Display and allows users to set a day of the week to a blank program*/}
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
                        boxStyles={[{ width: "80%" },{borderWidth:null},]}
                        placeholder='Select Program Day'
                        search={false}
                    />

                    <TouchableOpacity onPress={ async ()=>{
                      console.log("Selected Program Date:", selected);
                      await updateProgram(selectedProgram.id,daysOfWeekOrder[selected]);
                      await getProgram().then(data => {setProgramData(data)});
                      const updatedItem = programData.find(item => item.id === selectedProgram.id);
                      setOfflineInfo(OfflineInfo => !OfflineInfo);
                      setSelectedItem(...updatedItem);

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
                modalRecordVisible={modalRecordVisible}
                selectedWorkoutRecord={selectedWorkoutRecord}
                selectedWorkoutId={selectedWorkoutId}
                forceRenderModal={forceRenderModal}
                setOfflineInfo={setOfflineInfo} 
                OfflineInfo={OfflineInfo}
                />
              )) : (
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.noWorkoutModal}>No workout/s today</Text>
                </View>
              )}
            </View>

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

    {/* renders the available workouts */}
    <Modal visible={availWorkoutVisible} animationType="slide" transparent={true}>
        <AvailableWorkoutModal
          availableWorkouts={availableWorkouts}
          workoutTypes={workoutTypes}
          handlePressChoice={handlePressChoice}
          setavailWorkoutVisible={setavailWorkoutVisible}
          modalChoiceVisible={modalChoiceVisible}
          selectedProgram={selectedProgram}
          setSelectedItem={setSelectedItem}
          setAvailableWorkouts={setAvailableWorkouts}
          setmodalChoiceVisible={setmodalChoiceVisible}
          selectedWorkoutItem={selectedWorkoutItem}
          setRenderer={setRenderer}
          renderer={renderer}
          setOfflineInfo={setOfflineInfo} 
          OfflineInfo={OfflineInfo}
        />
    </Modal>

    </ScrollView>
 
    <TouchableOpacity style={styles.addBtn} onPress={ async ()=>{
      await addProgram();
      await getProgram().then(data => {setProgramData(data)});
      console.log(programData);
      setOfflineInfo(OfflineInfo => !OfflineInfo);
      
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
});
