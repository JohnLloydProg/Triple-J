import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
  return (
    <Tabs>
        <Tabs.Screen name="profile" options={{
            headerShown: false,
            title: 'Proile',
            }} />
    </Tabs>
  )
}

export default _layout