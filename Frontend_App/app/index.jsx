import { StyleSheet, View, Alert, Text, TextInput, TouchableOpacity, Linking} from 'react-native';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { router, Link } from 'expo-router';

import colors from '../constants/globalStyles';
import {refreshAccessToken} from '@/components/refreshToken';
import { getToken,saveToken } from '@/components/storageComponent';
import { validateLoginInfo, getMemberInfo } from '@/components/generalFetchFunction';


export default function HomeScreen() {

  const [username, setUsername] = useState('');
  const [password, setPass] = useState('');


  const setMemberInfo = async () => {
    try{
      const member_data = await getMemberInfo();

      console.log("Member Information: ",member_data);

      await saveToken("address", member_data.address ? member_data.address.toString() : "");
      await saveToken("birthDate", member_data.birthDate ? member_data.birthDate.toString() : "");
      await saveToken("email", member_data.email ? member_data.email.toString() : "");
      await saveToken("firstName", member_data.first_name ? member_data.first_name.toString() : "");
      await saveToken("gymTrainerId", member_data.gymTrainer ? member_data.gymTrainer.toString() : "");
      await saveToken("lastName", member_data.last_name ? member_data.last_name.toString() : "");
      await saveToken("membershipType", member_data.membershipType ? member_data.membershipType.toString() : "");
      await saveToken("mobileNumber", member_data.mobileNumber ? member_data.mobileNumber.toString() : "");
      await saveToken("sex", member_data.sex ? member_data.sex.toString() : "");
      await saveToken("userId", member_data.id ? member_data.id.toString() : "");
      await saveToken("height", member_data.height ? member_data.height.toString() : "");
      await saveToken("weight", member_data.weight ? member_data.weight.toString() : "");
      await saveToken("profilePic", member_data.profilePic ? member_data.profilePic.toString() : "");

      console.log("Member information saved to secure storage.");

      router.push('/(tabs)/home');

    }catch (error) {
      console.error("Error:", error);
    }
    
  }

  const loginAccount = async (mainUsername,mainPassword) => {
    try {
      console.log("Clicked login button");

      const response = await validateLoginInfo(mainUsername,mainPassword);

      if (!response.ok) {
        Alert.alert('Notification', 'The Email or password that you have entered is incorrect, please try again.');
        console.log(response.status);
        return;
      }
  
      const data = await response.json();

      await saveToken("username", username);
      await saveToken("password", password);

      let accessToken = data.access;
      let refreshToken = data.refresh;
  
      await saveToken("accessToken", accessToken);
      await saveToken("refreshToken", refreshToken);
      
  
      console.log("User data tokens:", data);
  
      await setMemberInfo();
      

  
    } catch (error) {
      console.error("Error:", error);
    }
  };


  useEffect(() => {
    const autoLogin = async () => {
      try{
        //tests if there is already a token, saved if not proceed to manual login
        const response_Test = await refreshAccessToken();
        console.log("Auto-login username:", response_Test);
        if (response_Test){
        await setMemberInfo();
        router.push('/(tabs)/home');
        }
      }catch(error) {
        console.error("Error during auto-login:", error);
        Alert.alert('Notification', 'Auto-login failed. Please log in manually.');
      }
    };

    try{
      autoLogin();
    }catch(error){
      console.error("Error:", error);
    }
   
  }, []);

  return (
    <View style={styles.container}>

      <View style={{marginBottom: 20}}>
        <Text style={styles.titleText}>
          Login your Account
        </Text>
      </View>

      <View  style={{marginBottom: 40}}>
        <Text style={styles.titleSubText}>
          Get started and try latest features of our gym's dedicated fitness app.
        </Text>
      </View>

      <View  style={{marginBottom: 20}}>
        <Text style={styles.inputFieldText}>
          Username
        </Text>
        <TextInput  onChangeText={newText => setUsername(newText)} cursorColor={colors.redAccent} style={styles.inputField} />
      </View>

      <View style={{marginBottom: 20}}>
        <Text style={styles.inputFieldText}>
          Password
        </Text>
        <TextInput onChangeText={newText => setPass(newText)} cursorColor={colors.redAccent} style={styles.inputField} />
      </View>

      <TouchableOpacity onPress={()=>{loginAccount(username,password)}}  style={styles.loginBtn}>
        <Text style={styles.loginBtnTxt}>
          Login
        </Text>
      </TouchableOpacity>
    

    </View>
  );
}

const styles = StyleSheet.create({
 titleText:{
    color: colors.redAccent,
    fontSize: 30,
    fontFamily: 'KeaniaOne',
 },
 titleSubText:{
    color: 'white',
    opacity: 0.6,
    fontFamily: 'KeaniaOne',
 },
 inputFieldText:{
    color: colors.redAccent,
    left: 20,
    fontFamily: 'KeaniaOne',
    marginBottom: 8,
 },
 container:{
  backgroundColor: colors.primaryBackground,
  flex: 1,
  padding: 30,
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
