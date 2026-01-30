import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, shadows } from '../../theme';
import { LanguageCode } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelectLanguage = async (code: LanguageCode) => {
    // Animate out first
    Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }),
    ]).start(() => {
        onClose();
        // Then apply change (smoother UX)
        setTimeout(() => setLanguage(code), 100);
    });
  };

  const getSampleText = (code: string) => {
      switch(code) {
          case 'fr': return 'Bonjour, comment allez-vous ?';
          case 'ar': return 'أهلاً، كيف حالك؟';
          case 'en': return 'Hello, how are you?';
          case 'es': return 'Hola, ¿cómo estás?';
          default: return 'Hello';
      }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheetContainer,
                { 
                    backgroundColor: colors.background.card,
                    transform: [{ translateY: slideAnim }] 
                },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.handle} />
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                    {t('language')}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                </View>
              </View>

              <ScrollView contentContainerStyle={styles.content}>
                {availableLanguages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.option,
                                { 
                                    backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                                    borderColor: isSelected ? colors.primary : colors.border.light
                                }
                            ]}
                            onPress={() => handleSelectLanguage(lang.code)}
                            activeOpacity={0.7}
                        >
                            {/* <Text style={styles.flag}>{lang.flag}</Text> Removed as requested */}
                            <View style={styles.textContainer}>
                                <Text style={[styles.nativeName, { color: colors.text.primary }]}>
                                    {lang.nativeName}
                                </Text>
                                <Text style={[styles.englishName, { color: colors.text.secondary }]}>
                                    {lang.name}
                                </Text>
                                <Text style={[styles.sampleText, { color: colors.text.tertiary }]}>
                                    "{getSampleText(lang.code)}"
                                </Text>
                            </View>
                            <View style={[
                                styles.radio,
                                { 
                                    borderColor: isSelected ? colors.primary : colors.border.medium,
                                    backgroundColor: isSelected ? colors.primary : 'transparent'
                                }
                            ]}>
                                {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
              </ScrollView>
              <View style={[styles.footer, { paddingBottom: 30 }]}> 
                  {/* Extra padding for home indicator */}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...shadows.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: spacing.md,
  },
  headerRow: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
      padding: 4,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  englishName: {
    fontSize: 14,
    marginBottom: 2,
  },
  sampleText: {
      fontSize: 12,
      fontStyle: 'italic',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
      height: 20,
  }
});
