import React, { useContext, useEffect, useState, useCallback } from 'react'
import firestore from '@react-native-firebase/firestore';
import { GiftedChat, Send, InputToolbar, Bubble, Composer } from 'react-native-gifted-chat'
import { AuthContext } from '../context/AuthProvider'
import { IconButton, Colors } from 'react-native-paper'
import { StyleSheet } from 'react-native'

export default function Chat({ naviation, route }) {
  const { user } = useContext(AuthContext)
  const thread = route.params.thread
  const [messages, setMessages] = useState([])
  useEffect(() => {
    const subscribe = firestore().collection('threads').doc(thread._id)
      .collection('messages').orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => {
          const msg = doc.data()
          msg._id = doc.id
          return msg
        })
        setMessages(messages)
      })
    return subscribe
  }, [])
  const onSend = useCallback(async (messages = []) => {
    const msg = {
      text: messages[0].text,
      createdAt: new Date().getTime(),
      user: {
        _id: user.uid,
        name: user.displayName
      }
    }
    await firestore().collection('threads').doc(thread._id).collection('messages').add(msg)
    await firestore().collection('threads').doc(thread._id).update({
      latestMessage: {
        text: messages[0].text,
        createdAt: new Date().getTime()
      }
    })
  }, [])
  const renderBubble = (props) => (
    <Bubble {...props}
      wrapperStyle={{ right: styles.wrapperRight, left: styles.wrapperLeft }}
      textStyle={{ right: styles.text, left: styles.text }}
    />
  )
  const renderSend = (props) => (
    <Send {...props} containerStyle={styles.send}>
      <IconButton icon='send-circle' size={50} color={Colors.green800} />
    </Send>
  )
  const renderComposer = (props) => (
    <Composer {...props} textInputStyle={styles.composer} />
  )
  const renderInputToolbar = (props) => (
    <InputToolbar {...props}
      containerStyle={styles.inputToolbar}
      renderSend={renderSend}
      renderComposer={renderComposer}
    />
  )
  const scrollToBottomComponent = () => (
    <IconButton icon='chevron-double-down' size={25} color={Colors.grey500} />
  )
  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: user.uid
      }}
      renderBubble={renderBubble}
      renderInputToolbar={renderInputToolbar}
      alwaysShowSend
      renderAvatar={null}
      scrollToBottom
      scrollToBottomComponent={scrollToBottomComponent}
      timeTextStyle={{ left: styles.timeText, right: styles.timeText }}
    />
  )
}
const styles = StyleSheet.create({
  inputToolbar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    marginBottom: 5
  },
  send: {
    display: 'flex',
    justifyContent: 'center'
  },
  composer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 10
  },
  wrapperRight: {
    backgroundColor: Colors.green500
  },
  wrapperLeft: {
    backgroundColor: Colors.grey300
  },
  text: {
    marginBottom: 0,
    fontFamily: 'Quicksand'
  },
  timeText: {
    fontFamily: 'Quicksand'
  }
})