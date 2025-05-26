import { StyleSheet, View, Alert, Text, TextInput, TouchableOpacity, Linking} from 'react-native';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { router, Link } from 'expo-router';

import colors from '../constants/globalStyles';
import { getToken,saveToken } from '@/components/storageComponent';
import { validateLoginInfo, getMemberInfo } from '@/components/generalFetchFunction';


export default function HomeScreen() {

  const [username, setUsername] = useState('');
  const [password, setPass] = useState('');


  const setMemberInfo = async () => {
    try{
      const response = await getMemberInfo();
      
      const data = await response.json();

      //console.log("Member Information: ",data);

      await saveToken("address", data.address ? data.address.toString() : "");
      await saveToken("birthDate", data.birthDate ? data.birthDate.toString() : "");
      await saveToken("email", data.email ? data.email.toString() : "");
      await saveToken("firstName", data.first_name ? data.first_name.toString() : "");
      await saveToken("gymTrainerId", data.gymTrainer ? data.gymTrainer.toString() : "");
      await saveToken("lastName", data.last_name ? data.last_name.toString() : "");
      await saveToken("membershipType", data.membershipType ? data.membershipType.toString() : "");
      await saveToken("mobileNumber", data.mobileNumber ? data.mobileNumber.toString() : "");
      await saveToken("sex", data.sex ? data.sex.toString() : "");
      await saveToken("userId", data.id ? data.id.toString() : "");
      await saveToken("height", data.height ? data.height.toString() : "");
      await saveToken("weight", data.weight ? data.weight.toString() : "");
      await saveToken("profilePic", data.profilePic ? data.profilePic.toString() : "");

      //console.log("Member information saved to secure storage.");

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
      
  
      console.log("User data:", data);
  
      await setMemberInfo();

      router.push('/(tabs)/home');
  
    } catch (error) {
      console.error("Error:", error);
    }
  };


  useEffect(() => {
    const autoLogin = async () => {
      try{
        //tests if there is already a token, saved if not proceed to manual login
        accessToken = await refreshAccessToken();
        const response = await getToken("username");
        if (response){
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
