import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface PulseAnimationProps {
    color: string;
    size?: number;
    speed?: number;
    maxScale?: number;
}

export default function PulseAnimation({
    color,
    size = 100,
    speed = 1500,
    maxScale = 1.2,
}: PulseAnimationProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.parallel([
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: maxScale,
                    duration: speed / 2,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: speed / 2,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: 0.6,
                    duration: speed / 2,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: speed / 2,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        Animated.loop(pulse).start();

        return () => {
            pulse.stop();
        };
    }, [scaleAnim, opacityAnim, speed, maxScale]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        backgroundColor: color,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulse: {
        position: 'absolute',
    },
}); 