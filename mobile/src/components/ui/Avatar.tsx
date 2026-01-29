import { FC } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Student } from '../../types';

interface AvatarProps {
    source?: string;
    name: string;
    size?: 'xs' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
    student?: Student;
    style?: ViewStyle;
}

export const Avatar: FC<AvatarProps> = ({
    source,
    name,
    size = 'medium',
    student,
    style
}) => {
    const { colors } = useTheme();

    const sizes = {
        xs: 24,
        small: 32,
        medium: 48,
        large: 64,
        xlarge: 96,
        xxlarge: 128,
    };

    const dimension = sizes[size];
    const initials = getInitials(name);
    const backgroundColor = getColorFromName(name);

    const avatarStyle: ViewStyle = {
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        backgroundColor: source ? 'transparent' : backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    };

    const textStyle = {
        color: '#FFFFFF',
        fontSize: dimension / 2.5,
        fontWeight: '600' as const,
    };

    return (
        <View style={[avatarStyle, style]}>
            {source ? (
                <Image
                    source={{ uri: source }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            ) : (
                <Text style={textStyle}>{initials}</Text>
            )}
        </View>
    );
};

const getInitials = (name: string): string => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

const getColorFromName = (name: string): string => {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};
