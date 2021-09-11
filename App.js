import React from 'react';
import { Provider as PaperProvider, DefaultTheme, configureFonts, Colors } from 'react-native-paper';
import { fontConfig } from './config/fonts';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthProvider';
import { UserProvider } from './context/UserProvider';
import { ThreadProvider } from './context/ThreadProvider';
import Navigator from './navigation/Navigator';


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.green900,
  },
  fonts: configureFonts(fontConfig)
}
export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ThreadProvider>
          <PaperProvider theme={theme}>
            <Navigator />
            <StatusBar backgroundColor='#00000033' style='light' />
          </PaperProvider>
        </ThreadProvider>
      </UserProvider>
    </AuthProvider>
  )
}
