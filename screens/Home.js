import React, { useContext } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors, FAB, List, Avatar, Divider } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { AuthContext } from '../context/AuthProvider'
import { UserContext } from '../context/UserProvider'
import { ThreadContext } from '../context/ThreadProvider'

export default function Home({ navigation }) {
  const { user } = useContext(AuthContext)
  const users = useContext(UserContext)
  const threads = useContext(ThreadContext)
  return (
    <View style={styles.screen}>
      {threads && users &&
        <FlatList
          data={threads.filter(thread => thread.members.includes(user.uid))}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const member = item.members.filter(m => m !== user.uid)[0]
            const u = users.filter(user => user.uid === member)[0]
            return (
              <TouchableOpacity onPress={() => navigation.navigate('Chat', { title: u.displayName, photoUrl: u.photoUrl, thread: item })}>
                <List.Item
                  title={u.displayName}
                  description={item?.latestMessage?.text}
                  left={props => <Avatar.Image {...props} size={50} style={styles.avatar} source={{ uri: u.photoUrl }} />}
                />
                <Divider inset={30} />
              </TouchableOpacity>
            )
          }}
        />
      }
      <FAB icon='android-messages'
        color={Colors.white}
        style={styles.fab}
        onPress={() => navigation.navigate('Contacts', { title: 'Choose contacts' })} />
    </View>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 15,
    backgroundColor: Colors.greenA400
  },
  avatar: {
    backgroundColor: Colors.grey200
  }
})
