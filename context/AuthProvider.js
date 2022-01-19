import React, { useState, createContext, useEffect } from 'react'
import auth from '@react-native-firebase/auth';
import { AsyncStorage } from 'react-native';

export const AuthContext = createContext()
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState()
  const login = async (user) => {
    setLoading(true)
    setUser(user)
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setLoading(false)
  }
  const logout = async () => {
    setLoading(true)
    auth().signOut()
    setUser(null)
    await AsyncStorage.removeItem('user')
    await AsyncStorage.removeItem('preferance')
    await AsyncStorage.removeItem('background')
    setLoading(false)
  }
  const fetchUser = async () => {
    const u = await AsyncStorage.getItem('user')
    setUser(JSON.parse(u))
    setLoading(false)
  }
  useEffect(() => {
    fetchUser()
  }, [])
  return (
    <AuthContext.Provider value={{ loading, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
