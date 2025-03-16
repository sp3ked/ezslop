import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface IntroScreenProps {
    onImagePress: () => void;
    onFocusInput: () => void;
}

export default function IntroScreen({ onImagePress, onFocusInput }: IntroScreenProps) {
    const handleImagePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onImagePress();
    };

    const handleTextPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFocusInput();
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>AI</Text>
                </View>
            </View>

            <Text style={styles.title}>Slop AI</Text>
            <Text style={styles.subtitle}>Create amazing images with AI</Text>

            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.option} onPress={handleImagePress}>
                    <View style={styles.optionIconContainer}>
                        <Ionicons name="image-outline" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Add an image</Text>
                        <Text style={styles.optionDescription}>
                            Upload a reference image to guide the AI
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleTextPress}>
                    <View style={styles.optionIconContainer}>
                        <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Type a prompt</Text>
                        <Text style={styles.optionDescription}>
                            Describe what you want the AI to create
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips for great results:</Text>
                <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.tipIcon} />
                    <Text style={styles.tipText}>Be specific about what you want</Text>
                </View>
                <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.tipIcon} />
                    <Text style={styles.tipText}>Include details about style and mood</Text>
                </View>
                <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.tipIcon} />
                    <Text style={styles.tipText}>Combine text and images for better results</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0AEC0',
        marginBottom: 32,
        textAlign: 'center',
    },
    optionsContainer: {
        width: '100%',
        marginBottom: 32,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2D3748',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#A0AEC0',
    },
    tipsContainer: {
        width: '100%',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 16,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipIcon: {
        marginRight: 8,
    },
    tipText: {
        fontSize: 14,
        color: '#E2E8F0',
    },
}); 