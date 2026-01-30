import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, shadows } from '../../theme';
import { UserProfile } from '../../types/ProfileTypes';
import { Button } from '../ui/Button';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
    visible, 
    onClose, 
    user, 
    onSave 
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
      username: '',
      email: '',
      phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (user) {
          setFormData({
              username: user.username || '',
              email: user.email || '',
              phone: user.phone || ''
          });
      }
  }, [user, visible]);

  const validate = () => {
      if (!formData.username.trim()) return t('usernameRequired') || 'Username required';
      if (!formData.email.trim()) return 'Email required'; // Add regex validation
      return null;
  };

  const handleSave = async () => {
      const validationError = validate();
      if (validationError) {
          setError(validationError);
          return;
      }

      setLoading(true);
      setError(null);
      try {
          await onSave(formData);
          onClose();
      } catch (err) {
          setError('Failed to save changes');
      } finally {
          setLoading(false);
      }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background.primary }]}
      >
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={[styles.cancelText, { color: colors.primary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>{t('edit')}</Text>
            <View style={styles.headerRight}>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    <Text style={[styles.saveText, { color: loading ? colors.text.disabled : colors.primary }]}>
                        {t('save')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
            {error && (
                <View style={[styles.errorBox, { backgroundColor: colors.danger + '20' }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.danger} />
                    <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                </View>
            )}

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>{t('usernameLabel')}</Text>
                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.background.tertiary,
                        color: colors.text.primary,
                        borderColor: colors.border.light
                    }]}
                    value={formData.username}
                    onChangeText={(text) => setFormData({...formData, username: text})}
                    placeholderTextColor={colors.text.disabled}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>{t('emailLabel')}</Text>
                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.background.tertiary,
                        color: colors.text.primary,
                        borderColor: colors.border.light
                    }]}
                    value={formData.email}
                    onChangeText={(text) => setFormData({...formData, email: text})}
                    keyboardType="email-address"
                    // placeholdere="name@example.com"
                    autoCapitalize="none"
                    placeholderTextColor={colors.text.disabled}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>{t('phoneLabel')}</Text>
                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.background.tertiary,
                        color: colors.text.primary,
                        borderColor: colors.border.light
                    }]}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.text.disabled}
                />
            </View>
            
            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
      width: 70,
      alignItems: 'flex-start',
  },
  headerRight: {
      width: 70,
      alignItems: 'flex-end',
  },
  title: {
      fontSize: 17,
      fontWeight: '600',
  },
  cancelText: {
      fontSize: 17,
  },
  saveText: {
      fontSize: 17,
      fontWeight: '600',
  },
  content: {
      padding: spacing.xl,
      gap: spacing.xl,
  },
  inputGroup: {
      gap: spacing.xs,
  },
  label: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginLeft: 4,
  },
  input: {
      height: 50,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      borderWidth: 1,
  },
  errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 12,
      gap: spacing.md,
  },
  errorText: {
      fontSize: 14,
      fontWeight: '500',
  },
  loader: {
      marginTop: spacing.xl,
  }
});
