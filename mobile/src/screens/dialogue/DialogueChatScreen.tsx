/**
 * Dialogue Chat Screen
 * Main chat interface for dialogue practice
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useToast } from '../../contexts';
import { dialogueService } from '../../services';
import { DialogueSession, DialogueTurn } from '../../types';

type DialogueChatScreenNavigationProp = NativeStackNavigationProp<any>;
type DialogueChatScreenRouteProp = RouteProp<{ params: { session: DialogueSession } }, 'params'>;

interface DialogueChatScreenProps {
  navigation: DialogueChatScreenNavigationProp;
  route: DialogueChatScreenRouteProp;
}

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  corrections?: DialogueTurn['corrections'];
  reformulation?: string;
  showCorrections: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  corrections,
  reformulation,
  showCorrections,
}) => {
  return (
    <View style={[styles.messageBubbleContainer, isUser && styles.userMessageContainer]}>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message}
        </Text>
      </View>

      {showCorrections && corrections && corrections.length > 0 && (
        <View style={styles.correctionsBox}>
          <Text style={styles.correctionsTitle}>Corrections:</Text>
          {corrections.map((correction, index) => (
            <View key={index} style={styles.correctionItem}>
              <Text style={styles.correctionOriginal}>❌ {correction.original}</Text>
              <Text style={styles.correctionCorrected}>✅ {correction.corrected}</Text>
              <Text style={styles.correctionExplanation}>{correction.explanation}</Text>
            </View>
          ))}
        </View>
      )}

      {showCorrections && reformulation && (
        <View style={styles.reformulationBox}>
          <Text style={styles.reformulationTitle}>Better way to say it:</Text>
          <Text style={styles.reformulationText}>{reformulation}</Text>
        </View>
      )}
    </View>
  );
};

export const DialogueChatScreen: React.FC<DialogueChatScreenProps> = ({
  navigation,
  route,
}) => {
  const initialSession = route.params.session;
  const { showError } = useToast();

  const [session, setSession] = useState<DialogueSession>(initialSession);
  const [messages, setMessages] = useState<DialogueTurn[]>(initialSession.turns || []);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const response = await dialogueService.sendMessage(session.id, {
        message: userMessage,
      });

      if (response.success && response.data) {
        const newTurn = response.data;
        setMessages((prev) => [...prev, newTurn]);

        // Check if session is completed
        if (newTurn.turn_number >= session.scenario.max_turns) {
          // End session and navigate to completion screen
          handleEndSession();
        }
      } else {
        showError('Failed to send message');
        // Restore the input text
        setInputText(userMessage);
      }
    } catch (error) {
      showError('Error sending message');
      setInputText(userMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await dialogueService.endSession(session.id);
      if (response.success && response.data) {
        navigation.navigate('DialogueCompletion', {
          session: response.data,
        });
      }
    } catch (error) {
      showError('Error ending session');
    }
  };

  const handleEndEarly = () => {
    Alert.alert(
      'End Conversation?',
      'Are you sure you want to end this conversation early? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: handleEndSession,
        },
      ]
    );
  };

  const currentTurn = messages.length;
  const maxTurns = session.scenario.max_turns;
  const progressPercentage = Math.round((currentTurn / maxTurns) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.scenarioTitle}>{session.scenario.title}</Text>
            <Text style={styles.turnCounter}>
              Turn {currentTurn} of {maxTurns} ({progressPercentage}%)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndEarly}
          >
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <MessageBubble
                message={item.user_message}
                isUser={true}
                showCorrections={false}
              />
              <MessageBubble
                message={item.ai_response}
                isUser={false}
                corrections={item.corrections}
                reformulation={item.reformulation}
                showCorrections={true}
              />
            </>
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? '...' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  turnCounter: {
    fontSize: 12,
    color: '#666',
  },
  endButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  messagesList: {
    padding: 16,
  },
  messageBubbleContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFF',
  },
  correctionsBox: {
    marginTop: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  correctionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  correctionItem: {
    marginBottom: 8,
  },
  correctionOriginal: {
    fontSize: 13,
    color: '#D32F2F',
    marginBottom: 2,
  },
  correctionCorrected: {
    fontSize: 13,
    color: '#388E3C',
    marginBottom: 2,
  },
  correctionExplanation: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  reformulationBox: {
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  reformulationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  reformulationText: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
});

export default DialogueChatScreen;
