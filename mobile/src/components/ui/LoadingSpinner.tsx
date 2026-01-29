import { FC } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
    size = 'large',
    color,
    fullScreen = false,
}) => {
    const { colors } = useTheme();

    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
                <ActivityIndicator size={size} color={color || colors.primary} />
            </View>
        );
    }

    return <ActivityIndicator size={size} color={color || colors.primary} />;
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
