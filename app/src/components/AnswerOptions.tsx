import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface AnswerOptionsProps {
  answerOptions: string;
  selectedOption: string;
  actionTaken: 'answered' | 'passed' | 'bought_out' | null;
  onOptionSelect: (option: string) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  answerOptions,
  selectedOption,
  actionTaken,
  onOptionSelect,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    multipleChoiceContainer: {
      display: 'flex',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      marginInline: 'auto',
      marginBottom: theme.spacing.xl,
      width: '90%',
    },
    optionButton: {
      flexGrow: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      // borderColor: 'transparent',
      borderColor: theme.colors.sidebarBorder,
    },
    selectedOptionButton: {
      // backgroundColor: theme.colors.primaryActive,
      backgroundColor: theme.colors.secondary,
      // borderColor: theme.colors.accentHover,
    },
    submittedOptionButton: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.sidebarBorder,
    },
    optionText: {
      // ...theme.components.text.body,
      color: theme.colors.primaryForeground,
      fontSize: theme.fontSize['2xl'],
      textAlign: 'center',
    },
    selectedOptionText: {
      ...theme.components.text.body,
      color: theme.colors.foreground,
      fontWeight: theme.fontWeight.bold,
      fontSize: theme.fontSize['2xl'],
    },
    submittedOptionText: {
      ...theme.components.text.body,
      color: theme.colors.secondaryForeground,
      fontWeight: theme.fontWeight.bold,
      fontSize: theme.fontSize['2xl'],
    },
  });

  const options = answerOptions.split(';');

  console.log('🎯 Rendering answer options with state:', {
    answerOptions,
    actionTaken,
    selectedOption,
    optionsCount: options.length,
  });

  return (
    <View style={styles.multipleChoiceContainer}>
      {options.map((option, index) => (
        <TouchableOpacity
          activeOpacity={0.7}
          key={index}
          style={[
            styles.optionButton,
            selectedOption === option && styles.selectedOptionButton,
            actionTaken === 'answered' && selectedOption === option && styles.submittedOptionButton
          ]}
          onPress={() => {
            console.log('🎯 Option button pressed:', option);
            
            if (!actionTaken) {
              onOptionSelect(option);
            }
          }}
          disabled={!!actionTaken}
        >
          <Text style={[
            styles.optionText,
            selectedOption === option && styles.selectedOptionText,
            actionTaken === 'answered' && selectedOption === option && styles.submittedOptionText
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
