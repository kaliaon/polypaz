/**
 * Translator Screen
 * In-app general translator. Free, powered by MyMemory.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import translatorService, { SUPPORTED_LANGUAGES } from '../../services/translator.service';
import { useAuth } from '../../contexts';
import { Language } from '../../types';

const MAX_CHARS = 500;

export const TranslatorScreen: React.FC = () => {
  const { user } = useAuth();

  const initialSource: Language =
    (user?.profile?.native_language as Language) || 'english';
  const initialTarget: Language =
    (user?.profile?.target_language as Language) ||
    (initialSource === 'english' ? 'russian' : 'english');

  const [sourceLang, setSourceLang] = useState<Language>(initialSource);
  const [targetLang, setTargetLang] = useState<Language>(initialTarget);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<null | 'source' | 'target'>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runTranslate = useCallback(
    async (text: string, from: Language, to: Language) => {
      if (!text.trim()) {
        setOutputText('');
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      const result = await translatorService.translate(text, from, to);
      setLoading(false);
      if (result.success && result.text !== undefined) {
        setOutputText(result.text);
      } else {
        setOutputText('');
        setError(result.error || 'Translation failed');
      }
    },
    []
  );

  // Auto-translate with debounce as user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!inputText.trim()) {
      setOutputText('');
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runTranslate(inputText, sourceLang, targetLang);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText, sourceLang, targetLang, runTranslate]);

  const handleSwap = () => {
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const handleSelectLanguage = (lang: Language) => {
    if (pickerOpen === 'source') {
      if (lang === targetLang) {
        setTargetLang(sourceLang);
      }
      setSourceLang(lang);
    } else if (pickerOpen === 'target') {
      if (lang === sourceLang) {
        setSourceLang(targetLang);
      }
      setTargetLang(lang);
    }
    setPickerOpen(null);
  };

  const sourceMeta = SUPPORTED_LANGUAGES.find((l) => l.value === sourceLang)!;
  const targetMeta = SUPPORTED_LANGUAGES.find((l) => l.value === targetLang)!;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Translator</Text>
            <Text style={styles.subtitle}>Quick translations across your languages</Text>
          </View>

          <View style={styles.langBar}>
            <TouchableOpacity
              style={styles.langPill}
              onPress={() => setPickerOpen('source')}
              activeOpacity={0.7}
            >
              <Text style={styles.langFlag}>{sourceMeta.flag}</Text>
              <Text style={styles.langLabel} numberOfLines={1}>
                {sourceMeta.label}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.swapButton} onPress={handleSwap} activeOpacity={0.7}>
              <Text style={styles.swapIcon}>⇄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langPill}
              onPress={() => setPickerOpen('target')}
              activeOpacity={0.7}
            >
              <Text style={styles.langFlag}>{targetMeta.flag}</Text>
              <Text style={styles.langLabel} numberOfLines={1}>
                {targetMeta.label}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{sourceMeta.label}</Text>
              {inputText.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Type text to translate..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={(t) => setInputText(t.slice(0, MAX_CHARS))}
              multiline
              textAlignVertical="top"
              autoCorrect
              autoCapitalize="sentences"
            />
            <Text style={styles.charCount}>
              {inputText.length}/{MAX_CHARS}
            </Text>
          </View>

          <View style={[styles.card, styles.outputCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{targetMeta.label}</Text>
              {loading && <ActivityIndicator size="small" color="#2196F3" />}
            </View>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={[styles.output, !outputText && styles.outputPlaceholder]}>
                {outputText || 'Translation will appear here'}
              </Text>
            )}
          </View>

          {/* <Text style={styles.attribution}>Powered by MyMemory</Text> */}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={pickerOpen !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerOpen(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {pickerOpen === 'source' ? 'Translate from' : 'Translate to'}
            </Text>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected =
                  pickerOpen === 'source'
                    ? item.value === sourceLang
                    : item.value === targetLang;
                return (
                  <TouchableOpacity
                    style={[styles.langOption, isSelected && styles.langOptionSelected]}
                    onPress={() => handleSelectLanguage(item.value)}
                  >
                    <Text style={styles.langOptionFlag}>{item.flag}</Text>
                    <Text style={styles.langOptionLabel}>{item.label}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  langPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  langFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  langLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chevron: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  swapIcon: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  outputCard: {
    backgroundColor: '#F8FBFF',
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    padding: 0,
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  output: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  outputPlaceholder: {
    color: '#999',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
  },
  attribution: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  langOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  langOptionFlag: {
    fontSize: 22,
    marginRight: 14,
  },
  langOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
