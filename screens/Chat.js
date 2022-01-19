import React, { useContext, useEffect, useState, useCallback, createRef } from 'react'
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage'
import { GiftedChat, Send, InputToolbar, Bubble, Composer, MessageImage, Day } from 'react-native-gifted-chat'
import { AuthContext } from '../context/AuthProvider'
import { IconButton, Colors, Text, FAB, ActivityIndicator, useTheme } from 'react-native-paper'
import { StyleSheet, View, Linking, Image, Keyboard, BackHandler, ImageBackground } from 'react-native'
import { TouchableOpacity, Swipeable } from 'react-native-gesture-handler'
import { EmojiKeyboard } from 'rn-emoji-keyboard';
import { launchImageLibraryAsync, launchCameraAsync } from 'expo-image-picker'
import { getDocumentAsync } from 'expo-document-picker'
import { DisplayContext } from '../context/DisplayProvider';

export default function Chat({ navigation, route }) {
  const { user } = useContext(AuthContext)
  const { background } = useContext(DisplayContext)
  const { title, thread } = route.params
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [reply, setReply] = useState()
  const [show, setShow] = useState(false)
  const [visible, setVisible] = useState(false)
  const gcRef = createRef()
  const theme = useTheme()
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
    reply && Object.keys(reply).forEach(key => reply[key] === undefined && delete reply[key])
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
  const Loading = () => (
    <View style={styles(theme).loading}>
      <ActivityIndicator size='large' color={Colors.grey200} />
    </View>
  )
  const renderCustomView = (props) => (
    <>
      {
        props.currentMessage.reply &&
        <View style={styles(theme).row}>
          <View style={styles(theme).bar} />
          <View style={styles(theme).reply}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles(theme).username}>{props.currentMessage.reply.user === user.uid ? 'You' : title}</Text>
              <Text style={{ fontSize: 12 }}>
                {
                  props.currentMessage.reply.message ? props.currentMessage.reply.message :
                    props.currentMessage.reply.name ? props.currentMessage.reply.name :
                      'Photo'
                }
              </Text>
            </View>
            {
              props.currentMessage.reply.image &&
              <Image style={styles(theme).replyImage} source={{ uri: props.currentMessage.reply.image }} />
            }
          </View>
        </View>
      }
      {
        props.currentMessage.document &&
        <TouchableOpacity onPress={() => openDocument(props.currentMessage.document)}>
          <View style={styles(theme).document}>
            <IconButton icon={props.currentMessage.name.split('.')[1] == 'pdf' ? 'file-pdf' : 'file-document'} style={{ margin: -5 }} />
            <Text>{props.currentMessage.name}</Text>
          </View>
        </TouchableOpacity>

      }
      {
        props.currentMessage.loading && <Loading />
      }
    </>
  )
  const renderMessageImage = (props) => (
    <>
      <MessageImage {...props} imageStyle={{ marginBottom: -16, width: 200, height: 300 }} />
      {
        props.currentMessage.loading && <Loading />
      }
    </>
  )
  const renderChatFooter = () => (
    <>
      {
        reply &&
        <View style={styles(theme).chatFooter}>
          <View style={styles(theme).bar} />
          <View style={{ ...styles(theme).reply, backgroundColor: theme.colors.background }}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles(theme).username}>{reply.user === user.uid ? 'You' : title}</Text>
              <Text style={{ fontSize: 12 }}>
                {
                  reply.message ? reply.message :
                    reply.name ? reply.name :
                      'Photo'
                }
              </Text>
            </View>
            {
              reply.image &&
              <Image style={styles(theme).replyImage} source={{ uri: reply.image }} />
            }
          </View>
          <IconButton icon='close' onPress={() => setReply(null)} />
        </View>
      }
    </>
  )
  const renderBubble = (props) => (
    <Swipeable
      renderLeftActions={() => <IconButton icon='reply' />}
      onSwipeableLeftOpen={() => { setReply({ message: props.currentMessage.text, user: props.currentMessage.user._id, image: props.currentMessage.image, document: props.currentMessage.document, name: props.currentMessage.name }) }}>
      <Bubble {...props}
        wrapperStyle={{ right: styles(theme).wrapperRight, left: styles(theme).wrapperLeft }}
        textStyle={{ right: styles(theme).text, left: styles(theme).text }}
        renderCustomView={renderCustomView}
      />
    </Swipeable>
  )
  const renderSend = (props) => (
    <Send {...props} containerStyle={styles(theme).send}>
      <IconButton icon='send-circle' size={50} color={Colors.green800} />
    </Send>
  )
  const renderComposer = (props) => (
    <View style={{ flexGrow: 1, flexShrink: 1 }}>
      <Composer {...props} textInputStyle={styles(theme).composer} />
      <IconButton style={styles(theme).attachmentIcon} color={Colors.grey500} icon='attachment' onPress={() => { Keyboard.dismiss(); setVisible(!visible) }} />
    </View>
  )
  const sendImage = async (type, reply = null) => {
    setVisible(false)
    reply && Object.keys(reply).forEach(key => reply[key] === undefined && delete reply[key])
    let _image
    if (type === 'camera') _image = await launchCameraAsync({
      allowsEditing: true,
    })
    else _image = await launchImageLibraryAsync({
      allowsEditing: true,
    })
    if (!_image.cancelled) {
      let msg = {
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          phoneNumber: user.phoneNumber
        },
        reply: reply
      }
      setReply(null)
      setMessages([{ ...msg, image: _image.uri, loading: true, _id: new Date().getTime().toString() }, ...messages])
      const storageRef = storage().ref(new Date().getTime().toString())
      const file = await fetch(_image.uri)
      const blob = await file.blob()
      await storageRef.put(blob)
      const url = await storageRef.getDownloadURL()
      msg.image = url
      await firestore().collection('threads').doc(thread._id).collection('messages').add(msg)
      await firestore().collection('threads').doc(thread._id).update({
        latestMessage: {
          text: 'Photo',
          createdAt: new Date().getTime()
        }
      })

    }
    setReply(null)
  }
  const sendDocument = async (reply = null) => {
    reply && Object.keys(reply).forEach(key => reply[key] === undefined && delete reply[key])
    setVisible(false)
    const _document = await getDocumentAsync({
      copyToCacheDirectory: false,
    })
    if (_document.type === 'success') {
      let msg = {
        name: _document.name,
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          phoneNumber: user.phoneNumber
        },
        reply: reply
      }
      setReply(null)
      setMessages([{ ...msg, document: _document.uri, name: _document.name, loading: true, _id: new Date().getTime().toString() }, ...messages])
      const storageRef = storage().ref(new Date().getTime().toString())
      const file = await fetch(_document.uri)
      const blob = await file.blob()
      await storageRef.put(blob)
      const url = await storageRef.getDownloadURL()
      msg.document = url
      await firestore().collection('threads').doc(thread._id).collection('messages').add(msg)
      await firestore().collection('threads').doc(thread._id).update({
        latestMessage: {
          text: _document.name,
          createdAt: new Date().getTime()
        }
      })
    }
    setReply(null)
  }
  const openDocument = async (document) => {
    try {
      const url = `https://drive.google.com/viewerng/viewer?embedded=true&url=${document}`
      const supported = await Linking.canOpenURL(url)
      if (supported) return Linking.openURL(url)
      else alert('opening this type of file is not supported in your phone')
    } catch ({ message }) {
      alert(message)
    }
  }
  const renderActions = (props) => (
    <View {...props} style={styles(theme).actions}>
      {show ? <IconButton icon='keyboard-outline' color={Colors.grey400} onPress={() => { setShow(false); gcRef.current.focusTextInput(); }} /> :
        <IconButton icon='emoticon-outline' color={Colors.grey400} onPress={() => { Keyboard.dismiss(); setShow(true); }} />}
    </View>
  )
  const renderInputToolbar = (props) => (
    <InputToolbar {...props}
      containerStyle={styles(theme).inputToolbar}
      renderSend={renderSend}
      renderComposer={renderComposer}
      renderActions={renderActions}
    />
  )
  const renderDay = props => {
    return <Day {...props} wrapperStyle={styles(theme).wrapperDay} textStyle={styles(theme).text} />
  }
  const scrollToBottomComponent = () => (
    <IconButton icon='chevron-double-down' size={25} color={theme.dark ? Colors.grey900 : Colors.grey500} />
  )
  return (<ImageBackground source={{ uri: background }} style={{ flex: 1, justifyContent: 'center', resizeMode: 'cover' }}>
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
      renderDay={renderDay}
      timeTextStyle={{ left: styles(theme).timeText, right: styles(theme).timeText }}
      text={text}
      onInputTextChanged={(text) => setText(text)}
      textInputProps={{ onFocus: () => setShow(false) }}
      renderChatFooter={renderChatFooter}
      ref={gcRef}
      renderMessageImage={renderMessageImage}
      listViewProps={{ style: { backgroundColor: 'transparent' } }}
    />
    <EmojiKeyboard containerStyles={{ display: show ? 'flex' : 'none', backgroundColor: theme.colors.background, borderRadius: 0 }} backdropColor={theme.colors.backdrop} categoryColor={theme.colors.text} categoryPosition='bottom' onEmojiSelected={e => setText(prevText => prevText + e.emoji)} />
    <FAB visible={visible} style={{ position: "absolute", bottom: 60, right: 90 }} icon='camera' onPress={() => sendImage('camera', reply)} />
    <FAB visible={visible} style={{ position: "absolute", bottom: 140, right: 90 }} icon='image' onPress={() => sendImage('library', reply)} />
    <FAB visible={visible} style={{ position: "absolute", bottom: 220, right: 90 }} icon='file' onPress={() => sendDocument(reply)} />
  </ImageBackground>
  )
}
const styles = theme => StyleSheet.create({
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
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 35
  },
  wrapperRight: {
    backgroundColor: theme.dark ? Colors.green900 : Colors.green500
  },
  wrapperLeft: {
    backgroundColor: theme.dark ? Colors.blueGrey900 : Colors.blueGrey100
  },
  wrapperDay: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 10
  },
  text: {
    marginBottom: 0,
    fontFamily: 'Quicksand',
    color: theme.colors.text
  },
  timeText: {
    fontFamily: 'Quicksand',
    color: theme.colors.text
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
    marginBottom: 0,
    flexDirection: 'row'
  },
  reply: {
    flexGrow: 1,
    padding: 5,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  loading: {
    position: 'absolute',
    borderRadius: 15,
    top: 0,
    bottom: -20,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000055'
  },
  replyImage: {
    width: 40,
    height: 40,
    borderRadius: 3
  },
  document: {
    margin: 5,
    marginBottom: 0,
    padding: 10,
    paddingLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00000022',
    width: 'auto',
    borderRadius: 5
  },
  attachmentIcon: {
    position: 'absolute',
    right: 5,
    bottom: 0,
    zIndex: 10,
    transform: [{ rotate: '135deg' }]
  }
})