import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
}

export const AppButton: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'primary'   ? styles.primary   : undefined,
                variant === 'secondary' ? styles.secondary : undefined,
                variant === 'ghost'     ? styles.ghost     : undefined,
                (disabled || loading)   ? styles.disabled  : undefined,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.75}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? Colors.onLime : Colors.lime}
                    size="small"
                />
            ) : (
                <Text
                    style={[
                        styles.text,
                        variant === 'secondary' ? styles.textSecondary : undefined,
                        variant === 'ghost'     ? styles.textGhost     : undefined,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 28,
        borderRadius: Radius.card,      // 36px
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    primary: {
        backgroundColor: Colors.lime,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.lime,
    },
    ghost: {
        backgroundColor: Colors.surface,
    },
    disabled: {
        opacity: 0.4,
    },
    text: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.onLime,           // dark text on lime background
        letterSpacing: 0.3,
    },
    textSecondary: {
        color: Colors.lime,
    },
    textGhost: {
        color: Colors.text,
    },
});
