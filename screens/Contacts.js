import React, { useContext, useState } from 'react'
import firestore from '@react-native-firebase/firestore';
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { List, Avatar, Divider, Colors, useTheme } from 'react-native-paper'
import { AuthContext } from '../context/AuthProvider'
import { UserContext } from '../context/UserProvider'
import { ThreadContext } from '../context/ThreadProvider'

export default function Contacts({ navigation }) {
  const { user } = useContext(AuthContext)
  const users = useContext(UserContext)
  const threads = useContext(ThreadContext)
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  async function getThread(item) {
    setLoading(true)
    let thread
    threads.forEach(t => {
      if (t.members.includes(item.uid) && t.members.includes(user.uid)) thread = t
    })
    if (!thread) {
      const t = await firestore().collection('threads').add({
        members: [item.uid, user.uid]
      })
      thread = { _id: t.id, members: [item.uid, user.uid] }
    }
    navigation.navigate('Chat', { title: item.displayName, user: item, thread })
  }
  return (
    <View style={styles(theme).screen}>
      {users &&
        <FlatList
          data={users.filter(u => u.uid !== user.uid)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => getThread(item)} disabled={loading}>
              <List.Item
                title={item.displayName}
                description={item.phoneNumber !== item.displayName ? item.phoneNumber : null}
                left={props => <Avatar.Image size={50} style={styles(theme).avatar} source={{ uri: item.photoUrl }} />}
              />
              <Divider inset={30} />
            </TouchableOpacity>
          )}
        />
      }
    </View>
  )
}
const styles = theme => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  avatar: {
    backgroundColor: Colors.grey200
  }
})

