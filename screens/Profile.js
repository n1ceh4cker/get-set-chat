import React, { useContext, useState } from 'react'
import { View, StyleSheet, AsyncStorage } from 'react-native'
import { Avatar, List, Banner, IconButton, TextInput, useTheme, FAB, Colors } from 'react-native-paper'
import { AuthContext } from '../context/AuthProvider'
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import { launchImageLibraryAsync } from 'expo-image-picker'

export default function Profile({ navigation }) {
  const { user, setUser } = useContext(AuthContext)
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
  const [visible1, setVisible1] = useState(false)
  const [about, setAbout] = useState('')
  const theme = useTheme()
  async function updateImage() {
    const _image = await launchImageLibraryAsync({
      allowsEditing: true
    })
    if (!_image.cancelled) {
      const storageRef = storage().ref(new Date().getTime().toString())
      await storageRef.putFile(_image.uri)
      const url = await storageRef.getDownloadURL()
      await firestore().collection('users').doc(user.uid).update({
        photoUrl: url
      })
      const snapshot = await firestore().collection('users').doc(user.uid).get()
      const u = snapshot.data()
      u.uid = snapshot.id
      setUser(u)
      await AsyncStorage.setItem('user', JSON.stringify(u))
    }
  }
  async function updateName() {
    await firestore().collection('users').doc(user.uid).update({
      displayName: name
    })
    const snapshot = await firestore().collection('users').doc(user.uid).get()
    const u = snapshot.data()
    u.uid = snapshot.id
    setUser(u)
    await AsyncStorage.setItem('user', JSON.stringify(u))
  }
  async function updateAbout() {
    await firestore().collection('users').doc(user.uid).update({
      about: about
    })
    const snapshot = await firestore().collection('users').doc(user.uid).get()
    const u = snapshot.data()
    u.uid = snapshot.id
    setUser(u)
    await AsyncStorage.setItem('user', JSON.stringify(u))
  }

  return (
    <View style={styles(theme).screen}>
      <View style={styles(theme).center}>
        <Avatar.Image size={150} source={{ uri: user.photoUrl }} style={styles(theme).avatar} />
        <FAB icon='camera' onPress={updateImage} style={styles(theme).fab} />
      </View>
      <List.Section>
        <List.Item
          title="Name"
          description={user.displayName}
          left={props => <List.Icon icon='account' />}
          right={props => <IconButton icon='pencil' onPress={() => { setVisible1(false); setVisible(true) }} />}
        />
        <Banner
          visible={visible}
          actions={[
            {
              label: 'Cancel',
              onPress: () => setVisible(false)
            },
            {
              label: 'Save',
              onPress: () => { setVisible(false); updateName() }
            }
          ]}
          contentStyle={{ backgroundColor: theme.colors.background }}
        >

          <TextInput
            style={styles(theme).input}
            placeholder='Enter your name  '
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </Banner>
        <List.Item
          title="About"
          description={user.about}
          left={props => <List.Icon icon='alert-circle' />}
          right={props => <IconButton icon='pencil' onPress={() => { setVisible(false); setVisible1(true) }} />}
        />
        <Banner
          visible={visible1}
          actions={[
            {
              label: 'Cancel',
              onPress: () => setVisible1(false)
            },
            {
              label: 'Save',
              onPress: () => { setVisible1(false); updateAbout() }
            }
          ]}
          contentStyle={{ backgroundColor: theme.colors.background }}
        >

          <TextInput
            style={styles(theme).input}
            placeholder='Tell something about you  '
            value={about}
            onChangeText={(text) => setAbout(text)}
          />
        </Banner>
        <List.Item
          title="Phone"
          description={user.phoneNumber}
          left={props => <List.Icon icon='phone' />}
        />
      </List.Section>
    </View>
  )
}
const styles = theme => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 10
  },
  center: {
    alignSelf: 'center'
  },
  input: {
    backgroundColor: 'transparent',
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0
  },
  avatar: {
    backgroundColor: Colors.grey200
  }
})