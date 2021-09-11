import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Colors } from 'react-native-paper'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import Home from '../screens/Home'
import Auth from '../screens/Auth'
import Contacts from '../screens/Contacts'
import Chat from '../screens/Chat'
import Profile from '../screens/Profile'
import { AuthContext } from '../context/AuthProvider'
import CustomNavigationBar from './CustomNavigationBar'

const Stack = createStackNavigator()

const HomeStack = () => (
  <Stack.Navigator
    initialRouteName='Home'
    screenOptions={{
      header: (props) => <CustomNavigationBar {...props} />,
    }}
  >
    <Stack.Screen name='Home' component={Home} />
    <Stack.Screen name='Contacts' component={Contacts} />
    <Stack.Screen name='Chat' component={Chat} />
  </Stack.Navigator>
)
export default function Navigator() {
  const { loading, user } = useContext(AuthContext)
  if (loading) return (
    <View style={styles.loading} >
      <ActivityIndicator color={Colors.green500} size='large' />
    </View>
  )
  else return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {
          user ?
            <>
              <Stack.Screen name='HomeStack' component={HomeStack} />
              <Stack.Screen name='Profile' component={Profile} />
            </> :
            <Stack.Screen name='Auth' component={Auth} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  )
}
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center'
  }
})
