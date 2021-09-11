import React, { useState, useContext } from 'react'
import { Appbar, Colors, Menu, Avatar, Text, Subheading } from 'react-native-paper'
import { AuthContext } from '../context/AuthProvider'
import { View } from 'react-native'

export default function CustomNavigationBar({ navigation, previous, scene }) {
  const { route } = scene
  const [visible, setVisible] = useState(false)
  const { logout } = useContext(AuthContext)
  return (
    <Appbar.Header>
      {previous && <Appbar.BackAction onPress={() => navigation.navigate('Home')} />}
      <Appbar.Content
        title={<View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {route.params?.photoUrl ? <Avatar.Image size={40} source={{ uri: route.params.photoUrl }} /> : null}
          <Subheading style={{ marginLeft: 10, color: Colors.grey100 }}>{route.params?.title || 'GetSetChat'}</Subheading>
        </View>} />
      {
        !previous &&
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={<Appbar.Action icon='dots-vertical' color={Colors.grey200} onPress={() => setVisible(true)} />}
        >
          <Menu.Item title='Profile' onPress={() => { setVisible(false); navigation.navigate('Profile') }} />
          <Menu.Item title='Logout' onPress={() => { setVisible(false); logout() }} />
        </Menu>
      }
    </Appbar.Header>
  )
}
