import { Image, StyleSheet, Platform, View, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { color } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';


const HomeScreen = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1E1E1E', padding: 10 }}>
      
      {/* Program for Today */}
      <View style={{ backgroundColor: '#2D2D2D', borderRadius: 10, padding: 10 }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Your program for today</Text>
        
        {/* Exercise List */}
        {[
          { name: 'Treadmill', details: '10 km', completed: false },
          { name: 'Jumping Jacks', details: '4 sets   30 reps', completed: true },
          { name: 'Burpees', details: '4 sets   15 reps', completed: false },
        ].map((exercise, index) => (
          <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3D3D3D', borderRadius: 10, padding: 10, marginTop: 10 }}>
            <View>
              <Text style={{ color: 'white', fontSize: 16 }}>{exercise.name}</Text>
              <Text style={{ color: 'gray', fontSize: 14 }}>{exercise.details}</Text>
            </View>
            <FontAwesome name={exercise.completed ? 'check-circle' : 'times-circle'} size={24} color={exercise.completed ? 'green' : 'red'} />
          </View>
        ))}
      </View>
      
      {/* Gym Members Count */}
      <View style={{ backgroundColor: '#3D3D3D', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 15 }}>
        <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>30</Text>
        <Text style={{ color: 'gray', fontSize: 14 }}>Gym members currently making gains</Text>
      </View>
      
      {/* QR Code Section */}
      <View style={{ backgroundColor: '#2D2D2D', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 15 }}>
        <View style={{ width: 100, height: 100, backgroundColor: 'white', marginBottom: 10 }} />
        <Text style={{ color: 'white', fontSize: 14 }}>Days until your QR code expires:</Text>
        <Text style={{ color: '#FF4D4D', fontSize: 18, fontWeight: 'bold' }}>5</Text>
        <TouchableOpacity style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginTop: 10 }}>
          <Text style={{ color: 'white', fontSize: 14 }}>Generate QR</Text>
        </TouchableOpacity>
      </View>
      
      {/* Profile Section */}
      <View style={{ backgroundColor: '#2D2D2D', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 15 }}>
        <Image source={{ uri: 'https://via.placeholder.com/80' }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }} />
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Louis Anton L. Gascon</Text>
        <Text style={{ color: '#FF4D4D', fontSize: 14 }}>12/24/2025 - 00:04:20</Text>
        <TouchableOpacity style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginTop: 10 }}>
          <Text style={{ color: 'white', fontSize: 14 }}>Contact Me</Text>
        </TouchableOpacity>
      </View>
    
    </ScrollView>
  );
};

export default HomeScreen;


