import React, { useState, useContext } from 'react'
import { Appbar, Colors, Menu, Avatar } from 'react-native-paper'
import { AuthContext } from '../context/AuthProvider'
import { TouchableOpacity } from 'react-native-gesture-handler'

export default function CustomNavigationBar({ navigation, previous, scene }) {
  const { route } = scene
  const [visible, setVisible] = useState(false)
  const { logout } = useContext(AuthContext)
  const pressHandler = (u) => {
    if (u) navigation.navigate('UserInfo', { user: u })
  }
  return (
    <Appbar.Header>
      {
        previous &&
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('Home')}>
          <Appbar.BackAction color={Colors.grey100} />
          {route.params?.user?.photoUrl ? <Avatar.Image size={40} source={{ uri: route.params.user.photoUrl }} /> : null}
        </TouchableOpacity>
      }
      <Appbar.Content
        title={route.params?.title || 'GetSetChat'}
        color={Colors.grey100}
        style={{ marginBottom: 5 }}
        onPress={() => pressHandler(route.params?.user)}
      />
      {
        !previous &&
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={<Appbar.Action icon='dots-vertical' color={Colors.grey200} onPress={() => setVisible(true)} />}
        >
          <Menu.Item title='Profile' onPress={() => { setVisible(false); navigation.navigate('Profile', { title: 'Profile' }) }} />
          <Menu.Item title='Display' onPress={() => { setVisible(false); navigation.navigate('Display', { title: 'Display' }) }} />
          <Menu.Item title='Logout' onPress={() => { setVisible(false); logout() }} />
        </Menu>
      }
    </Appbar.Header>
  )
}
