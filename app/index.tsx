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
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import PulseAnimation from '@/components/PulseAnimation';

// Message type definition
interface Message {
    id: string;
    text: string;
    image?: string;
    isUser: boolean;
    timestamp: Date;
}

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Welcome to Slop AI. Send me text and images, and I\'ll create something amazing for you.',
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Animation value for the send button
    const sendButtonScale = useRef(new Animated.Value(1)).current;

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
        }
    };

    const handleSend = async () => {
        if ((!inputText.trim() && !selectedImage) || isLoading) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Animate the send button
        Animated.sequence([
            Animated.timing(sendButtonScale, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(sendButtonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            image: selectedImage || undefined,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
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

            setMessages((prev) => [...prev, responseMessage]);
            setIsLoading(false);

            scrollToBottom();
        }, 2000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Slop AI</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
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

                    {isLoading && (
                        <View style={[styles.messageRow, styles.botMessageRow]}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>AI</Text>
                                </View>
                            </View>

                            <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
                                <View style={styles.loadingContainer}>
                                    <View style={styles.pulseContainer}>
                                        <PulseAnimation
                                            color="#3B82F6"
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
                    )}
                </ScrollView>

                <View style={styles.inputWrapper}>
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
                                            : '#3B82F6',
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
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F0F0F', // Darker background for a more ChatGPT-like feel
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3748',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
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
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4A5568',
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
        backgroundColor: '#3B82F6',
    },
    botBubble: {
        backgroundColor: '#1E293B',
    },
    loadingBubble: {
        backgroundColor: '#1E293B',
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
    pulseContainer: {
        width: 24,
        height: 24,
    },
    inputWrapper: {
        borderTopWidth: 1,
        borderTopColor: '#2D3748',
        paddingVertical: 8,
        backgroundColor: '#0F0F0F',
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
        borderColor: '#4A5568',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        marginHorizontal: 8,
        fontSize: 16,
        color: '#FFFFFF',
        backgroundColor: '#1A202C',
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
        backgroundColor: '#1A202C',
        borderRadius: 12,
    },
}); 