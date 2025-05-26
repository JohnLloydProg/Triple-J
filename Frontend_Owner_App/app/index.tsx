
import { Text, View, TextInput, TouchableOpacity} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import AsynchStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";

export async function login(username:string, password:string, router:any) {
  console.log(username)
  console.log(password)

  const data = await fetch("https://triple-j.onrender.com/api/account/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;",
    },
    body: JSON.stringify({
      "username": username,
      "password": password,
    }),
    credentials: 'same-origin',
  }).then(response => {
    return response.json()
  }).then(data => {
    return data
  });

  console.log(data);
  if (data['refresh']) {
    await AsynchStorage.setItem('refresh', data['refresh']);
    await AsynchStorage.setItem('access', data['access']);
    router.navigate('./profile');
  }else {
    console.log('error');
  }
  
}

export default function Index() {
  const [username, onUserChangeText] = React.useState("")
  const [password, onPassChangeText] = React.useState("")
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  if (!permission?.granted) {
    requestPermission();
  }

  return (
    <SafeAreaView className="flex-1 bg-primary pb-32">
      <View className="w-full h-16 bg-secondary flex-row justify-center items-center">
        <Text className="text-3xl text-accent font-keaniaOne_regular">Triple J</Text>
      </View>
      <Text className="text-4xl text-center align-middle text-accent h-64">Login for Admin</Text>
      <View className="flex-1 justify-center items-center">
        <View className="items-start w-3/4 mb-[25]">
          <Text className="text-2xl text-accent text-align-left w-full ml-[30] mb-[10]">Username</Text>
          <TextInput 
          className="w-full bg-tertiary rounded-full h-16 text-white text-xl pl-[30]" 
          onChangeText={(text) => {onUserChangeText(text)}}
          placeholder="Username"
          placeholderTextColor="#aaaaaa"
          value={username}
          />
        </View>
        <View className="items-start w-3/4">
          <Text className="text-2xl text-accent text-align-left w-full ml-[30] mb-[10]">Password</Text>
          <TextInput 
          className="w-full bg-tertiary rounded-full h-16 text-white text-xl pl-[30]" 
          onChangeText={(text) => {onPassChangeText(text)}}
          placeholder="Password"
          placeholderTextColor="#aaaaaa"
          secureTextEntry={true}
          value={password}
          />
        </View>
        <View className="flex-1 w-3/4 justify-center">
          <TouchableOpacity className="bg-violet h-[60] rounded-full w-full items-center justify-center" onPress={() => {login(username, password, router)}}><Text className="font-bold text-white">Login</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

