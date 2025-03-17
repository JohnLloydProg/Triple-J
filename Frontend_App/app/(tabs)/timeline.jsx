import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import colors from '../../constants/globalStyles';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import bodyIcon from '@/assets/images/sample-full-body.jpg';
import { RefreshControl } from 'react-native';
import {refreshAccessToken} from '../../components/refreshToken';
import * as ImagePicker from 'expo-image-picker';

//{'id':record.pk, 'date':record.date, 'height':record.height, 'weight':record.weight, 'img':record.img}
// might need to add dependencies for the image picker library

async function timelineRequest() {
  let accessToken = await SecureStore.getItemAsync("accessToken");
  const response = await fetch("https://triple-j.onrender.com/api/gym/progress", {
    method : "GET",
    headers : {
      "Content-Type" : "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    credentials : "same-origin"
  })
  if (!response.ok) {
    try {
      refreshAccessToken();
    }catch (err) {
      return "";
    }
    return timelineRequest()
  }
  const body = await response.json();
  return body;
}

async function timelineSaveRequest(height, weight, image=null) {
  let accessToken = await SecureStore.getItemAsync("accessToken");
  const response = await fetch("https://triple-j.onrender.com/api/gym/progress", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body : JSON.stringify({
      'height' : parseFloat(height),
      'weight' : parseFloat(weight),
      'img' : image
    }),
    credentials : "same-origin"
  })
  if (!response.ok) {
    try {
      refreshAccessToken();
    }catch (err) {
      return "";
    }
  }
  return response;
}

function BMICategory(height, weight) {
  bmi_category = ""
  if (height != null && weight != null) {
      bmi = calculateBMI(height, weight)
      if (bmi < 18.5) {
        bmi_category = 'Under Weight'
      }else if (bmi < 25){
        bmi_category = 'Healthy Weight'
      }else if (bmi < 30) {
        bmi_category = 'Over Weight'
      }else {
        bmi_category = 'Obese'
      }
  }
  return bmi_category;
}

function calculateBMI(height, weight) {
  return parseInt(weight / (height**2))
}

const TimelineScreen = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisble, setModalVisible] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    timelineRequest().then(data => setTimelineData(data));
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    timelineRequest().then(data => setTimelineData(data));
  }, []);

  const save = async () => {
    console.log('pressed');
    const response = await timelineSaveRequest(height, weight, imageFile);
    if (response.ok){
      setModalVisible(false);
    }
  }

  const add = () => {
    let height = SecureStore.getItem('height');
    let weight = SecureStore.getItem('weight');
    setHeight(height);
    setWeight(weight);
    setModalVisible(true);
  }

  const selectImage = async () => {
    console.log("image pressed")
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied")
    }else {
      const result = await ImagePicker.launchImageLibraryAsync({
        base64 : true
      });
      if (!result.canceled) {
        const asset = result.assets.pop()
        const uri = asset.uri;

        setImage(uri);
        setImageFile(asset.base64);
      }
    }
    
  }

  const getImage = async () => {

  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
      }>
        <View style={styles.timeline}>
          <View id='timeline-holder' style={styles.line}/>
          {timelineData.map((timeline, index) => {
            {console.log(`https://triple-j.onrender.com${timeline.img}`)}
            return (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.dateText}>{timeline.date}</Text>
              <View style={styles.card}>
                <Image source={{uri:`https://triple-j.onrender.com${timeline.img}`}} style={styles.image}/>
                <View style={styles.details}>
                  <Text style={styles.status}>{BMICategory(timeline.height, timeline.weight)}</Text>
                  <Text style={styles.info}>BMI: {calculateBMI(timeline.height, timeline.weight)}</Text>
                  <Text style={styles.info}>Weight: {timeline.weight}</Text>
                </View>
              </View>
            </View>
            )
          })}
        </View>
      </ScrollView>
      <Modal animationType="slide" visible={modalVisble} onRequestClose={() => {
        setModalVisible(!modalVisble);
      }}>
        <View style={modalStyles.background}>
          <View style={modalStyles.textView}>
            <TouchableOpacity onPress={() => {selectImage()}}>
              <Image source={{uri : image}} style={modalStyles.image}/>
            </TouchableOpacity>
            <View style={modalStyles.flex}>
                <Text style={modalStyles.textInputLabel}>Height (M): </Text>
                <TextInput cursorColor={colors.redAccent} style={modalStyles.choiceInputCont} onChangeText={newText => setHeight(newText)} value={height}></TextInput>
            </View>
            <View style={modalStyles.flex}>
                <Text style={modalStyles.textInputLabel}>Weight (Kg): </Text>
                <TextInput cursorColor={colors.redAccent} style={modalStyles.choiceInputCont} onChangeText={newText => setWeight(newText)} value={weight}></TextInput>
            </View>
          </View>
          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setModalVisible(false)}> 
              <Text style={modalStyles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.addBtn} onPress={() => save()}> 
              <Text style={modalStyles.closeBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.addButton} onPress={() => add()}>
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
    </SafeAreaView>
  );
};

const modalStyles = StyleSheet.create({
  background : {
    flex: 1,
    backgroundColor: '#1E1E1E',
    alignItems: 'center'
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
    textAlign: 'center'
  },
  flex: {
    flexDirection: 'row'
  },
  textInputLabel: {
    width: 140,
    fontSize: 18,
    color: colors.redAccent,
    fontFamily: 'KeaniaOne',
    textAlign: 'left',
    textAlignVertical: 'center'
  },
  choiceInputCont:{
    backgroundColor: '#5E5C5C',
    borderRadius: 22,
    height: 50,
    width: 150,
    color: 'white',
    paddingLeft: 20,
    paddingRight: 20,
  },
  textView: {
    gap: 40,
    margin: 'auto'
  },
  addBtn: {
    backgroundColor: '#76D09C',
    padding: 10,
    borderRadius: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 60,
    marginBottom: 20,
  },
  image: {
    width: 240,
    height: 320,
    alignSelf: 'center',
    borderRadius: 23
  }
});

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2D2D2D',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  timeline: {
    paddingLeft: 20,
    paddingTop: 15,
  },
  line: {
    position: 'absolute',
    left: 60,
    top: 0,
    width: 8,
    height: '100%',
    backgroundColor: colors.redAccent,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  dateText: {
    position: 'absolute',
    left: -25,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlignL: 'center',
    alignSelf: 'center',
    width: 100,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    padding: 35,
    borderRadius: 20,
    marginTop: 10,
    marginRight: 20,
    marginLeft: 85,
    minHeight: 80,
    alignItems: 'center',
    paddingLeft: 20,
  },
  image: {
    width: 80,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  details: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  status: {
    color: '#FF4D4D',
    fontSize: 16,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  info: {
    color: 'white',
    fontSize: 14,
    flexWrap: 'wrap',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#76D09C',
    padding: 15,
    borderRadius: 20,
  },
  timeline: {
    paddingLeft: 40,
    PaddingTop: 10,
  },
});

export default TimelineScreen;
