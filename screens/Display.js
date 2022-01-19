import React, { useContext } from 'react'
import { View, StyleSheet, StatusBar, AsyncStorage, Image, ScrollView, FlatList, TouchableOpacity, ToastAndroid } from 'react-native'
import { useTheme, Headline, RadioButton, Text, Subheading, Button, Title } from 'react-native-paper'
import { DisplayContext } from '../context/DisplayProvider'

export default function Display({ navigation, route }) {
  const theme = useTheme()
  const { preferance, setBackground, changeAppearance } = useContext(DisplayContext)
  const changeMode = async (val) => {
    await AsyncStorage.setItem('preferance', val)
    changeAppearance()
    ToastAndroid.show('Theme changed', ToastAndroid.SHORT)
  }
  const changeBackground = async (val) => {
    await AsyncStorage.setItem('background', val)
    setBackground(val)
    ToastAndroid.show('Background changed', ToastAndroid.SHORT)
  }
  const defaultBackground = async () => {
    await AsyncStorage.removeItem('background')
    changeAppearance()
    ToastAndroid.show('Background changed to default', ToastAndroid.SHORT)
  }
  const darkImages = ['asset:/images/dark_1.jpeg', 'asset:/images/dark_2.jpeg', 'asset:/images/dark_3.jpeg', 'asset:/images/dark_4.jpeg', 'asset:/images/dark_5.jpeg', 'asset:/images/dark_6.jpeg']
  const lightImages = ['asset:/images/light_1.jpeg', 'asset:/images/light_2.jpeg', 'asset:/images/light_3.jpeg', 'asset:/images/light_4.jpeg', 'asset:/images/light_5.jpeg', 'asset:/images/light_6.jpeg']
  return (
    <ScrollView style={styles(theme).screen}>
      <Headline style={{ marginVertical: 10 }}>Theme</Headline>
      <RadioButton.Group onValueChange={changeMode} value={preferance}>
        <View style={styles(theme).radio}>
          <RadioButton value='system' />
          <Text>System Default</Text>
        </View>
        <View style={styles(theme).radio}>
          <RadioButton value='light' />
          <Text>Light</Text>
        </View>
        <View style={styles(theme).radio}>
          <RadioButton value='dark' />
          <Text>Dark</Text>
        </View>
      </RadioButton.Group>
      <Headline style={{ marginVertical: 15 }}>Wallpaper</Headline>
      <Title style={{ marginBottom: 10 }}>Bright</Title>
      <FlatList
        data={lightImages}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity style={styles(theme).bg} onPress={() => changeBackground(item)}>
              <Image source={{ uri: item }} style={styles(theme).image} />
            </TouchableOpacity>
          )
        }}
      />
      <Title style={{ marginBottom: 10, marginTop: 20 }}>Dark</Title>
      <FlatList
        data={darkImages}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity style={styles(theme).bg} onPress={() => changeBackground(item)}>
              <Image source={{ uri: item }} style={styles(theme).image} />
            </TouchableOpacity>
          )
        }}
      />

      <Button mode='contained' onPress={defaultBackground} style={{ marginBottom: 25, marginTop: 10 }}>Default Wallpaper</Button>
    </ScrollView>
  )
}
const styles = theme => StyleSheet.create({
  screen: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.colors.background
  },
  bg: {
    width: '32%',
    height: 200,
    margin: 3
  },
  image: {
    width: '100%',
    height: '100%'
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})