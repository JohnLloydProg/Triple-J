import { Image, StyleSheet, Platform, View, Alert, Text, TextInput, TouchableOpacity, Linking} from 'react-native';
import colors from '../constants/globalStyles';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { router, useRouter } from 'expo-router';

import { CheckBox, withTheme } from '@rneui/themed';
import {Link} from 'expo-router';
import jwtDecode from "jwt-decode";

import * as Keychain from 'react-native-keychain';
import * as SecureStore from 'expo-secure-store';

async function saveToken(key, value) {

  try{
  await SecureStore.setItemAsync(key,value);
  }catch(error){
    console.log(error);
  }
}

async function getToken(key) {
  return await SecureStore.getItemAsync(key);
}  



export default function HomeScreen() {

  //loads the appropriate fonts
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    KeaniaOne: require('../assets/fonts/KeaniaOne-Regular.ttf'),
  });
    

  //store variables for the login credentials
  const [check1, setCheck1] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPass] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      let accessToken = await getToken("accessToken");
      let refreshToken = await getToken("refreshToken");

      if (accessToken && refreshToken) {
        router.push('/(tabs)/home');
      }
    };

    checkToken();
  }, []);

  //handles the appropriate http request to validate login credentials

    const route = useRouter();

  function validateInfo() {

   //fetches user id
   async function getMemberInfo() {
    try {
      let accessToken = await SecureStore.getItemAsync("accessToken");
      let refreshToken = await SecureStore.getItemAsync("refreshToken");
      let username = await SecureStore.getItemAsync("username");
      
      console.log("access: " + accessToken);
      console.log("refresh: " + refreshToken);
      console.log("username: " + username);
  
      let response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
  
      if (response.status === 401) {
        console.log("Access token expired");
        accessToken = await refreshAccessToken();
        console.log("New access token: " + accessToken);
        if (!accessToken) {
          throw new Error("Failed to refresh access token");
        }
        
        response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
      }
  
        const data = await response.json();
        console.log("user id: " + data.id);
        saveToken("userId", data.id.toString());
      } catch (error) {
        console.error("Error:", error);
      }
  
  }

    fetch("https://triple-j.onrender.com/api/account/token", {
      method: "POST",
      body: JSON.stringify({
        "username": username,
        "password": password,
      }),
      credentials: 'same-origin',
      headers: {
       "Content-Type": "application/json;",
      }
    })
    .then(response => {
      if (!response.ok) {
        console.log('mali');
        Alert.alert('Notification', 'The Email or password that you have entered is incorrect, please try again.')
      
        throw new Error("Login failed with status: " + response.status);
        
      }
      return response.json(); 
    })
    .then(async (data) => {


        let accessToken = data.access;
        let refreshToken = data.refresh;


        saveToken("accessToken", accessToken);
        saveToken("refreshToken", refreshToken);
        saveToken("username", username);

        console.log(data)
        await getMemberInfo();
        router.push('/(tabs)/home');
      
    })
    .catch(error => {
      console.error("Error:", error);
    });
  }


 

  return (
    <View style={styles.container}>

      <View style={{marginBottom: 20}}>
        <Text style={styles.titleText}>
          Login with e-mail/username
        </Text>
      </View>

      <View  style={{marginBottom: 40}}>
        <Text style={styles.titleSubText}>
          Get started with the latest news and annoucements from Triple J Gym
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

    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
      <CheckBox
        title="Remember me"
        checked={check1}
        onPress={() => setCheck1(!check1)}
        containerStyle={{backgroundColor: colors.primaryBackground, height: 30, padding: 0}}
        textStyle={styles.checkText}
      />

      <View>
        <Text onPress={() => Linking.openURL('https://www.facebook.com/triplejfitnesscenter')} style={styles.forgotButtonText}>
          Forgot Password?
        </Text>
      </View>

    </View>

    <Link href="#" asChild>
      <TouchableOpacity onPress={()=>{validateInfo()}}  style={styles.loginBtn}>
        <Text style={styles.loginBtnTxt}>
          Login
        </Text>
      </TouchableOpacity>
    
    </Link>

    <View>
      <Text style={[styles.titleSubText, {fontSize:12}]}
      onPress={() => Linking.openURL('https://www.facebook.com/triplejfitnesscenter')}>
        Don't have an account yet? <Text style={[styles.forgotButtonText, {fontSize:12}]}>Sign Up</Text> 
      </Text>
    </View>


    <Link href="/home" asChild>
      <TouchableOpacity style={styles.loginBtn}>
        <Text style={styles.loginBtnTxt}>
          Temporary: go to home page
        </Text>
      </TouchableOpacity>
    
    </Link>

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
 forgotButtonText:{
  fontFamily: 'KeaniaOne',
  color: '#4259CA', 
  opacity: 0.6,  
  textAlign: 'right', 
  fontSize: 12, 
  bottom: 2, 
  textDecorationLine: 'underline'
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
 checkText:
  { color: 'white', 
    opacity: 0.6, 
    right: 5, 
    fontSize: 12,
    fontFamily: 'KeaniaOne',
    fontWeight: 'normal'
  },
});
