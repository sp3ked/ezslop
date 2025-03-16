import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';

interface ChatHeaderProps {
    title: string;
    onInfoPress?: () => void;
}

export default function ChatHeader({ title, onInfoPress }: ChatHeaderProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleInfoPress = () => {
        if (onInfoPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onInfoPress();
        }
    };

    return (
        <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={styles.container}
        >
            <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A202C' }]}>
                    {title}
                </Text>
                <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.badgeText}>AI</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
                <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color={isDark ? '#FFFFFF' : '#3B82F6'}
                />
            </TouchableOpacity>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    badge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    infoButton: {
        padding: 8,
    },
}); 