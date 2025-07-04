import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DefaultScreen from '../screens/DefaultScreen';
import PrepareScreen from '../screens/PrepareScreen';
import QuestionScreen from '../screens/QuestionScreen';
import AdminScreen from '../screens/AdminScreen';
import { RootStackParamList } from './types';
import { usePlayerState } from '../hooks/usePlayerState';
import { useWebSocketContext } from '../context/WebSocketContext';
import { iQuizSate } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const { playerData, refetchPlayer } = usePlayerState();
  const { quizState, status: wsStatus } = useWebSocketContext();

  // Handle navigation based on WebSocket state
  useEffect(() => {
    if (!navigationRef.current?.isReady()) return;
    if (!playerData || !quizState) return;
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    
    if (playerData.isActive === false) {
      console.log('Player is not active, navigating to Default screen');
      if (currentRoute !== 'Default') {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'Default' }],
        });
      }
      return;
    } else if (playerData.isActive === true ) {

      switch (quizState?.state) {
        case 'QUESTION_PRE':
          if (currentRoute !== 'Prepare') {
            console.log('Navigating to Prepare screen');
            navigationRef.current?.navigate('Prepare');
            // navigationRef.current?.reset({
            //   index: 1,
            //   routes: [{
            //     name: 'Prepare',
            //     params: {
            //       timestamp: Date.now(),
            //       tierNumber: quizState.tierNumber,
            //       state: quizState.state
            //     }
            //   }],
            // });
          }
          break;
  
        case 'QUESTION_OPEN':
        case 'BUYOUT_OPEN':
          if (currentRoute !== 'Question') {
            console.log('Resetting to Question screen to force remount');
            navigationRef.current?.reset({
              index: 2,
              routes: [{
                name: 'Question',
                params: {
                  timestamp: Date.now(),
                  tierNumber: quizState.tierNumber,
                  state: quizState.state
                }
              }],
            });
          }
          break;
  
        case 'IDLE':
        case 'QUESTION_CLOSED':
        case 'QUESTION_COMPLETE':
        case 'BUYOUT_COMPLETE':
          refetchPlayer(); // Ensure player data is up-to-date
          if (currentRoute !== 'Default') {
            console.log('Resetting to Default screen');
            navigationRef.current?.reset({
              index: 0,
              routes: [{ name: 'Default' }],
            });
          }
          break;
  
        default:
          console.log('No navigation change for state:', quizState?.state);
      }
    }


  }, [quizState, playerData]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Default"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1a1a1a' },
        }}
      >
        <Stack.Screen name="Default" component={DefaultScreen} />
        <Stack.Screen name="Prepare" component={PrepareScreen} />
        <Stack.Screen
          name="Question"
          component={QuestionScreen}
        />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
