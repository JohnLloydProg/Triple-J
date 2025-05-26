import { Text, View, Dimensions} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView } from 'expo-camera'
import Ionicons from '@expo/vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'

async function customFetch(url: string, body: any, method: string = 'POST') {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json;",
      "Authorization": `Bearer ${await AsyncStorage.getItem('access')}`,
    },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  }).then(response => {
    if (!response.ok) {
      fetch("https://triple-j.onrender.com/api/account/token/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;",
        },
        body: JSON.stringify({
          refresh: AsyncStorage.getItem('refresh'),
        }),
        credentials: 'same-origin',
      }).then(refreshResponse => {
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }
        return refreshResponse.json();
      }).then (refreshData => {
        AsyncStorage.setItem('access', refreshData['access']);
        customFetch(url, body, method);
      });
    }
    return response.json();
  }).then(data => {
    return data;
  });
  
  return response;
}

export async function scan(event:any, setName:CallableFunction, setMembership:CallableFunction, setExpiry:CallableFunction, setReminder:CallableFunction) {
  console.log(event.data);
  
  if (event.data) {
    const responseData = await customFetch("https://triple-j.onrender.com/api/attendance/logging", {"qrCode": event.data}, 'POST');
    console.log(responseData);
    if (responseData === "Successfuly logged out") {
      setReminder("Have a good day!");
    }else {
      setName(responseData['name']);
      setMembership(responseData['type']);
      if (responseData['paid']) {
        setReminder("Your membership is still active!");
      }else {
        setReminder("Pay your overdue membership!");
      }
      if (responseData['expiry']) {
        setExpiry(responseData['expiry']);
      }
    }
  }
  
}

export default function Profile() {
  const camera_width = Dimensions.get('window').width * 0.75;
  const [name, setName] = React.useState("");
  const [membershipType, setMembershipType] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cooldown, setCooldown] = React.useState(false);
  const [counter, setCounter] = React.useState(0);
  const [reminder, setReminder] = React.useState("");


  return (
    <SafeAreaView className="flex-1 bg-primary pb-16 items-center">
        <View className="w-full h-16 bg-secondary flex-row justify-center items-center">
          <Text className="text-3xl text-accent font-keaniaOne_regular">Triple J</Text>
        </View>
        <View className="justify-center items-center w-3/4">
          <Text className="text-4xl text-center align-middle text-accent h-48">Place the QR Code within the boundary</Text>
        </View>
        <CameraView
          style={{ width: camera_width, height: camera_width, borderRadius: 20 }}
          facing='front'
          onBarcodeScanned={(event) => {
            if (!cooldown) {
              setCounter(counter + 1);
              scan(event, setName, setMembershipType, setExpiry, setReminder);
              setCooldown(true);
              setTimeout(() => {
                setCooldown(false);
              }, 1500);
            }
          }}
        />
        <View className='flex-1 justify-center items-start bg-secondary rounded-2xl w-3/4 mt-[10] mb-[10] p-4'>
          <View className='flex-row'>
            <Ionicons name='person' size={32} color='white'/>
            <Text className='text-xl text-white ml-[10] align-bottom'>Scanned Account Info</Text>
          </View>
          <View className='flex-1 justify-center items-start mt-[10] border-t border-white w-full'>
            <Text className='text-lg text-white'>Name: {name}</Text>
            <Text className='text-lg text-white'>Membership Type: {membershipType}</Text>
            <Text className='text-lg text-white'>Membership Expiry: {expiry}</Text>
            <Text className='text-xl text-accent'>{reminder}</Text>
          </View>
        </View>
    </SafeAreaView>
  )
}