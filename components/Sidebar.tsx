import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SidebarProps {
    isVisible: boolean;
    onClose: () => void;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onSettings: () => void;
    pastChats: { id: string; title: string; date: Date }[];
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.85;

export default function Sidebar({
    isVisible,
    onClose,
    onNewChat,
    onSelectChat,
    onSettings,
    pastChats,
}: SidebarProps) {
    const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;
    const [isInitiallyHidden, setIsInitiallyHidden] = React.useState(true);

    React.useEffect(() => {
        if (isVisible) {
            setIsInitiallyHidden(false);
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -SIDEBAR_WIDTH,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (!isVisible) {
                    setIsInitiallyHidden(true);
                }
            });
        }
    }, [isVisible, translateX, opacity]);

    const handleNewChat = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onNewChat();
        onClose();
    };

    const handleSelectChat = (chatId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelectChat(chatId);
        onClose();
    };

    const handleSettings = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSettings();
        onClose();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    if (isInitiallyHidden && !isVisible) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.backdrop,
                    {
                        opacity: opacity,
                    },
                ]}
            >
                <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.sidebar,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            <View style={styles.profileImage}>
                                <Ionicons name="person" size={24} color="#FFFFFF" />
                            </View>
                        </View>
                        <Text style={styles.profileName}>User</Text>
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
                    <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.newChatText}>New Chat</Text>
                </TouchableOpacity>

                <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>Recent Chats</Text>
                    {pastChats.length > 0 ? (
                        pastChats.map((chat) => (
                            <TouchableOpacity
                                key={chat.id}
                                style={styles.chatItem}
                                onPress={() => handleSelectChat(chat.id)}
                            >
                                <Ionicons name="chatbubble-outline" size={18} color="#A0AEC0" />
                                <View style={styles.chatItemContent}>
                                    <Text style={styles.chatItemTitle} numberOfLines={1}>
                                        {chat.title}
                                    </Text>
                                    <Text style={styles.chatItemDate}>{formatDate(chat.date)}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No recent chats</Text>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerButton} onPress={handleSettings}>
                        <Ionicons name="settings-outline" size={20} color="#A0AEC0" />
                        <Text style={styles.footerButtonText}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    backdropTouchable: {
        flex: 1,
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SIDEBAR_WIDTH,
        height: '100%',
        backgroundColor: '#1A202C',
        borderRightWidth: 1,
        borderRightColor: '#2D3748',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageContainer: {
        marginRight: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 8,
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D3748',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    newChatText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A0AEC0',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    chatList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    chatItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    chatItemTitle: {
        fontSize: 15,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    chatItemDate: {
        fontSize: 12,
        color: '#A0AEC0',
    },
    emptyText: {
        fontSize: 14,
        color: '#A0AEC0',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#2D3748',
        paddingTop: 16,
        marginTop: 16,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    footerButtonText: {
        color: '#A0AEC0',
        fontSize: 16,
        marginLeft: 12,
    },
}); 