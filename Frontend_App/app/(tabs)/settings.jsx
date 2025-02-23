import { Image, StyleSheet, Platform, View, Text, Linking} from 'react-native';
import { useFonts } from 'expo-font';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import colors from '../../constants/globalStyles';
import * as SecureStore from 'expo-secure-store';
import { router, useRouter } from 'expo-router';


//deletes the tokens for authentication and redirects to login page
 async function logoutDetails() {
  try {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");

    console.log(`Item with key  access: '${"accessToken"}' has been deleted.`);
    console.log(`Item with key  refresh: '${"refreshToken"}' has been deleted.`);

    router.push('/');
    
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}





export default function Settings() {
  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

 return(

  <View style={styles.container}>

    <View style={styles.accountCont}>
      
      <View style={styles.headerCont}>
        <FontAwesome6 name="user" size={24} color="white" />
        <Text style={styles.titleText}>Account Info</Text>
      </View>


      <View>
        <Text style={styles.subText}>
        Derven G. Gonzales  
        </Text>
        <Text style={styles.subText}>
        Membership Type: Monthly
        </Text>
        <Text  style={styles.subText}>
        Membership Expiry: 12/12/2025
        </Text>
      </View>

    </View>

    <View style={styles.contactCont}>
      
      <View style={styles.headerCont}>
        <FontAwesome6 name="envelope" size={24} color="white" />
        <Text style={styles.titleText}>Contact & Business Info</Text>
      </View>


      <View>
        <Text style={styles.subText}>
        Contact no. 0917 622 9969 
        </Text>

        <Text style={styles.subText}>
        Facebook: <Text onPress={() => Linking.openURL('https://www.facebook.com/triplejfitnesscenter')} > facebook.com/triplejfitnesscenter </Text>
        </Text>

        <Text  style={styles.subText}>
        Address: 34 Lj Building unit 5 4th floor illenado compound maysan road malina, Valenzuela, Philippines
        </Text>

      </View>



    </View>

    <View style={styles.membershipCont}>
      
        <FontAwesome6 name="credit-card" size={24} color="white" />
        <Text  onPress={() => Linking.openURL('https://www.facebook.com/triplejfitnesscenter')}style={[styles.titleText, {fontSize: 20}]} >
          Membership Payment</Text>
      
    </View>

    <View style={styles.logoutCont}>
      
        <FontAwesome6 name="right-from-bracket" size={24} color="white" />
        <Text style={[styles.titleText, {fontSize: 20}]} onPress={() => {logoutDetails()}}>
          Logout</Text>
      
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
  subText: {
    color: 'white',
    fontFamily: 'KeaniaOne',
    marginBottom: 5,
  },
  titleText:{
    color: 'white',
    marginLeft: 10,
    fontFamily: 'KeaniaOne',
  },
  headerCont:{
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    paddingBottom: 8,
    marginBottom: 10
  },
  accountCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  contactCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  membershipCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
});