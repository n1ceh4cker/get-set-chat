import React, { useState, useEffect, createContext } from 'react'
import { Provider as PaperProvider, DefaultTheme, configureFonts, Colors, DarkTheme } from 'react-native-paper';
import { fontConfig } from '../config/fonts';
import { Appearance, AsyncStorage } from 'react-native'

export const DisplayContext = createContext()
export function DisplayProvider({ children }) {
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.green900
    },
    fonts: configureFonts(fontConfig)
  }
  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.green900,
      background: '#1a1a1a'
    },
    fonts: configureFonts(fontConfig)
  }
  const [preferance, setPreferance] = useState('system')
  const [background, setBackground] = useState('asset:/images/light_1.jpeg')
  const [theme, setTheme] = useState(lightTheme)
  const changeAppearance = async () => {
    const pref = await AsyncStorage.getItem('preferance')
    if (pref) setPreferance(pref)
    else setPreferance('system')
    if (pref && pref !== 'system') {
      pref === 'light' ? setTheme(lightTheme) : setTheme(darkTheme)
      pref === 'light' ? setBackground('asset:/images/light_default.jpeg') : setBackground('asset:/images/dark_default.jpeg')
    }
    else {
      Appearance.getColorScheme() === 'light' ? setTheme(lightTheme) : setTheme(darkTheme)
      Appearance.getColorScheme() === 'light' ? setBackground('asset:/images/light_default.jpeg') : setBackground('asset:/images/dark_default.jpeg')
    }

    const bg = await AsyncStorage.getItem('background')
    if (bg) setBackground(bg)
  }
  useEffect(() => {
    changeAppearance()
  }, [])
  return (
    <DisplayContext.Provider value={{ preferance, background, setBackground, changeAppearance }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </DisplayContext.Provider>
  )
}

