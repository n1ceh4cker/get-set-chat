import React, { useContext } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors, FAB, List, Avatar, Divider, useTheme } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { AuthContext } from '../context/AuthProvider'
import { UserContext } from '../context/UserProvider'
import { ThreadContext } from '../context/ThreadProvider'

export default function Home({ navigation }) {
  const { user } = useContext(AuthContext)
  const users = useContext(UserContext)
  const threads = useContext(ThreadContext)
  const theme = useTheme()
  return (
    <View style={styles(theme).screen}>
      {threads && users &&
        <FlatList
          data={threads.filter(thread => thread.members.includes(user.uid))}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const member = item.members.filter(m => m !== user.uid)[0]
            const u = users.filter(user => user.uid === member)[0]
            return (
              <TouchableOpacity onPress={() => navigation.navigate('Chat', { title: u.displayName, user: u, thread: item })}>
                <List.Item
                  title={u.displayName}
                  description={item?.latestMessage?.text}
                  left={props => <Avatar.Image {...props} size={50} style={styles(theme).avatar} source={{ uri: u.photoUrl }} />}
                />
                <Divider inset={30} />
              </TouchableOpacity>
            )
          }}
        />
      }
      <FAB icon='android-messages'
        color={Colors.white}
        style={styles(theme).fab}
        onPress={() => navigation.navigate('Contacts', { title: 'Choose contacts' })} />
    </View>
  )
}
const styles = theme => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 15,
    backgroundColor: theme.dark ? Colors.green700 : Colors.greenA400
  },
  avatar: {
    backgroundColor: Colors.grey200
  }
})
