import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/presentation/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const alertCompat = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
        window.alert(title + '\n\n' + message);
        if (onOk) onOk();
    } else {
        Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    }
};

const MOCK_PARTNERS = [
    {
        id: 1,
        name: 'GreenBite',
        location: 'Jacksonville',
        badge: 'High Protein / Low Carb',
        items: [
            { id: 101, name: 'Grilled Chicken Salad 🥗', price: 12, cals: 400 },
            { id: 102, name: 'Salmon Quinoa Bowl 🐟', price: 15, cals: 520 },
        ]
    },
    {
        id: 2,
        name: 'Avocado Toast Co.',
        location: 'NYC',
        badge: 'Vegan / Keto',
        items: [
            { id: 201, name: 'Loaded Avo Toast 🥑', price: 14, cals: 350 },
            { id: 202, name: 'Power Smoothie 🥤', price: 8, cals: 210 },
        ]
    }
];

export default function PartnersScreen() {
    const router = useRouter();
    const [simulating, setSimulating] = useState(false);

    const handleSimulatePurchase = async (item: any, partnerName: string) => {
        alertCompat('POS Scan Simulation', `Generating your Personal QR Code...\n\n(Simulating the Restaurant Cashier scanning your phone...)`, async () => {
            setSimulating(true);
            setTimeout(async () => {
                try {
                    const sp = await AsyncStorage.getItem('soleri_budget_spent');
                    const cl = await AsyncStorage.getItem('soleri_calories_consumed');
                    const newBudget = (sp ? parseFloat(sp) : 0) + item.price;
                    const newCals = (cl ? parseInt(cl, 10) : 0) + item.cals;

                    await AsyncStorage.setItem('soleri_budget_spent', newBudget.toString());
                    await AsyncStorage.setItem('soleri_calories_consumed', newCals.toString());

                    alertCompat('Transaction Approved! ✅', `The restaurant POS successfully synced with Soleri.\n\nDeducted: $${item.price}\nAdded: ${item.cals} Kcal\n\nReturning to your Dashboard!`, () => {
                        router.replace('/' as any);
                    });
                } catch (e) {
                    console.error(e);
                } finally {
                    setSimulating(false);
                }
            }, 2500);
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Partner Restaurants (O2O)</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Info box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color={Colors.lime} />
                    <Text style={styles.infoText}>
                        Use your digital Soleri VIP QR Code at partner restaurants to automatically sync your budget and calories.
                    </Text>
                </View>

                {/* Partner cards */}
                {MOCK_PARTNERS.map(partner => (
                    <View key={partner.id} style={styles.partnerCard}>
                        <View style={styles.partnerHeader}>
                            <View>
                                <Text style={styles.partnerName}>{partner.name}</Text>
                                <Text style={styles.partnerLoc}>📍 {partner.location}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{partner.badge}</Text>
                            </View>
                        </View>

                        <View style={styles.itemsContainer}>
                            {partner.items.map(item => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemSpecs}>${item.price} • {item.cals} Kcal</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.qrButton}
                                        onPress={() => handleSimulatePurchase(item, partner.name)}
                                        disabled={simulating}
                                    >
                                        <Ionicons name="qr-code-outline" size={18} color={Colors.onLime} />
                                        <Text style={styles.qrButtonText}>Pay & Sync</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },

    // ── Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? 40 : 12,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surf2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },

    // ── Content
    scrollContent: {
        padding: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.surf2,
        padding: 14,
        borderRadius: 20,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lime + '40',
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        color: Colors.text,
        lineHeight: 20,
        fontSize: 13,
    },

    // ── Partner card
    partnerCard: {
        backgroundColor: Colors.surface,
        borderRadius: 36,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    partnerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: Colors.surf2,
        paddingBottom: 14,
        marginBottom: 14,
    },
    partnerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    partnerLoc: {
        fontSize: 13,
        color: Colors.muted,
        marginTop: 4,
    },
    badge: {
        backgroundColor: Colors.surf2,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.lime + '50',
    },
    badgeText: {
        fontSize: 10,
        color: Colors.lime,
        fontWeight: 'bold',
    },

    // ── Menu items
    itemsContainer: {
        gap: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
    },
    itemSpecs: {
        fontSize: 13,
        color: Colors.muted,
        marginTop: 4,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lime,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    qrButtonText: {
        color: Colors.onLime,
        fontWeight: 'bold',
        fontSize: 13,
    },
});
