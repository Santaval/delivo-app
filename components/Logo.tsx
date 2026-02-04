import React from 'react'
import { Image, View } from 'react-native'

export default function Logo() {
  return (
    <View>
      <Image source={require('@/assets/images/logo.png')} style={{ width: 200, height: 200 }} />
    </View>
  )
}