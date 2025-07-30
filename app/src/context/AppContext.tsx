import React, { createContext, useState, useEffect, useContext, ReactElement } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContextType } from '../types';
import i18n from '../i18n';
import { View } from 'react-native'; // Import View component only

const SEAT_NUMBER_KEY = 'app.seatNumber';
const SERVER_IP_KEY = 'app.serverIP';
const LOCALE_KEY = 'settings.lang'; // Same as in i18n

const defaultContextValues: AppContextType = {
  seatNumber: null,
  serverIP: '192.168.29.100',
  locale: 'uk',
  setSeatNumber: () => {},
  setServerIP: () => {},
  setLocale: () => {},
};

export const AppContext = createContext<AppContextType>(defaultContextValues);

// Update children type to only allow ReactElement (no text strings)
export const AppProvider: React.FC<{children: ReactElement}> = ({ children }) => {
  const [seatNumber, setSeatNumberState] = useState<number | null>(null);
  const [serverIP, setServerIPState] = useState<string | null>('192.168.29.100');
  const [locale, setLocaleState] = useState<'en' | 'uk'>('uk');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedSeat = await AsyncStorage.getItem(SEAT_NUMBER_KEY);
        const storedIP = await AsyncStorage.getItem(SERVER_IP_KEY);
        const storedLocale = await AsyncStorage.getItem(LOCALE_KEY);

        if (storedSeat) setSeatNumberState(parseInt(storedSeat, 10));
        if (storedIP) { setServerIPState(storedIP) } else {
          setServerIPState('192.168.29.100');
        }
        if (storedLocale) {
          const parsedLocale = storedLocale as 'en' | 'uk';
          setLocaleState(parsedLocale);
          i18n.changeLanguage(parsedLocale);
        } else {
          // If no locale is stored, use the one detected by i18next
          setLocaleState(i18n.language as 'en' | 'uk');
        }
      } catch (e) {
        console.error("Failed to load app context data from storage", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPersistedData();
  }, []);

  const handleSetSeatNumber = async (seat: number | null) => {
    setSeatNumberState(seat);
    if (seat !== null) {
      await AsyncStorage.setItem(SEAT_NUMBER_KEY, seat.toString());
    } else {
      await AsyncStorage.removeItem(SEAT_NUMBER_KEY);
    }
  };

  const handleSetServerIP = async (ip: string | null) => {
    setServerIPState(ip);
    if (ip) {
      await AsyncStorage.setItem(SERVER_IP_KEY, ip);
    } else {
      await AsyncStorage.removeItem(SERVER_IP_KEY);
    }
  };

  const handleSetLocale = async (newLocale: 'en' | 'uk') => {
    setLocaleState(newLocale);
    await AsyncStorage.setItem(LOCALE_KEY, newLocale);
    i18n.changeLanguage(newLocale);
  };

  // Enhanced loading state handler to ensure it properly renders in React Native
  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {/* Explicitly empty view */}
      </View>
    ); 
  }

  // Only accepts ReactElement children, not text strings
  return (
    <AppContext.Provider
      value={{
        seatNumber,
        serverIP,
        locale,
        setSeatNumber: handleSetSeatNumber,
        setServerIP: handleSetServerIP,
        setLocale: handleSetLocale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
