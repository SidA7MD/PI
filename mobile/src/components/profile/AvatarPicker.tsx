import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface AvatarPickerProps {
    onImageSelected: (uri: string) => void;
    isLoading?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ onImageSelected, isLoading }) => {
    const { colors } = useTheme();
    const { t } = useLanguage();

    const handlePress = () => {
        if (isLoading) return;

        Alert.alert(
            t('profile') || 'Profile Photo',
            'Choose an option',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Take Photo',
                    onPress: takePhoto
                },
                {
                    text: 'Choose from Library',
                    onPress: pickImage
                }
            ]
        );
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                onImageSelected(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                onImageSelected(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    return (
        <TouchableOpacity 
            style={[styles.cameraButton, { backgroundColor: colors.primary, borderColor: colors.background.card }]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <Ionicons name="camera" size={16} color="#FFF" />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
