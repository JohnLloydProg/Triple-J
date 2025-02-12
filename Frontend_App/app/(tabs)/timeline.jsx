import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import bodyIcon from '@/assets/images/sample-full-body.jpg';


const timelineData = [
  { date: 'Jan 13, 2025', bmi: 20, weight: '100 lbs' },
  { date: 'Jan 11, 2025', bmi: 20, weight: '100 lbs' },
  { date: 'Jan 09, 2025', bmi: 20, weight: '100 lbs' },
  { date: 'Jan 07, 2025', bmi: 20, weight: '100 lbs' },
  { date: 'Jan 05, 2025', bmi: 20, weight: '100 lbs' },
];

const TimelineScreen = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <AntDesign name="arrowleft" size={24} color="white" />
        <Text style={styles.title}>Workout</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.timeline}>
          <View style={styles.line} />
          {timelineData.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.dateText}>{item.date}</Text>
              <View style={styles.card}>
                <Image source={require('@/assets/images/sample-full-body.jpg')} style={styles.image} />
                <View style={styles.details}>
                  <Text style={styles.status}>Healthy Weight</Text>
                  <Text style={styles.info}>BMI: {item.bmi}</Text>
                  <Text style={styles.info}>Weight: {item.weight}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.addButton}>
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    backgroundColor: 'red',
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
    borderRadius: 0,
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
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 50,
  },
  timeline: {
    paddingLeft: 40,
    PaddingTop: 10,
  },
});

export default TimelineScreen;
