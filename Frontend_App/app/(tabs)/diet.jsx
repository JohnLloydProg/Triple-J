import { Image, StyleSheet, Platform,TouchableOpacity,View,Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';

export default function Diet() {


  return(

    <TouchableOpacity style={{backgroundColor: 'blue'}} onPress={async () => {
      let weight = await SecureStore.getItemAsync('weight');
      let height = await SecureStore.getItemAsync('height');

      console.log(weight);
      console.log(height);

      
    }}>
      <Text> LALA </Text>
    
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
