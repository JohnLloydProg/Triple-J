import { Image, StyleSheet, Platform, View, Text, TextInput, TouchableOpacity, Linking} from 'react-native';
import colors from '../constants/globalStyles';
import React, { useState } from 'react';

import { CheckBox, withTheme } from '@rneui/themed';



export default function HomeScreen() {
  const [check1, setCheck1] = useState(false);

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
          E-mail/Username
        </Text>
        <TextInput cursorColor={colors.redAccent} style={styles.inputField} />
      </View>

      <View style={{marginBottom: 20}}>
        <Text style={styles.inputFieldText}>
          Password
        </Text>
        <TextInput cursorColor={colors.redAccent} style={styles.inputField} />
      </View>

    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
      <CheckBox
        title="Remember me"
        checked={check1}
        onPress={() => setCheck1(!check1)}
        containerStyle={{backgroundColor: colors.primaryBackground, height: 30, padding: 0}}
        textStyle={{color: 'white', opacity: 0.6, right: 5, fontSize: 12}}
      />

      <View>
        <Text onPress={() => Linking.openURL('https://www.youtube.com/watch?v=pRJNfgPO188')} style={styles.forgotButtonText}>
          Forgot Password?
        </Text>
      </View>

    </View>

    <TouchableOpacity style={styles.loginBtn}>
      <Text style={styles.loginBtnTxt}>
        Login
      </Text>
    </TouchableOpacity>

    <View>
      <Text style={[styles.titleSubText, {fontSize:12}]}
      onPress={() => Linking.openURL('https://www.youtube.com/watch?v=pRJNfgPO188')}>
        Don't have an account yet? <Text style={[styles.forgotButtonText, {fontSize:12}]}>Sign Up</Text> 
      </Text>
    </View>

    </View>
  );
}

const styles = StyleSheet.create({
 titleText:{
    color: colors.redAccent,
    fontSize: 30,
    fontWeight: 'bold',
 },
 titleSubText:{
    color: 'white',
    opacity: 0.6,
    fontWeight: 'bold',
 },
 inputFieldText:{
    color: colors.redAccent,
    left: 20,
    fontWeight: 'bold',
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
  color: '#4259CA', 
  opacity: 0.6, 
  fontWeight: 'bold', 
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
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
}
});
