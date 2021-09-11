import React, { useContext, useState } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { Avatar, List, Banner, IconButton, TextInput, useTheme, FAB, Colors } from 'react-native-paper'
import { AuthContext } from '../context/AuthProvider'
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import { launchImageLibraryAsync } from 'expo-image-picker'

export default function Profile({ navigation }) {
  const { user, setUser } = useContext(AuthContext)
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
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
  }
  return (
    <View style={styles.screen}>
      <View style={styles.center}>
        <Avatar.Image size={150} source={{ uri: user.photoUrl }} style={styles.avatar} />
        <FAB icon='camera' onPress={updateImage} style={styles.fab} />
      </View>
      <List.Section>
        <List.Item
          title="Name"
          description={user.displayName}
          left={props => <List.Icon icon='account' />}
          right={props => <IconButton icon='pencil' onPress={() => setVisible(true)} />}
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
            style={styles.input}
            placeholder='Enter your name'
            value={name}
            onChangeText={(text) => setName(text)}
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
const styles = StyleSheet.create({
  screen: {
    display: 'flex',
    marginTop: StatusBar.currentHeight,
    padding: 5
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