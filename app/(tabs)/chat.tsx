import React, { useState, useRef } from 'react';
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
    ActivityIndicator,
    Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import ChatHeader from '@/components/ChatHeader';
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
            text: 'Welcome to Slop! Send me text and images, and I\'ll create something amazing for you.',
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Animation value for the send button
    const sendButtonScale = useRef(new Animated.Value(1)).current;

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

        // Scroll to bottom
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

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

            // Scroll to bottom again after response
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 2000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ChatHeader
                title="Slop AI Chat"
                onInfoPress={() => {
                    setInfoModalVisible(true);
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageBubble,
                                message.isUser ? styles.userBubble : styles.botBubble,
                                {
                                    backgroundColor: message.isUser
                                        ? (isDark ? '#4A5568' : '#3B82F6')
                                        : (isDark ? '#2D3748' : '#E2E8F0')
                                }
                            ]}
                        >
                            {message.image && (
                                <Image source={{ uri: message.image }} style={styles.messageImage} />
                            )}
                            {message.text && (
                                <Text style={[
                                    styles.messageText,
                                    {
                                        color: message.isUser
                                            ? '#FFFFFF'
                                            : (isDark ? '#FFFFFF' : '#1A202C')
                                    }
                                ]}>
                                    {message.text}
                                </Text>
                            )}
                            <Text style={[
                                styles.timestamp,
                                {
                                    color: message.isUser
                                        ? 'rgba(255, 255, 255, 0.7)'
                                        : (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
                                }
                            ]}>
                                {formatTime(message.timestamp)}
                            </Text>
                        </View>
                    ))}

                    {isLoading && (
                        <View style={[
                            styles.messageBubble,
                            styles.botBubble,
                            { backgroundColor: isDark ? '#2D3748' : '#E2E8F0' }
                        ]}>
                            <View style={styles.loadingContainer}>
                                <View style={styles.pulseContainer}>
                                    <PulseAnimation
                                        color={isDark ? '#3B82F6' : '#3B82F6'}
                                        size={30}
                                        speed={1200}
                                    />
                                </View>
                                <Text style={[
                                    styles.messageText,
                                    { color: isDark ? '#FFFFFF' : '#1A202C', marginLeft: 10 }
                                ]}>
                                    Creating your image...
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

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

                <BlurView
                    intensity={80}
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.inputContainer}
                >
                    <TouchableOpacity
                        style={styles.attachButton}
                        onPress={pickImage}
                    >
                        <Ionicons name="image-outline" size={24} color={isDark ? '#FFFFFF' : '#3B82F6'} />
                    </TouchableOpacity>

                    <TextInput
                        style={[
                            styles.input,
                            { color: isDark ? '#FFFFFF' : '#1A202C', borderColor: isDark ? '#4A5568' : '#E2E8F0' }
                        ]}
                        placeholder="Type a message..."
                        placeholderTextColor={isDark ? '#A0AEC0' : '#A0AEC0'}
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
                                        ? (isDark ? '#4A5568' : '#CBD5E0')
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
                </BlurView>
            </KeyboardAvoidingView>

            {/* Info Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={infoModalVisible}
                onRequestClose={() => setInfoModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setInfoModalVisible(false)}
                >
                    <BlurView
                        intensity={90}
                        tint={isDark ? 'dark' : 'light'}
                        style={[
                            styles.modalContent,
                            { backgroundColor: isDark ? 'rgba(26, 32, 44, 0.9)' : 'rgba(255, 255, 255, 0.9)' }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#1A202C' }]}>
                                How to Use Slop AI
                            </Text>
                            <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#1A202C'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="chatbubble-outline" size={24} color="#3B82F6" style={styles.infoIcon} />
                            <Text style={[styles.infoText, { color: isDark ? '#FFFFFF' : '#1A202C' }]}>
                                Type a message describing what you want to create
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="image-outline" size={24} color="#10B981" style={styles.infoIcon} />
                            <Text style={[styles.infoText, { color: isDark ? '#FFFFFF' : '#1A202C' }]}>
                                Add images for reference or inspiration
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="sparkles-outline" size={24} color="#F59E0B" style={styles.infoIcon} />
                            <Text style={[styles.infoText, { color: isDark ? '#FFFFFF' : '#1A202C' }]}>
                                Our AI will generate a unique image based on your input
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="download-outline" size={24} color="#EC4899" style={styles.infoIcon} />
                            <Text style={[styles.infoText, { color: isDark ? '#FFFFFF' : '#1A202C' }]}>
                                Save and share your creations with friends
                            </Text>
                        </View>
                    </BlurView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesContent: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pulseContainer: {
        width: 30,
        height: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        marginHorizontal: 8,
        fontSize: 16,
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
        backgroundColor: 'white',
        borderRadius: 12,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIcon: {
        marginRight: 12,
    },
    infoText: {
        fontSize: 16,
        flex: 1,
    },
}); 