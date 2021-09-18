import React, { useContext, useEffect, useState, useCallback, createRef } from 'react'
import firestore from '@react-native-firebase/firestore';
import { GiftedChat, Send, InputToolbar, Bubble, Composer } from 'react-native-gifted-chat'
import { AuthContext } from '../context/AuthProvider'
import { IconButton, Colors, Text } from 'react-native-paper'
import { StyleSheet, View, Keyboard, BackHandler } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler';
import { EmojiKeyboard } from 'rn-emoji-keyboard';

export default function Chat({ navigation, route }) {
  const { user } = useContext(AuthContext)
  const { title, thread } = route.params
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [reply, setReply] = useState()
  const [show, setShow] = useState(false)
  const gcRef = createRef()
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
  useEffect(() => {
    const backAction = () => {
      if (show) { setShow(false); return true }
      else { navigation.navigate('Home'); return true }
    }
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return backHandler.remove
  })
  const onSend = useCallback(async (messages = [], reply = null) => {
    const msg = {
      text: messages[0].text,
      createdAt: new Date().getTime(),
      user: {
        _id: user.uid,
        name: user.displayName
      },
      reply: reply
    }
    setReply(null)
    await firestore().collection('threads').doc(thread._id).collection('messages').add(msg)
    await firestore().collection('threads').doc(thread._id).update({
      latestMessage: {
        text: messages[0].text,
        createdAt: new Date().getTime()
      }
    })
  }, [])
  const renderCustomView = (props) => (
    <>
      {
        props.currentMessage.reply &&
        <View style={styles.row}>
          <View style={styles.bar} />
          <View style={styles.reply}>
            <Text style={styles.username}>{props.currentMessage.reply.user === user.uid ? 'You' : title}</Text>
            <Text>{props.currentMessage.reply.message}</Text>
          </View>
        </View>
      }
    </>
  )
  const renderChatFooter = () => (
    <>
      {
        reply &&
        <View style={styles.chatFooter}>
          <View style={styles.bar} />
          <View style={styles.reply}>
            <Text style={styles.username}>{reply.user === user.uid ? 'You' : title}</Text>
            <Text>{reply.message}</Text>
          </View>
          <IconButton icon='close' onPress={() => setReply(null)} />
        </View>
      }
    </>
  )
  const renderBubble = (props) => (
    <Swipeable
      renderLeftActions={() => <IconButton icon='reply' />}
      onSwipeableLeftOpen={() => { setReply({ message: props.currentMessage.text, user: props.currentMessage.user._id }) }}>
      <Bubble {...props}
        wrapperStyle={{ right: styles.wrapperRight, left: styles.wrapperLeft }}
        textStyle={{ right: styles.text, left: styles.text }}
        renderCustomView={renderCustomView}
      />
    </Swipeable>
  )
  const renderSend = (props) => (
    <Send {...props} containerStyle={styles.send}>
      <IconButton icon='send-circle' size={50} color={Colors.green800} />
    </Send>
  )
  const renderComposer = (props) => (
    <Composer {...props} textInputStyle={styles.composer} />
  )
  const renderActions = (props) => (
    <View {...props} style={styles.actions}>
      {show ? <IconButton icon='keyboard-outline' color={Colors.grey400} onPress={() => { setShow(false); gcRef.current.focusTextInput(); }} /> :
        <IconButton icon='emoticon-outline' color={Colors.grey400} onPress={() => { Keyboard.dismiss(); setShow(true); }} />}
    </View>
  )
  const renderInputToolbar = (props) => (
    <InputToolbar {...props}
      containerStyle={styles.inputToolbar}
      renderSend={renderSend}
      renderComposer={renderComposer}
      renderActions={renderActions}
    />
  )
  const scrollToBottomComponent = () => (
    <IconButton icon='chevron-double-down' size={25} color={Colors.grey500} />
  )
  return (<>
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages, reply)}
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
      text={text}
      onInputTextChanged={(text) => setText(text)}
      textInputProps={{ onFocus: () => setShow(false) }}
      renderChatFooter={renderChatFooter}
      ref={gcRef}
    />
    <EmojiKeyboard containerStyles={{ display: show ? 'flex' : 'none' }} categoryPosition='bottom' onEmojiSelected={e => setText(prevText => prevText + e.emoji)} />
  </>
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
    padding: 10,
    paddingStart: 35
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
  },
  chatFooter: {
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 10,
    marginHorizontal: 5
  },
  row: {
    margin: 5,
    width: '100%',
    marginBottom: -5,
    flexDirection: 'row'
  },
  reply: {
    flexGrow: 1,
    padding: 5,
    marginRight: 10,
    flexDirection: 'column',
    backgroundColor: '#00000022',
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10
  },
  username: {
    color: Colors.purple200,
    fontWeight: 'bold'
  },
  bar: {
    width: 5,
    height: 'auto',
    backgroundColor: Colors.pink400,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  actions: {
    position: 'absolute',
    left: 5,
    bottom: 0,
    zIndex: 10
  }
})