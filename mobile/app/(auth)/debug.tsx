import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const NetworkDebugScreen = () => {
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const log = (message: string) => {
        setResults(prev => [...prev, message]);
        console.log(message);
    };

    const testConnection = async () => {
        setResults([]);
        setLoading(true);

        try {
            // Test 1: Get device info
            log('📱 Device Info:');
            log(`  - Expo Go: ${Constants.appOwnership === 'expo' ? 'Yes' : 'No'}`);
            log(`  - Device IP: ${Constants.expoConfig?.hostUri?.split(':')[0] || 'Unknown'}`);
            log('');

            // Test 2: Check configured API URL
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'Not set';
            log('⚙️ Configuration:');
            log(`  - EXPO_PUBLIC_API_URL: ${apiUrl}`);
            log('');

            // Test 3: Try different URLs
            const computerIp = '192.168.56.1'; // CHANGE THIS
            const port = '5001';
            
            const urlsToTest = [
                `http://${computerIp}:${port}/api/auth/login`,
                `http://${computerIp}:${port}/api`,
                `http://${computerIp}:${port}`,
                `http://localhost:${port}/api/auth/login`,
            ];

            log('🧪 Testing URLs:');
            for (const url of urlsToTest) {
                try {
                    log(`  Testing: ${url}`);
                    const response = await axios.get(url, { 
                        timeout: 5000,
                        validateStatus: () => true // Accept any status
                    });
                    log(`  ✅ Response: ${response.status}`);
                } catch (error: any) {
                    log(`  ❌ Failed: ${error.message}`);
                    if (error.code) log(`     Code: ${error.code}`);
                }
                log('');
            }

            log('✅ Test completed!');
        } catch (error: any) {
            log(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        testConnection();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="bug" size={48} color="#3B82F6" />
                <Text style={styles.title}>Network Debugger</Text>
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={testConnection}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Testing...' : 'Run Tests Again'}
                </Text>
            </TouchableOpacity>

            <View style={styles.resultsContainer}>
                {results.map((result, index) => (
                    <Text key={index} style={styles.resultText}>
                        {result}
                    </Text>
                ))}
            </View>

            <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>📝 Instructions:</Text>
                <Text style={styles.instructionText}>
                    1. Find your computer's IP:{'\n'}
                       - Windows: Run 'ipconfig'{'\n'}
                       - Mac/Linux: Run 'ifconfig'{'\n'}
                       - Look for IPv4 Address
                </Text>
                <Text style={styles.instructionText}>
                    2. Make sure backend is running on that IP
                </Text>
                <Text style={styles.instructionText}>
                    3. Update the IP in this file and in api.ts
                </Text>
                <Text style={styles.instructionText}>
                    4. Both devices must be on the same WiFi
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#3B82F6',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    resultText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    instructions: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 8,
    },
    instructionTitle: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    instructionText: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 10,
        lineHeight: 20,
    },
});

export default NetworkDebugScreen;