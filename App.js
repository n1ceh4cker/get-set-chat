import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthProvider';
import { UserProvider } from './context/UserProvider';
import { ThreadProvider } from './context/ThreadProvider';
import Navigator from './navigation/Navigator';
import { DisplayProvider } from './context/DisplayProvider';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ThreadProvider>
          <DisplayProvider>
            <Navigator />
            <StatusBar style='light' />
          </DisplayProvider>
        </ThreadProvider>
      </UserProvider>
    </AuthProvider>
  )
}
