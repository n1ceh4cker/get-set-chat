import React, { useState, useContext, useRef } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TextInput, Button, Colors, Caption, Divider, Headline, Subheading } from 'react-native-paper';
import { ToastAndroid, View, StyleSheet, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthProvider';

export default function Auth({ navigation }) {
  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('')
  const { login } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber('+91' + phoneNumber);
    setConfirm(confirmation);
  }

  async function confirmCode() {
    try {
      setLoading(true)
      const u = await confirm.confirm(code);
      const documentSnapshot = await firestore().collection('users').doc(u.user.uid).get()
      if (!documentSnapshot.exists) {
        const user = {
          phoneNumber: u.user.phoneNumber,
          displayName: u.user.phoneNumber,
          photoUrl: 'https://www.nicepng.com/png/detail/128-1280406_view-user-icon-png-user-circle-icon-png.png'
        }
        await firestore().collection('users').doc(u.user.uid).set(user)
        user.uid = u.user.uid
        login(user)
      }
      else {
        const user = documentSnapshot.data()
        user.uid = documentSnapshot.id
        login(user)
      }
    } catch (error) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
      setLoading(false)
    }
  }
  const signInWithPhone = async () => {
    try {
      if (phoneNumber.length !== 10)
        throw new Error('Please provide valid phone number')
      setLoading(true)
      await signInWithPhoneNumber(phoneNumber)
      setLoading(false)
    } catch (error) {
      ToastAndroid.show(error.message, ToastAndroid.LONG)
      setLoading(false)
    }
  }
  if (!confirm) {
    return (
      <View style={styles.screen}>
        <Headline style={styles.headline}>Verify your phone number</Headline>
        <Subheading style={styles.text}>GetSetChat will send a one time SMS message to verify your phone number.</Subheading>
        <Divider />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={text => setPhoneNumber(text)}
          keyboardType='phone-pad'
          maxLength={10}
          left={<TextInput.Affix text='+91' textStyle={{ marginRight: 10 }} />}
        />
        <Button mode='contained' disabled={loading} onPress={() => signInWithPhone()}>Next</Button>
        <Caption>Carrier SMS charges may apply.</Caption>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Headline style={styles.headline}>Verify {phoneNumber}?</Headline>
      <TextInput
        value={code}
        onChangeText={text => setCode(text)}
        keyboardType='numeric'
        style={{ ...styles.input, ...styles.text }}
        maxLength={6}
      />
      <Caption>Enter 6 digit code</Caption>
      <Button mode='contained' disabled={loading} onPress={() => confirmCode()} >Confirm Code</Button>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    display: 'flex',
    alignItems: 'center',
    marginTop: StatusBar.currentHeight
  },
  headline: {
    color: Colors.green500
  },
  text: {
    textAlign: 'center'
  },
  input: {
    backgroundColor: 'transparent',
    width: '80%',
    marginBottom: 10,
  }
})
