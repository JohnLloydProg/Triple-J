import { Image, StyleSheet, Platform, View, Text, TextInput, TouchableOpacity, Linking} from 'react-native';
import colors from '../../constants/globalStyles';
import jordi from '@/assets/images/jordi.png';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function program() {

  return(
    <View style={styles.container}>

      <View style={styles.progressContainer}>
        <View style={{marginRight: 15}}>
          <Image source={jordi} style={styles.profileImage} />
        </View>

        <View>
          <Text>
            January 13, 2025
          </Text>
          <Text>
            BMI: 20 (Healthy Weight)
          </Text>
          <Text>
            Wieght: 100lbs
          </Text>
          <Text>
            Height: 5' 0''
          </Text>
        </View>
      </View>

      <View style={styles.workoutContainer}>

      </View>

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
    backgroundColor: 'yellow',
    padding: 20,
    borderRadius: 30,
    
   },
   profileImage:{
    maxHeight: 100,
    maxWidth: 100,
    borderRadius: 20,
   },
   workoutContainer:{
    backgroundColor: 'red',
    flex: 1,
   }, 

});
