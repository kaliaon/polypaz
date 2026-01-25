/**
 * Button Component
 * Reusable button with variants, loading state, and disabled state
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = [styles.button, styles[`button_${size}`]];

    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.buttonPrimary);
        if (isDisabled) baseStyle.push(styles.buttonPrimaryDisabled);
        break;
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        if (isDisabled) baseStyle.push(styles.buttonSecondaryDisabled);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        if (isDisabled) baseStyle.push(styles.buttonOutlineDisabled);
        break;
      case 'text':
        baseStyle.push(styles.buttonText);
        if (isDisabled) baseStyle.push(styles.buttonTextDisabled);
        break;
    }

    return baseStyle as ViewStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = [styles.text, styles[`text_${size}`]];

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.textPrimary);
        break;
      case 'secondary':
        baseStyle.push(styles.textSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      case 'text':
        baseStyle.push(styles.textText);
        break;
    }

    return baseStyle as TextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFF' : '#2196F3'}
          size="small"
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  button_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: '100%',
  },

  // Primary variant
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonPrimaryDisabled: {
    backgroundColor: '#BDBDBD',
  },
  textPrimary: {
    color: '#FFF',
  },

  // Secondary variant
  buttonSecondary: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondaryDisabled: {
    backgroundColor: '#BDBDBD',
  },
  textSecondary: {
    color: '#FFF',
  },

  // Outline variant
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  buttonOutlineDisabled: {
    borderColor: '#BDBDBD',
  },
  textOutline: {
    color: '#2196F3',
  },

  // Text variant
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  textText: {
    color: '#2196F3',
  },

  // Text sizes
  text: {
    fontWeight: '600',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
});

export default Button;
