import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { usePlayerState } from '../hooks/usePlayerState';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useTheme } from '../theme';
import { ConnectionStatus } from '../components/ConnectionStatus';

const logo = require('../assets/images/logo-ua-comp.png');

const DefaultScreen = () => {
  const { t } = useTranslation();
  const { seatNumber, serverIP } = useAppContext();
  const { playerData, isLoading, error, refetchPlayer } = usePlayerState();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Default'>>();
  const { theme } = useTheme();

  // Use both WebSocket and SSE contexts
  const { status: wsStatus, quizState: wsQuizState, setQuizState, errorDetails } = useWebSocketContext();

  // For now, prioritize WebSocket for quiz state since SSE only provides timer state
  const quizState = useMemo(() => {
    // Currently only WebSocket provides quiz state
    if (wsStatus === 'connected' && wsQuizState) {
      return wsQuizState;
    }
    return null;
  }, [wsStatus, wsQuizState]);

  // Create styles using theme
  const styles = StyleSheet.create({
    container: {
      ...theme.components.container,
      justifyContent: 'space-between',
      alignItems: 'center',
      // gap: '15%',
    },
    logo: {
      width: '80%',
      maxHeight: 150,
      marginHorizontal: 'auto',
     opacity: 0.7,
      // marginBottom: '20%',
      // marginTop: '20%',
    },
    statusContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing['2xl'],
    },
    statusText: {
      ...theme.components.text.body,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    errorText: {
      ...theme.components.text.error,
      textAlign: 'center',
    },
    playerInfoContainer: {
      ...theme.components.card,
      marginTop: theme.spacing['4xl'],
      marginHorizontal: 'auto',
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
    },
    playerName: {
      ...theme.components.text.heading,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    inactivePlayerName: {
      color: theme.colors.destructive,
    },
    seatNumber: {
      ...theme.components.text.subheading,
      color: theme.colors.mutedForeground,
    },
    infoText: {
      ...theme.components.text.body,
      marginTop: theme.spacing.lg,
      textAlign: 'center',
      color: theme.colors.mutedForeground,
    },
    warningText: {
      ...theme.components.text.body,
      color: theme.colors.accent,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    errorDetailsText: {
      ...theme.components.text.muted,
      color: theme.colors.destructive,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
  
  });

  return (
    <TouchableOpacity  style={styles.container} activeOpacity={1}>


      <View style={{width: '100%',  marginHorizontal: 'auto', marginTop: theme.spacing['4xl']}}>

        <Image source={logo} style={styles.logo} resizeMode="center" />

        {isLoading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusText}>{t('defaultScreen.loadingPlayerData')}</Text>
        </View>
      )}

      {error && (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>{t('defaultScreen.errorLoadingPlayerData')}</Text>
          {error.message && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}

      {!isLoading && !error && playerData && (
        <View style={styles.playerInfoContainer}>
          <Text 
            style={[styles.playerName]}
          >
            {playerData.name}
          </Text>
          {seatNumber !== null && (
            <Text style={styles.seatNumber}>{`${t('seatNumber')}: ${seatNumber}`}</Text>
          )}
        </View>
      )}

      {!isLoading && !error && !playerData && seatNumber !== null && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{t('defaultScreen.noPlayerData')}</Text>
        </View>
      )}

      {!isLoading && !seatNumber && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{t('defaultScreen.configureSeatAdmin')}</Text>
        </View>
      )}

      {/* Display game state specific messages */}
      {!isLoading && !error && playerData && playerData.isActive && quizState?.state === 'IDLE' && (
        <Text style={styles.infoText}>{t('defaultScreen.waitingForGame')}</Text>
      )}

      </View>

    <ConnectionStatus showTitle={false } />
 
    </TouchableOpacity>
  );
};

export default DefaultScreen;
