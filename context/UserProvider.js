import React, { useState, useEffect, createContext } from 'react'
import firestore from '@react-native-firebase/firestore';

export const UserContext = createContext()
export function UserProvider({ children }) {
  const [users, setUsers] = useState()
  useEffect(() => {
    const userListener = firestore().collection('users').onSnapshot(querySnapshot => {
      const users = querySnapshot.docs.map(doc => {
        const u = doc.data()
        u.uid = doc.id
        return u
      })
      setUsers(users)
    })
    return userListener
  }, [])
  return (
    <UserContext.Provider value={users}>
      {children}
    </UserContext.Provider>
  )
}

