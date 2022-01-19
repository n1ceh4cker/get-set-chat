import React, { useEffect } from 'react'
import { View, StyleSheet, Image, StatusBar, BackHandler } from 'react-native'
import { List, useTheme } from 'react-native-paper'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'

export default function UserInfo({ navigation, route }) {
  const { user } = route.params
  const theme = useTheme()
  useEffect(() => {
    const backAction = () => {
      navigation.goBack()
      return true
    }
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return backHandler.remove
  })
  return (
    <View style={styles(theme).screen}>
      <Image source={{ uri: user.photoUrl }} style={{ width: 'auto', height: 250 }} />
      <List.Section>
        <List.Item
          title="Name"
          description={user.displayName}
          left={props => <List.Icon icon='account' />}
        />

        <List.Item
          title="About"
          description={user.about}
          left={props => <List.Icon icon='alert-circle' />}
        />
        <List.Item
          title="Phone"
          description={user.phoneNumber}
          left={props => <List.Icon icon='phone' />}
        />
      </List.Section>
      <ExpoStatusBar style={theme.dark ? 'light' : 'dark'} />
    </View>
  )
}
const styles = theme => StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: theme.colors.background
  }
})