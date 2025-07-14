import { Image, StyleSheet, Platform, View, Text, Linking, TouchableOpacity,TextInput, RefreshControl} from 'react-native';
import React from 'react';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import colors from '../../constants/globalStyles';
import * as SecureStore from 'expo-secure-store';
import { router, useRouter } from 'expo-router';
import { ScrollView, Alert } from 'react-native';

import {refreshAccessToken} from '../../components/refreshToken';
import {setMemberHW, getMembershipInfo, getMemberInfo, startPayment} from '@/components/generalFetchFunction';
import { getToken,saveToken, delToken } from '@/components/storageComponent';
import NetInfo from '@react-native-community/netinfo';

import LoadingModal from '@/components/ui/LoadingModal';


//deletes information stored based on logged in account and redirects to login page
 async function logoutDetails() {
  try {
    await delToken("accessToken");
    await delToken("refreshToken");
    await delToken("username");
    await delToken("password");

    await delToken("userId");
    await delToken("weight");
    await delToken("height");
    await delToken("membershipType");
    await delToken("address");
    await delToken("birthDate");
    await delToken("email");
    await delToken("firstName");
    await delToken("gymTrainerId");
    await delToken("lastName");
    await delToken("mobileNumber");
    await delToken("sex");
    await delToken("profilePic");

    await delToken("memberId");
    await delToken("startDate");
    await delToken("expirationDate");
    await delToken("price");

    await delToken("isTrainer");
    await delToken("secondaryUserID");

    await delToken("offlineData")

    router.push('/');
    
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}



export default function Settings() {

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
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    handlegetMemberInfo();
    handlegetMembershipInfo();
    console.log("Refreshsed:");
  }, []);

  const [memberInfo, setMemberInfo] = useState([]);
  const [membershipInfo, setMembershipInfo] = useState([]);
  const [memberHeight, setMemberHeight] = useState('');
  const [memberWeight, setMemberWeight] = useState('');

  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  const handlegetMemberInfo = async () => {
    const response = await getMemberInfo();
    setMemberInfo(response);
  }

  const handlegetMembershipInfo = async () => {
    const response = await getMembershipInfo();
    setMembershipInfo(response);
    await saveToken("memberId", response.member.toString());
    await saveToken("startDate", response.startDate.toString());
    await saveToken("expirationDate", response.expirationDate.toString());
    await saveToken("price", response.price.toString());
    await saveToken("membershipType", response.membershipType);
    
  }

  useEffect(() => {
    handlegetMemberInfo();
    handlegetMembershipInfo();
  }, []);

  const [isLoading, setisLoading] = useState(false);

 return(
  <View style={{flex:1}}>
      <View style={[{backgroundColor:"rgba(35, 31, 31, 0.54)"},{width: "100%"}, {height: "16%"}, {justifyContent: "center"}, {alignItems:"center"},
              {paddingTop:30}]}>
              <Text style={[{fontSize: 40},{color: colors.redAccent},{fontFamily: 'KeaniaOne'}]}>
                Triple J
              </Text>
       </View>

  <ScrollView refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }>

    <View style={styles.container}>

        <View style={styles.accountCont}>
          
          <View style={styles.headerCont}>
            <FontAwesome6 name="user" size={24} color="white" />
            <Text style={styles.titleText}>Account Info</Text>
          </View>


          <View>
            <Text style={styles.subText}>
            Account Holder: {memberInfo.first_name} 
            </Text>
            <Text style={styles.subText}>
            Membership Type: {membershipInfo.membershipType}
            </Text>
            <Text style={styles.subText}>
            Height: {memberInfo.height} m
            </Text>
            <Text style={styles.subText}>
            Weight: {memberInfo.weight} kg
            </Text>
            <Text  style={styles.subText}>
            Membership Start: {membershipInfo.startDate}
            </Text>
            <Text  style={styles.subText}>
            Membership Expiry: {membershipInfo.expirationDate}
            </Text>
            
          </View>

        </View>

      <View style={styles.accountCont}>

          <View style={styles.headerCont}>
            <FontAwesome6 name="user" size={24} color="white" />
            <Text style={styles.titleText}>Update Biometrics</Text>
          </View>

          <View  style={{marginBottom: 20}}>
                  <Text style={styles.inputFieldText}>
                    Height (m)
                  </Text>
                  <TextInput keyboardType="decimal-pad" onChangeText={newText => {setMemberHeight(newText)}} cursorColor={colors.redAccent} style={styles.inputField} />
          </View>
          <View  style={{marginBottom: 20}}>
                  <Text style={styles.inputFieldText}>
                    Weight (kg)
                  </Text>
                  <TextInput keyboardType="decimal-pad" onChangeText={newText => {setMemberWeight(newText)}} cursorColor={colors.redAccent} style={styles.inputField} />
          </View>

          <TouchableOpacity onPress={async ()=>{

            const isValidNumber = (value) => {
              const regex = /^\d+(\.\d{1,})?$/;
              return regex.test(value) && value.trim() !== '';
            };

             if (!isValidNumber(memberHeight) || !isValidNumber(memberWeight)) {
              Alert.alert("Invalid Input", "Please enter numeric values with at most one decimal point.");
              return;
            }

             try {
              setisLoading(true);
              const response = await setMemberHW(memberHeight, memberWeight);

              console.log("CHECKING:::"+ response)
              await saveToken("weight", response.weight.toString());
              await saveToken("height", response.height.toString());
              await handlegetMemberInfo();
            } catch (error) {
              Alert.alert("Update Failed", "There was an error updating your data.");
              console.log("Error in setMemberHW:", error);
            } finally{
              setisLoading(false);
            }


          }}  style={styles.loginBtn}>
                  <Text style={styles.loginBtnTxt}>
                    Update
                  </Text>
          </TouchableOpacity>

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

      <TouchableOpacity onPress={async ()=>{
        await startPayment();
        console.log("redirected to payment channel");
      }}>

        <View style={styles.membershipCont}>
          
            <FontAwesome6 name="credit-card" size={24} color="white" />
            <Text style={[styles.titleText, {fontSize: 20}]} >
              Membership Payment</Text>
          
        </View>

      </TouchableOpacity>

      <TouchableOpacity onPress={() => {logoutDetails()}}>

        <View style={styles.logoutCont}>
          
            <FontAwesome6 name="right-from-bracket" size={24} color="white" />
            <Text style={[styles.titleText, {fontSize: 20}]} >
              Logout</Text>
          
        </View>

      </TouchableOpacity>

    </View>

    <LoadingModal modalVisible={isLoading} />
  </ScrollView>



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
  inputFieldText:{
      color: colors.redAccent,
      left: 20,
      fontFamily: 'KeaniaOne',
      marginBottom: 8,
   },
   inputField:{
    backgroundColor: '#5E5C5C',
    borderRadius: 22,
    height: 50,
    color: 'white',
    paddingLeft: 20,
    paddingRight: 20,
   },
   loginBtn:{
    backgroundColor: '#4259CA',
    padding: 15,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 15,
},
 loginBtnTxt:{
    fontFamily: 'KeaniaOne',
    color: 'white',
    fontSize: 14,
},
});