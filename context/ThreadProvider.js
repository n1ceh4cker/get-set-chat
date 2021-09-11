import React, { useState, useEffect, createContext } from 'react'
import firestore from '@react-native-firebase/firestore';

export const ThreadContext = createContext()
export function ThreadProvider({ children }) {
  const [threads, setThreads] = useState()
  useEffect(() => {
    const threadListener = firestore().collection('threads').onSnapshot(querySnapshot => {
      const threads = querySnapshot.docs.map(doc => {
        const thread = doc.data()
        thread._id = doc.id
        return thread
      })
      setThreads(threads)
    })
    return threadListener
  }, [])
  return (
    <ThreadContext.Provider value={threads}>
      {children}
    </ThreadContext.Provider>
  )
}

