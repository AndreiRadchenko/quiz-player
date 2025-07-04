import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput as RNTextInput, Dimensions, Animated, Modal, Platform, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

interface CustomTextInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  locale: string;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  value,
  onValueChange,
  placeholder = "Enter text...",
  disabled = false,
  locale,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const textInputRef = useRef<RNTextInput>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const backspaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [longPressKey, setLongPressKey] = useState<string | null>(null);
  const [longPressPosition, setLongPressPosition] = useState<{ x: number, y: number } | null>(null);
  const [showAlternateKey, setShowAlternateKey] = useState(false);
  const keyboardRef = useRef<View>(null);
  const longPressedKeyRef = useRef<any>(null);
  // Animation value for modal fade
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Get alphabet based on locale
  const alphabet = t('keyboard.alphabet', { returnObjects: true }) as string[];

  const keyboardPadding = theme.spacing.sm;
  const keyboardWidth = screenWidth - (keyboardPadding * 2);
  const buttonSpacing = 2;
  
  // Calculate button dimensions for consistent sizing
  const isUkrainian = locale === 'uk';
  const row1ButtonCount = isUkrainian ? 11 : 10;
  const row2ButtonCount = isUkrainian ? 11 : 9;
  const row3ButtonCount = isUkrainian ? 10 : 7; // Updated to 10 for Ukrainian
  const specialRowButtonCount = 4;
  
  // Base button width - use the row with most buttons as reference
  const maxButtonsInRow = Math.max(row1ButtonCount, row2ButtonCount);
  const baseButtonWidth = (keyboardWidth - (buttonSpacing * (maxButtonsInRow - 1))) / maxButtonsInRow;
  
  // Make letter buttons narrower and more rectangular
  const letterButtonWidth = baseButtonWidth * 0.75; // 25% narrower than before
  
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.border,
      paddingBottom: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    inputContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 0,
      borderTopLeftRadius: theme.borderRadius.md,
      borderTopRightRadius: theme.borderRadius.md,
    },
    textInput: {
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.foreground,
      minHeight: 56,
      width: '98%',
      marginInline: 'auto',
    },
    keyboardContainer: {
      backgroundColor: theme.colors.card,
      paddingHorizontal: keyboardPadding,
      paddingTop: 0, // Increased padding for more height
      paddingBottom: 0,
      minHeight: 240, // Increased overall keyboard height
      height: screenHeight * 0.27, // Set to 40% of screen height
      borderBottomLeftRadius: theme.borderRadius.md,
      borderBottomRightRadius: theme.borderRadius.md,
    },
    keyboardRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: theme.spacing.md, // Increased spacing between rows
      // height: 50, // Increased row height for taller buttons
      gap: buttonSpacing, // Use gap for consistent spacing
      width: '92%',
      marginInline: 'auto',
    },
    keyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.md, // Increased for taller buttons
      minHeight: 48, // Increased height for taller rectangular buttons
      // height: 48,
      marginHorizontal: buttonSpacing / 2,
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      width: letterButtonWidth, // Use narrower width for letter buttons
    },
    keyButtonSpecial: {
      backgroundColor: theme.colors.secondary,
      width: letterButtonWidth, // Same size as letter buttons
      paddingVertical: theme.spacing.sm,
    },
    keyButtonBackspace: {
      backgroundColor: theme.colors.destructive,
      width: letterButtonWidth * 1.8,
    },
    keyButtonSpace: {
      backgroundColor: theme.colors.accent,
      width: letterButtonWidth * 6, // Much wider for space button
      paddingVertical: theme.spacing.sm,
      flexGrow: 1,
    },
    keyButtonText: {
      fontSize: theme.fontSize.base, // Increased font size for better readability
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primaryForeground,
      textAlign: 'center',
    },
    keyButtonTextSpecial: {
      color: theme.colors.secondaryForeground,
    },
    keyButtonTextBackspace: {
      color: theme.colors.destructiveForeground,
    },
    keyButtonTextSpace: {
      color: theme.colors.accentForeground,
    },
    disabledButton: {
      opacity: 0.5,
    },
    longPressPopover: {
      backgroundColor: theme.colors.primaryActive,
      borderRadius: theme.borderRadius.md,
      // padding: theme.spacing.xs,
      flexDirection: 'row',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      zIndex: 9999,
      // borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    longPressOption: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      // marginHorizontal: theme.spacing.xs,
      minWidth: letterButtonWidth,
      minHeight: letterButtonWidth,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    longPressOptionText: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primaryForeground,
    },
  });

  const handleKeyPress = useCallback((key: string) => {
    if (disabled) return;

    // Immediate visual feedback
    // setPressedKey(key);
    // setTimeout(() => setPressedKey(null), 10); // Quick feedback reset

    // Use requestAnimationFrame for immediate text update
    requestAnimationFrame(() => {
      if (key === 'backspace') {
        if (selectionStart > 0) {
          const newValue = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
          const newCursorPos = selectionStart - 1;
          
          // Update value and cursor position simultaneously
          onValueChange(newValue);
          setSelectionStart(newCursorPos);
          
          // Force immediate text input update
          if (textInputRef.current) {
            textInputRef.current.setNativeProps({ 
              text: newValue,
              selection: { start: newCursorPos, end: newCursorPos }
            });
          }
        }
      } else {
        // Insert character at cursor position
        const newValue = value.slice(0, selectionStart) + key + value.slice(selectionStart);
        const newCursorPos = selectionStart + 1;
        
        // Update value and cursor position simultaneously
        onValueChange(newValue);
        setSelectionStart(newCursorPos);
        
        // Force immediate text input update
        if (textInputRef.current) {
          textInputRef.current.setNativeProps({ 
            text: newValue,
            selection: { start: newCursorPos, end: newCursorPos }
          });
        }
      }
    });
  }, [value, onValueChange, disabled, selectionStart]);

  const handleLongPressKeySelect = useCallback((selectedKey: string) => {
    // First handle the key press through the provided callback
    handleKeyPress(selectedKey);
    
    // Animate out and then hide - do state updates after animation is complete
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100, // 100ms animation duration
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Only update state if the animation actually finished
      if (finished) {
        // Use setTimeout to ensure we're outside React's render phase
        setTimeout(() => {
          setLongPressKey(null);
          setLongPressPosition(null);
          setShowAlternateKey(false);
          setIsLongPressing(false);
        }, 0);
      }
    });
  }, [handleKeyPress, fadeAnim]);

  const handleClearAll = useCallback(() => {
    if (disabled) return;
    
    // Clear all text
    onValueChange('');
    setSelectionStart(0);
    
    // Force immediate text input update
    if (textInputRef.current) {
      textInputRef.current.setNativeProps({ 
        text: '',
        selection: { start: 0, end: 0 }
      });
    }
  }, [onValueChange, disabled]);

  const handleBackspacePressIn = useCallback(() => {
    if (disabled) return;
    
    // Start the 2-second timer for clearing all text
    backspaceTimeoutRef.current = setTimeout(() => {
      handleClearAll();
    }, 1000); // 1 second
  }, [disabled, handleClearAll]);

  const handleBackspacePressOut = useCallback(() => {
    // Cancel the timer if backspace is released before 2 seconds
    if (backspaceTimeoutRef.current) {
      clearTimeout(backspaceTimeoutRef.current);
      backspaceTimeoutRef.current = null;
    }
  }, []);

  const handleKeyLongPress = useCallback((key: string) => {
    if (disabled) return;

    // Set the key and show alternate options
    setLongPressKey(key);
    setShowAlternateKey(true);
    
    // Let's use the longPressedKeyRef to get the position of the pressed key
    if (longPressedKeyRef.current) {
      // We'll calculate the position in the modal's onLayout event
      // to ensure the ref's measurements are available
    }
  }, [disabled]);

  // Track if we're in a long-press state to prevent immediate key input
  const [isLongPressing, setIsLongPressing] = useState(false);
  const isPressActiveRef = useRef(false);

  const handleKeyPressIn = useCallback((key: string) => {
    if (disabled || key !== 'І') return;

    // Set flag in ref to avoid state updates during render
    isPressActiveRef.current = true;
    
    // Use setTimeout instead of requestAnimationFrame to ensure we're outside React's rendering cycle
    setTimeout(() => {
      // Check if press is still active (not released yet)
      if (isPressActiveRef.current) {
        // Set flag that we're starting a potential long press
        setIsLongPressing(true);
      }
    }, 0);

    // Only set up long press for Ukrainian 'І' key
    longPressTimeoutRef.current = setTimeout(() => {
      // Only proceed if the press is still active
      if (isPressActiveRef.current) {
        handleKeyLongPress(key);
      }
    }, 400); // 400ms long press time (slightly faster)
  }, [disabled, handleKeyLongPress]);

  const handleKeyPressOut = useCallback(() => {
    // Cancel long-press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    
    // Mark press as released
    isPressActiveRef.current = false;
    
    // Capture current state values locally to avoid accessing them during the next render
    const currentIsLongPressing = isLongPressing;
    const currentShowAlternateKey = showAlternateKey;
    const currentLongPressKey = longPressKey;
    
    // Use setTimeout instead of requestAnimationFrame to ensure we're outside React's rendering cycle
    setTimeout(() => {
      // Reset the long press state
      setIsLongPressing(false);
      
      // Only input 'І' if it was a quick tap (not a long press - popover isn't showing)
      const wasQuickTap = currentIsLongPressing && !(currentShowAlternateKey || currentLongPressKey !== null);
      if (wasQuickTap) {
        handleKeyPress('І');
      }
    }, 0);
  }, [isLongPressing, showAlternateKey, longPressKey, handleKeyPress]);

  // Cleanup timeouts and animations on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (backspaceTimeoutRef.current) {
        clearTimeout(backspaceTimeoutRef.current);
        backspaceTimeoutRef.current = null;
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
      
      // Stop any running animations
      fadeAnim.stopAnimation();
      
      // Reset the states
      isPressActiveRef.current = false;
    };
  }, [fadeAnim]);

  const handleTextInputPress = useCallback((event: any) => {
    if (disabled) return;
    
    // Focus the text input to show cursor
    textInputRef.current?.focus();
    
    // Get the selection position from the event
    const { nativeEvent } = event;
    if (nativeEvent.target) {
      // For React Native, we'll use a simple approach
      // Set selection to end by default, user can change it
      setSelectionStart(value.length);
    }
  }, [disabled, value.length]);

  const handleSelectionChange = useCallback((event: any) => {
    if (!disabled) {
      const selection = event.nativeEvent.selection;
      setSelectionStart(selection.start);
    }
  }, [disabled]);

  // Create key press handler at component level
  const handleRegularKeyPress = useCallback((key: string) => {
    return () => handleKeyPress(key);
  }, [handleKeyPress]);

  // Create special key handlers
  const handleUkrainianIKeyPressIn = useCallback(() => {
    handleKeyPressIn('І');
  }, [handleKeyPressIn]);

  // Memoize the renderKeyButton function to ensure consistent hooks between renders
  const renderKeyButton = useCallback((
    key: string, 
    text: string, 
    style?: 'special' | 'backspace' | 'space'
  ) => {
    // Special handling for backspace button with long press
    if (key === 'backspace') {
      return (
        <TouchableOpacity
          key={key}
          style={[
            styles.keyButton,
            styles.keyButtonBackspace,
            disabled && styles.disabledButton,
          ]}
          onPress={handleRegularKeyPress(key)}
          onPressIn={handleBackspacePressIn}
          onPressOut={handleBackspacePressOut}
          disabled={disabled}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Text
            style={[
              styles.keyButtonText,
              styles.keyButtonTextBackspace,
            ]}
          >
            {text}
          </Text>
        </TouchableOpacity>
      );
    }

    // Special handling for Ukrainian 'І' key with long press for 'Ї'
    if (key === 'І' && locale === 'uk') {
      return (
        <TouchableOpacity
          key={key}
          ref={longPressedKeyRef}
          style={[
            styles.keyButton,
            disabled && styles.disabledButton,
          ]}
          // Remove direct onPress handler to prevent immediate input
          onPressIn={handleUkrainianIKeyPressIn}
          onPressOut={handleKeyPressOut}
          disabled={disabled}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Text
            style={[
              styles.keyButtonText
            ]}
          >
            {text}
          </Text>
          <Text
            style={{
              position: 'absolute',
              bottom: 2,
              right: 4,
              fontSize: 10,
              fontWeight: 'bold',
              color: theme.colors.primaryForeground,
              opacity: 0.8,
            }}
          >
            •••
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Regular button handling for all other keys
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.keyButton,
          style === 'special' && styles.keyButtonSpecial,
          style === 'space' && styles.keyButtonSpace,
          disabled && styles.disabledButton,
        ]}
        onPress={handleRegularKeyPress(key)}
        disabled={disabled}
        activeOpacity={0.7} // Faster opacity change
        delayPressIn={0} // Immediate press response
        delayPressOut={0} // Immediate release response
      >
        <Text
          style={[
            styles.keyButtonText,
            style === 'special' && styles.keyButtonTextSpecial,
            style === 'space' && styles.keyButtonTextSpace,
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    );
  }, [
    disabled, 
    styles, 
    locale, 
    theme.colors.primaryForeground, 
    handleRegularKeyPress, 
    handleBackspacePressIn, 
    handleBackspacePressOut,
    handleUkrainianIKeyPressIn,
    handleKeyPressOut
  ]);

  // Split alphabet into rows for QWERTY layout (iPhone style)
  const getKeyboardRows = () => {
    if (locale === 'uk') {
      // Ukrainian QWERTY layout - 11+11+10 layout for better distribution
      // We have 32 letters, so distribute as 11+11+10
      return [
        alphabet.slice(0, 11), // Row 1: 11 letters
        alphabet.slice(11, 22), // Row 2: 11 letters  
        alphabet.slice(22), // Row 3: remaining 10 letters
        [] // Row 4: Special characters (handled separately)
      ];
    } else {
      // English QWERTY layout - iPhone style 4 rows
      return [
        alphabet.slice(0, 10), // Row 1: q w e r t y u i o p (10 letters)
        alphabet.slice(10, 19), // Row 2: a s d f g h j k l (9 letters, centered)
        alphabet.slice(19, 26), // Row 3: z x c v b n m (7 letters)
        [] // Row 4: Special characters (handled separately)
      ];
    }
  };

  const keyboardRows = getKeyboardRows();

  // Track the position of the pressed key
  const [keyMeasurements, setKeyMeasurements] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Get the position of the key when needed
  const measureKeyPosition = useCallback(() => {
    if (longPressedKeyRef.current && showAlternateKey) {
      longPressedKeyRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setKeyMeasurements({ x, y, width, height });
      });
    }
  }, [showAlternateKey]);
  
  // Effect to measure key position when popover is shown
  useEffect(() => {
    let measureTimeout: NodeJS.Timeout | null = null;
    let animationRef: Animated.CompositeAnimation | null = null;
    
    if (showAlternateKey) {
      // Small delay to ensure component is rendered
      measureTimeout = setTimeout(() => {
        measureKeyPosition();
        
        // Start fade-in animation after measurement
        animationRef = Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100, // 100ms animation duration
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        });
        
        animationRef.start();
      }, 50);
    } else {
      // Reset the fade animation when closing
      fadeAnim.setValue(0);
    }
    
    // Clean up timeout and animation
    return () => {
      if (measureTimeout) {
        clearTimeout(measureTimeout);
      }
      
      if (animationRef) {
        animationRef.stop();
      }
    };
  }, [showAlternateKey, measureKeyPosition, fadeAnim]);

  // Memoize alternative characters to prevent recreation on each render
  const alternatives: Record<string, string[]> = useMemo(() => ({
    'І': ['Ї'], // Ukrainian 'І' can input 'Ї'
  }), []);

  // Pre-calculate positions and styles for the popover once instead of in render
  const popoverStyles = useMemo(() => {
    if (!showAlternateKey || !longPressKey) {
      return null;
    }

    const popoverWidth = letterButtonWidth * 1.3;
    const popoverHeight = letterButtonWidth * 1.5;
    
    // Position above and slightly to the right
    const popoverLeft = keyMeasurements.x + keyMeasurements.width - 10;
    const popoverTop = keyMeasurements.y - popoverHeight + 10;
    
    return {
      popoverWidth,
      popoverHeight,
      popoverLeft,
      popoverTop
    };
  }, [showAlternateKey, longPressKey, letterButtonWidth, keyMeasurements]);

  // Animation handler for hiding the popover with animation
  const hidePopoverWithAnimation = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100, // 100ms animation duration
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Only update state if the animation actually finished
      // This ensures we don't update state if the component is unmounted
      if (finished) {
        // Use setTimeout to ensure state updates happen outside React's render phase
        setTimeout(() => {
          setShowAlternateKey(false);
          setLongPressKey(null);
          setIsLongPressing(false);
        }, 0);
      }
    });
  }, [fadeAnim]);

  // Create an option press handler at component level, not inside the render function
  const createOptionPressHandler = useCallback((option: string) => {
    return () => {
      handleLongPressKeySelect(option);
    };
  }, [handleLongPressKeySelect]);

  // Render the long-press popover for alternative characters using Modal for better visibility
  const renderLongPressPopover = useCallback(() => {
    if (!showAlternateKey || !longPressKey || !popoverStyles) {
      return null;
    }

    const options: string[] = alternatives[longPressKey] || [];
    const { popoverWidth, popoverHeight, popoverLeft, popoverTop } = popoverStyles;
    
    return (
      <Modal
        animationType="none" // Turn off default animation
        transparent={true}
        visible={showAlternateKey}
        onRequestClose={hidePopoverWithAnimation}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.0)'
          }}
          activeOpacity={1}
          onPress={hidePopoverWithAnimation}
        >
          <Animated.View 
            style={[
              styles.longPressPopover,
              {
                position: 'absolute',
                left: popoverLeft,
                top: popoverTop,
                width: popoverWidth,
                height: popoverHeight,
                opacity: fadeAnim, // Bind opacity to animated value
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }
            ]}
          >
            {options.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={styles.longPressOption}
                onPress={createOptionPressHandler(option)}
              >
                <Text style={styles.longPressOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  }, [showAlternateKey, longPressKey, popoverStyles, alternatives, fadeAnim, hidePopoverWithAnimation, createOptionPressHandler, styles]);

  // Memoize keyboard buttons to prevent unnecessary re-renders
  const memoizedKeyboard = useMemo(() => {
    return (
      <View ref={keyboardRef} style={styles.keyboardContainer}>
        {/* Row 1: First row of letters */}
        <View style={styles.keyboardRow}>
          {keyboardRows[0].map((letter) => renderKeyButton(letter, letter))}
        </View>

        {/* Row 2: Second row of letters */}
        <View style={styles.keyboardRow}>
          {keyboardRows[1].map((letter) => renderKeyButton(letter, letter))}
        </View>

        {/* Row 3: Third row of letters + backspace */}
        <View style={styles.keyboardRow}>
          {keyboardRows[2].map((letter) => renderKeyButton(letter, letter))}
          {renderKeyButton('backspace', '⌫', 'backspace')}
        </View>

        {/* Row 4: Special characters row */}
        <View style={styles.keyboardRow}>
          {renderKeyButton('.', '.', 'special')}
          {renderKeyButton(',', ',', 'special')}
          {renderKeyButton('ʼ', 'ʼ', 'special')}
          {renderKeyButton(' ', 'SPACE', 'space')}
          {renderKeyButton('-', '−', 'special')}
        </View>
        
        {/* Render the long press popover modal outside of the keyboard container */}
        {renderLongPressPopover()}
      </View>
    );
  }, [keyboardRows, styles.keyboardContainer, styles.keyboardRow, renderKeyButton, renderLongPressPopover]);

  return (
    <View style={styles.container}>
      {/* Text Input Field */}
      <View style={styles.inputContainer}>
        <RNTextInput
          ref={textInputRef}
          style={styles.textInput}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedForeground}
          editable={!disabled}
          showSoftInputOnFocus={false} // Prevent system keyboard
          onPress={handleTextInputPress}
          onSelectionChange={handleSelectionChange}
          selection={{ start: selectionStart, end: selectionStart }}
          underlineColorAndroid="transparent" // Disable underline for better performance
          autoCorrect={false} // Disable autocorrect for faster typing
          autoCapitalize="none" // Disable auto-capitalize for speed
          spellCheck={false} // Disable spell check for performance
          allowFontScaling={false} // Prevent font scaling for consistent performance
        />
      </View>

      {/* Custom Text Keyboard */}
      {memoizedKeyboard}
    </View>
  );
};