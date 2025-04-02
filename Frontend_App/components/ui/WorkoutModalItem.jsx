import {LineChart} from "react-native-chart-kit";
import { Image, StyleSheet, View, Text, TextInput,TouchableOpacity,Modal} from 'react-native';
import { useEffect, useState } from 'react';
import React from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Dimensions } from "react-native";

import upper from '@/assets/images/Upper-Workout-icon.png';
import push from '@/assets/images/push.png';
import pull from '@/assets/images/pull.png';
import core from '@/assets/images/core.png';
import lower from '@/assets/images/Treadmill.png';

import colors from '../../constants/globalStyles';
import { getProgram, getWorkout, deleteWorkout, getRecord, setRecord} from '@/components/generalFetchFunction';


const screenWidth = Dimensions.get("window").width;

//constants for icons associated with workout types
const workoutTypes = {
  'U': upper, 
  'L': lower, 
  'C': core,  
  'PS': push,  
  'PL': pull,    
  'N/A': 'Rest Day'
};



const getWorkoutDetails = (workoutName, availableWorkouts) => {
    const workout = availableWorkouts.find(item => item.name === workoutName);
    if (!workout) {
      return "Workout not found";
    }
    const { sets, reps, time, distance, weight } = workout;
    return { sets, reps, time, distance, weight };
  };

//processed data for the graph component
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


//main component being exported
const WorkoutModalItem = ({workout, availableWorkouts, selectedProgram, setSelectedItem,setProgramData,setselectedWorkoutId,setselectedWorkoutRecord,setmodalRecordVisible, modalRecordVisible, selectedWorkoutRecord, selectedWorkoutId, forceRenderModal}) => {

  const [reps,setReps] = useState("");
  const [sets,setSets] = useState("");
  const [time,setTime] = useState("");
  const [weight,setWeight] = useState("");
  const [distance,setDistance] = useState("");

  const handlePressRecord =  async (item, workoutid) => {
        setselectedWorkoutId(workoutid);
        setselectedWorkoutRecord(item);
        setmodalRecordVisible(true);
      };
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
        await deleteWorkout(selectedProgram.id,workout.id);
        const updatedItem = await getWorkout(selectedProgram.id);
        setSelectedItem(updatedItem);
        getProgram().then(data => {setProgramData(data)});
        }}>
          
        <FontAwesome6 name="minus" size={20} color="black" />
      </TouchableOpacity>

    </View>

    <View style={styles.workoutAnalyticsCont}>
        <View style={[{flex: 1}, {alignItems:'center'}, {position:'relative'}, {left:-13}]}>
          {recordData && recordData.length > 0 && chartData.datasets && chartData.datasets.length > 0 ? (
            <LineChart
              data={filterDatasets(chartData)}
              width={360}
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
        handlePressRecord(getWorkoutDetails(workout.workout.name,availableWorkouts),workout.id);
      }}> 
        <Text style={styles.addRecordText} >Add Record</Text>
      </TouchableOpacity>
      
    </View>

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
    
                <TouchableOpacity style={styles.createRecordBtn} onPress={ async ()=>{
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


    </View>
  )
};


export default WorkoutModalItem;

const styles = StyleSheet.create({
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
    deleteProgramBtn:{
        backgroundColor: colors.redAccent,
        padding: 10,
        borderRadius: 10,
        position: 'absolute',
        right: 15
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
    createRecordBtn:{
      backgroundColor: colors.greenAccent,
      padding: 10,
      borderRadius: 10,
      marginRight: 15,
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
        marginLeft: 15,
      },
});