import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Text,
    Animated,
    Keyboard,
    SafeAreaView,
    ActivityIndicator,
    Easing,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import PulseAnimation from '@/components/PulseAnimation';
import Sidebar from '@/components/Sidebar';
import IntroScreen from '@/components/IntroScreen';

// Message type definition
interface Message {
    id: string;
    text: string;
    image?: string;
    isUser: boolean;
    timestamp: Date;
}

// Chat type definition
interface Chat {
    id: string;
    title: string;
    date: Date;
    messages: Message[];
}

// Get screen dimensions
const { width } = Dimensions.get('window');

export default function ChatScreen() {
    // State for chats and current chat
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    // UI state
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [initialMessageAnimationDone, setInitialMessageAnimationDone] = useState(false);

    // Refs
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    // Animation values
    const sendButtonScale = useRef(new Animated.Value(1)).current;
    const messageOpacity = useRef(new Animated.Value(0)).current;
    const messageTranslateY = useRef(new Animated.Value(20)).current;
    const inputContainerTranslateY = useRef(new Animated.Value(50)).current;
    const inputContainerOpacity = useRef(new Animated.Value(0)).current;
    const loadingImageScale = useRef(new Animated.Value(0.95)).current;

    // Start input container animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(inputContainerTranslateY, {
                toValue: 0,
                duration: 500,
                delay: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(inputContainerOpacity, {
                toValue: 1,
                duration: 500,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Start loading image animation
    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(loadingImageScale, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    Animated.timing(loadingImageScale, {
                        toValue: 0.95,
                        duration: 1000,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.sin),
                    }),
                ])
            ).start();
        } else {
            loadingImageScale.setValue(1);
        }
    }, [isLoading]);

    // Get current chat messages
    const currentChat = currentChatId
        ? chats.find(chat => chat.id === currentChatId)
        : null;

    const messages = currentChat?.messages || [];
    const isNewChat = !currentChatId;

    // Listen for keyboard events
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                scrollToBottom();
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Animate new messages
    useEffect(() => {
        if (messages.length > 0 && !initialMessageAnimationDone) {
            Animated.parallel([
                Animated.timing(messageOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
                Animated.timing(messageTranslateY, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
            ]).start(() => {
                setInitialMessageAnimationDone(true);
            });
        }
    }, [messages, initialMessageAnimationDone]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const pickImage = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);

            // Create a new chat if we're not in one
            if (isNewChat) {
                createNewChat();
            }
        }
    };

    const createNewChat = () => {
        const newChatId = Date.now().toString();
        const newChat: Chat = {
            id: newChatId,
            title: 'New Chat',
            date: new Date(),
            messages: [
                {
                    id: '1',
                    text: 'Welcome to Slop AI. Send me text and images, and I\'ll create something amazing for you.',
                    isUser: false,
                    timestamp: new Date(),
                },
            ],
        };

        setChats(prev => [...prev, newChat]);
        setCurrentChatId(newChatId);
        setInitialMessageAnimationDone(false);
    };

    const handleSend = async () => {
        if ((!inputText.trim() && !selectedImage) || isLoading) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Create a new chat if we're not in one
        if (isNewChat) {
            createNewChat();
        }

        // Animate the send button
        Animated.sequence([
            Animated.timing(sendButtonScale, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.cubic),
            }),
            Animated.timing(sendButtonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.cubic),
            }),
        ]).start();

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            image: selectedImage || undefined,
            isUser: true,
            timestamp: new Date(),
        };

        // Update chat with new message
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, newUserMessage],
                    // Update chat title if it's still the default
                    title: chat.title === 'New Chat' && inputText.trim()
                        ? inputText.trim().substring(0, 30)
                        : chat.title
                }
                : chat
        ));

        setInputText('');
        setSelectedImage(null);

        scrollToBottom();

        // Simulate API response
        setIsLoading(true);
        setTimeout(() => {
            const responseMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Here\'s what I created based on your input!',
                image: 'https://picsum.photos/400/300', // Placeholder image
                isUser: false,
                timestamp: new Date(),
            };

            // Update chat with AI response
            setChats(prev => prev.map(chat =>
                chat.id === currentChatId
                    ? { ...chat, messages: [...chat.messages, responseMessage] }
                    : chat
            ));

            setIsLoading(false);
            scrollToBottom();
        }, 2000);
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setInputText('');
        setSelectedImage(null);
        setIsLoading(false);
        setInitialMessageAnimationDone(false);
    };

    const handleSelectChat = (chatId: string) => {
        setCurrentChatId(chatId);
        setInitialMessageAnimationDone(true); // Don't animate for existing chats
    };

    const handleSettings = () => {
        // Placeholder for settings functionality
        console.log('Settings pressed');
    };

    const focusInput = () => {
        inputRef.current?.focus();

        // Create a new chat if we're not in one
        if (isNewChat) {
            createNewChat();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Render message bubble content
    const renderMessageContent = (message: Message, index: number) => {
        const isFirstMessage = index === 0 && !initialMessageAnimationDone;

        const messageContent = (
            <>
                {message.image && (
                    <Image source={{ uri: message.image }} style={styles.messageImage} />
                )}
                {message.text && (
                    <Text style={[
                        styles.messageText,
                        message.isUser ? styles.userMessageText : styles.botMessageText
                    ]}>
                        {message.text}
                    </Text>
                )}
                <Text style={[
                    styles.timestamp,
                    message.isUser ? styles.userTimestamp : styles.botTimestamp
                ]}>
                    {formatTime(message.timestamp)}
                </Text>
            </>
        );

        if (isFirstMessage) {
            return (
                <Animated.View style={{
                    opacity: messageOpacity,
                    transform: [{ translateY: messageTranslateY }]
                }}>
                    {messageContent}
                </Animated.View>
            );
        }

        return messageContent;
    };

    // Render loading state
    const renderLoadingState = () => {
        return (
            <View style={[styles.messageRow, styles.botMessageRow]}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AI</Text>
                    </View>
                </View>

                <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
                    <Animated.View
                        style={[
                            styles.imageLoadingContainer,
                            { transform: [{ scale: loadingImageScale }] }
                        ]}
                    >
                        <ActivityIndicator size="large" color="#8B5CF6" style={styles.imageLoadingIndicator} />
                        <View style={styles.imageLoadingOverlay}>
                            <Ionicons name="image-outline" size={40} color="#FFFFFF" style={styles.imageLoadingIcon} />
                        </View>
                    </Animated.View>
                    <View style={styles.loadingTextContainer}>
                        <View style={styles.pulseContainer}>
                            <PulseAnimation
                                color="#8B5CF6"
                                size={24}
                                speed={1200}
                            />
                        </View>
                        <Text style={[styles.messageText, styles.botMessageText, { marginLeft: 10 }]}>
                            Creating your image...
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSidebarVisible(true);
                    }}
                >
                    <Ionicons name="menu" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {currentChat ? currentChat.title : 'New Chat'}
                </Text>
                <TouchableOpacity
                    style={styles.newChatButton}
                    onPress={handleNewChat}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                {isNewChat ? (
                    <IntroScreen onImagePress={pickImage} onFocusInput={focusInput} />
                ) : (
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((message, index) => (
                            <View
                                key={message.id}
                                style={[
                                    styles.messageRow,
                                    message.isUser ? styles.userMessageRow : styles.botMessageRow,
                                    index === 0 ? styles.firstMessage : null
                                ]}
                            >
                                {!message.isUser && (
                                    <View style={styles.avatarContainer}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>AI</Text>
                                        </View>
                                    </View>
                                )}

                                <View style={[
                                    styles.messageBubble,
                                    message.isUser ? styles.userBubble : styles.botBubble,
                                ]}>
                                    {renderMessageContent(message, index)}
                                </View>

                                {message.isUser && (
                                    <View style={styles.avatarContainer}>
                                        <View style={styles.userAvatar}>
                                            <Ionicons name="person" size={18} color="#FFFFFF" />
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}

                        {isLoading && renderLoadingState()}
                    </ScrollView>
                )}

                <Animated.View
                    style={[
                        styles.inputWrapper,
                        {
                            transform: [{ translateY: inputContainerTranslateY }],
                            opacity: inputContainerOpacity
                        }
                    ]}
                >
                    {selectedImage && (
                        <View style={styles.selectedImageContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedImage(null);
                                }}
                            >
                                <Ionicons name="close-circle" size={24} color="#FF4757" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={styles.attachButton}
                            onPress={pickImage}
                        >
                            <Ionicons name="image-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor="#A0AEC0"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />

                        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    {
                                        backgroundColor: (!inputText.trim() && !selectedImage) || isLoading
                                            ? '#4A5568'
                                            : '#8B5CF6',
                                        opacity: (!inputText.trim() && !selectedImage) || isLoading ? 0.5 : 1
                                    }
                                ]}
                                onPress={handleSend}
                                disabled={(!inputText.trim() && !selectedImage) || isLoading}
                            >
                                <Ionicons name="send" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>

            {/* Sidebar */}
            <Sidebar
                isVisible={isSidebarVisible}
                onClose={() => setSidebarVisible(false)}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onSettings={handleSettings}
                pastChats={chats.map(chat => ({
                    id: chat.id,
                    title: chat.title,
                    date: chat.date,
                }))}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A0A0A', // Darker, more black background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222222', // Darker border
    },
    menuButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    newChatButton: {
        padding: 8,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 16,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    userMessageRow: {
        justifyContent: 'flex-end',
    },
    botMessageRow: {
        justifyContent: 'flex-start',
    },
    firstMessage: {
        marginTop: 8,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        marginHorizontal: 8,
        alignSelf: 'flex-start',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8B5CF6', // Purple accent color
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333333', // Darker gray for user avatar
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    messageBubble: {
        maxWidth: '70%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: '#333333', // Darker gray for user messages
    },
    botBubble: {
        backgroundColor: '#1A1A1A', // Very dark gray for bot messages
    },
    loadingBubble: {
        backgroundColor: '#1A1A1A',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    botMessageText: {
        color: '#FFFFFF',
    },
    messageImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    botTimestamp: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageLoadingContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#222222', // Darker gray for loading container
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    imageLoadingIndicator: {
        position: 'absolute',
    },
    imageLoadingOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    imageLoadingIcon: {
        opacity: 0.7,
    },
    loadingTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pulseContainer: {
        width: 24,
        height: 24,
    },
    inputWrapper: {
        borderTopWidth: 1,
        borderTopColor: '#222222', // Darker border
        paddingVertical: 8,
        backgroundColor: '#0A0A0A', // Match background
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#333333', // Darker border
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        marginHorizontal: 8,
        fontSize: 16,
        color: '#FFFFFF',
        backgroundColor: '#1A1A1A', // Very dark gray for input
    },
    attachButton: {
        padding: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedImageContainer: {
        margin: 8,
        marginBottom: 0,
        position: 'relative',
        alignSelf: 'flex-start',
        marginLeft: 16,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
    },
}); 