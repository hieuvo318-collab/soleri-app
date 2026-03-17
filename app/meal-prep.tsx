import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors } from '../src/presentation/theme';
import { getProfile } from '../src/data/local/dao';
import { IProfile } from '../src/core/entities';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Data for Tracks
const TRACKS = [
    {
        id: 'high-protein',
        title: 'High Protein / Muscle Building',
        icon: 'barbell-outline',
        description: 'Focus on muscle growth, high protein.',
        color: '#E63946',
        estimatedBaseCost: 110,
        meals: {
            breakfast: 'Oatmeal with whey protein and almonds',
            lunch: 'Grilled chicken breast with sweet potatoes and broccoli',
            dinner: 'Salmon with quinoa and spinach salad',
        },
        categories: [
            { name: 'Protein', items: ['Chicken Breast (3 lbs) - ~$15', 'Eggs (30 px) - ~$12', 'Tofu (4 blocks) - ~$8', 'Whey Protein - ~$25'] },
            { name: 'Carbs', items: ['Sweet potatoes (2 lbs) - ~$5', 'Oats (2 lbs) - ~$5', 'Quinoa (1 lb) - ~$6'] },
            { name: 'Veggies & Fruits', items: ['Broccoli (1.5 lbs) - ~$5', 'Spinach (1 lb) - ~$4'] },
            { name: 'Fat', items: ['Peanut butter (1 jar) - ~$6', 'Almonds (0.5 lbs) - ~$8'] }
        ]
    },
    {
        id: 'mediterranean',
        title: 'Mediterranean / Health',
        icon: 'leaf-outline',
        description: 'Heart health, rich in antioxidants.',
        color: '#2A9D8F',
        estimatedBaseCost: 140,
        meals: {
            breakfast: 'Greek yogurt with honey, walnuts, and grapes',
            lunch: 'Mediterranean bowl (chicken, quinoa, olives, feta)',
            dinner: 'Baked salmon with roasted asparagus and cherry tomatoes',
        },
        categories: [
            { name: 'Protein', items: ['Salmon (1.5 lbs) - ~$25', 'Greek Yogurt (32 oz) - ~$6', 'Feta Cheese - ~$5'] },
            { name: 'Carbs', items: ['Quinoa (2 lbs) - ~$10', 'Whole wheat pita - ~$4'] },
            { name: 'Veggies & Fruits', items: ['Cherry tomatoes (1 lb) - ~$4', 'Olives (1 jar) - ~$5', 'Asparagus (1 bunch) - ~$4', 'Grapes - ~$5'] },
            { name: 'Fat', items: ['Extra Virgin Olive Oil (1 bottle) - ~$12', 'Walnuts (0.5 lbs) - ~$9'] }
        ]
    },
    {
        id: 'budget-reset',
        title: 'Budget Reset',
        icon: 'wallet-outline',
        description: 'Low-cost ingredients, very high nutrition.',
        color: '#F4A261',
        estimatedBaseCost: 65,
        meals: {
            breakfast: '3 scrambled eggs with cabbage',
            lunch: 'Fried rice with chicken and carrots',
            dinner: 'Roasted chicken thighs with potatoes',
        },
        categories: [
            { name: 'Protein', items: ['Eggs (30 px) - ~$12', 'Frozen Chicken Thighs (4 lbs) - ~$12', 'Peanuts (1 lb) - ~$3'] },
            { name: 'Carbs', items: ['White Rice (5 lbs) - ~$6', 'Potatoes (3 lbs) - ~$4'] },
            { name: 'Veggies & Fruits', items: ['Cabbage (1 head) - ~$3', 'Carrots (2 lbs) - ~$3', 'Apples (3 lbs bag) - ~$5'] },
            { name: 'Fat', items: ['Vegetable Oil (1 bottle) - ~$4', 'Butter (1 lb) - ~$5'] }
        ]
    }
];

const LOCATIONS = [
    { id: 'jax', name: 'Jacksonville', multiplier: 1.0 },
    { id: 'mia', name: 'Miami', multiplier: 1.15 },
    { id: 'nyc', name: 'NYC', multiplier: 1.45 },
    { id: 'md', name: 'Maryland', multiplier: 1.10 },
    { id: 'ca', name: 'California', multiplier: 1.20 },
    { id: 'sea', name: 'Seattle', multiplier: 1.25 },
    { id: 'rich', name: 'Richmond', multiplier: 1.05 },
    { id: 'tor', name: 'Toronto', multiplier: 1.15 },
    { id: 'spf', name: 'Springfield', multiplier: 1.00 }
];

export default function MealPrepScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState<IProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
    const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
    const [marketMultiplier, setMarketMultiplier] = useState(1.0);

    const [flowState, setFlowState] = useState<'SUGGESTION' | 'APPROVED'>('SUGGESTION');
    const [unselectedItems, setUnselectedItems] = useState<Set<string>>(new Set());

    const toggleItem = (itemName: string) => {
        const newSet = new Set(unselectedItems);
        if (newSet.has(itemName)) {
            newSet.delete(itemName);
        } else {
            newSet.add(itemName);
        }
        setUnselectedItems(newSet);
    };

    useEffect(() => {
        async function fetchProfile() {
            try {
                const userId = await AsyncStorage.getItem('soleri_user_id');
                if (userId) {
                    const user = await getProfile(userId);
                    if (user) setProfile(user);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const updateMarketPrices = () => {
        const newMultiplier = 0.9 + Math.random() * 0.25;
        setMarketMultiplier(newMultiplier);
        if (Platform.OS === 'web') {
            window.alert('Market prices updated! Prices have fluctuated based on real-time simulated data.');
        } else {
            Alert.alert('Market Updated', 'Prices have fluctuated based on real-time simulated data.');
        }
    };

    const getUserReference = () => {
        if (!profile || profile.target_weight === undefined || profile.current_weight === undefined) return 'Standard User';
        let motive = 'Maintain Weight';
        if (profile.target_weight < profile.current_weight) motive = 'Weight Loss';
        if (profile.target_weight > profile.current_weight) motive = 'Muscle Gain / Weight Gain';

        let activityStr = 'Moderate';
        if (profile.activity_level === 1.2) activityStr = 'Sedentary';
        if (profile.activity_level === 1.55) activityStr = 'Active';
        if (profile.activity_level === 1.725) activityStr = 'Very Active';

        return `${motive} | Activity: ${activityStr}`;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.lime} />
            </SafeAreaView>
        );
    }

    const budget = profile?.weekly_dining_budget || 0;
    const estimatedCost = selectedTrack.estimatedBaseCost * selectedLocation.multiplier * marketMultiplier;
    const isWithinBudget = estimatedCost <= budget;

    const exportToPDF = async () => {
        try {
            const htmlContent = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                </head>
                <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: ${selectedTrack.color}; text-align: center; font-size: 28px;">Grocery List</h1>
                    <h2 style="text-align: center; color: #555; font-size: 18px; margin-top: -10px;">Track: ${selectedTrack.title}</h2>
                    <p style="text-align: center; color: #666; font-size: 14px;">Location: <b>${selectedLocation.name}</b> | Estimated Cost: <b>$${estimatedCost.toFixed(2)}</b></p>
                    <p style="text-align: center; color: #666; font-size: 14px;">User Reference: <b>${getUserReference()}</b></p>
                    <hr style="border: 1px solid #EEE; margin-top: 20px; margin-bottom: 30px;" />
                    ${selectedTrack.categories.map(cat => `
                        <div style="margin-bottom: 24px; padding: 16px; background-color: #F9F9F9; border-left: 4px solid ${selectedTrack.color}; border-radius: 4px;">
                            <h3 style="color: ${selectedTrack.color}; font-size: 18px; text-transform: uppercase; margin-top: 0;">${cat.name}</h3>
                            <ul style="list-style-type: none; padding-left: 0;">
                                ${cat.items.map(item => `
                                    <li style="margin-bottom: 12px; font-size: 16px; border-bottom: 1px dashed #CCC; padding-bottom: 8px; color: ${unselectedItems.has(item) ? '#999' : '#333'}; text-decoration: ${unselectedItems.has(item) ? 'line-through' : 'none'};">
                                        <label>
                                            <input type="checkbox" ${unselectedItems.has(item) ? '' : 'checked'} style="width: 18px; height: 18px; margin-right: 12px; vertical-align: middle;">
                                            <span style="vertical-align: middle;">${item}</span>
                                        </label>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </body>
            </html>
            `;

            if (Platform.OS === 'web') {
                await Print.printAsync({ html: htmlContent });
            } else {
                const { uri } = await Print.printToFileAsync({ html: htmlContent });
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
                } else {
                    Alert.alert('Error', 'Your device does not support file sharing.');
                }
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Export Error', error.message || 'An error occurred while creating PDF');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meal Prep (Free Plan)</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                {/* User Stats */}
                <View style={styles.greetingSection}>
                    <Ionicons name="person-circle" size={36} color={Colors.lime} />
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.greetingText}>
                            Calorie Goal: <Text style={styles.boldText}>{profile?.daily_calorie_goal || 2000} Kcal/day</Text>
                        </Text>
                        <Text style={styles.greetingText}>
                            Weekly Budget: <Text style={styles.boldText}>${budget}</Text>
                        </Text>
                        <Text style={[styles.greetingText, { fontSize: 12, color: Colors.muted, marginTop: 4 }]}>
                            User Profile Ref: {getUserReference()}
                        </Text>
                    </View>
                </View>

                {/* Location Selection */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 }}>
                    <Text style={styles.sectionTitle}>SELECT URBAN CENTER</Text>
                    <TouchableOpacity
                        onPress={updateMarketPrices}
                        style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: Colors.surf2, borderRadius: 20 }}
                    >
                        <Ionicons name="refresh-circle-outline" size={18} color={Colors.lime} />
                        <Text style={{ fontSize: 12, color: Colors.lime, marginLeft: 4, fontWeight: 'bold' }}>Live Price</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationContainer}>
                    {LOCATIONS.map(loc => (
                        <TouchableOpacity
                            key={loc.id}
                            style={[styles.locationBadge, selectedLocation.id === loc.id && styles.locationBadgeActive]}
                            onPress={() => setSelectedLocation(loc)}
                        >
                            <Text style={[styles.locationText, selectedLocation.id === loc.id && styles.locationTextActive]}>
                                {loc.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Track Selection */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>CHOOSE TRACK</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trackScroll} contentContainerStyle={styles.trackContainer}>
                    {TRACKS.map((track) => {
                        const isSelected = selectedTrack.id === track.id;
                        return (
                            <TouchableOpacity
                                key={track.id}
                                style={[styles.trackCard, isSelected && { borderColor: track.color, borderWidth: 2 }]}
                                onPress={() => {
                                    setSelectedTrack(track);
                                    setFlowState('SUGGESTION');
                                    setUnselectedItems(new Set());
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: track.color + '22' }]}>
                                    <Ionicons name={track.icon as any} size={28} color={track.color} />
                                </View>
                                <Text style={styles.trackTitle}>{track.title}</Text>
                                <Text style={styles.trackDesc}>{track.description}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Budget Analysis */}
                <View style={[styles.budgetAnalysisSection, isWithinBudget ? styles.budgetOk : styles.budgetWarning]}>
                    <View style={styles.budgetHeader}>
                        <Ionicons
                            name={isWithinBudget ? "checkmark-circle" : "alert-circle"}
                            size={24}
                            color={isWithinBudget ? Colors.lime : Colors.alert}
                        />
                        <Text style={[styles.budgetTitle, { color: isWithinBudget ? Colors.lime : Colors.alert }]}>
                            {isWithinBudget ? 'Under Control' : 'Over Budget'}
                        </Text>
                    </View>
                    <Text style={styles.budgetMessage}>
                        Estimated cost in <Text style={{ fontWeight: 'bold', color: Colors.text }}>{selectedLocation.name}</Text> for this route is <Text style={{ fontWeight: 'bold', color: Colors.text }}>${estimatedCost.toFixed(2)}</Text>.
                        {isWithinBudget
                            ? ` You are sticking to your weekly budget ($${budget}).`
                            : ` This exceeds your weekly budget ($${budget}). Consider the "Budget Reset" track.`
                        }
                    </Text>
                </View>

                {/* Meal Suggestion Flow */}
                {flowState === 'SUGGESTION' && (
                    <View style={styles.shoppingListSection}>
                        <View style={styles.shoppingHeader}>
                            <Ionicons name="restaurant-outline" size={22} color={Colors.lime} />
                            <Text style={styles.shoppingTitle}>Meal Suggestions</Text>
                        </View>
                        <Text style={styles.shoppingSubtitle}>Here are some suggested meals for {selectedTrack.title} based on your profile.</Text>

                        <View style={styles.mealBlock}>
                            <Text style={[styles.categoryName, { color: selectedTrack.color }]}>BREAKFAST</Text>
                            <Text style={styles.mealText}>{selectedTrack.meals.breakfast}</Text>
                        </View>

                        <View style={styles.mealBlock}>
                            <Text style={[styles.categoryName, { color: selectedTrack.color }]}>LUNCH</Text>
                            <Text style={styles.mealText}>{selectedTrack.meals.lunch}</Text>
                        </View>

                        <View style={styles.mealBlock}>
                            <Text style={[styles.categoryName, { color: selectedTrack.color }]}>DINNER</Text>
                            <Text style={styles.mealText}>{selectedTrack.meals.dinner}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: selectedTrack.color, marginTop: 24 }]}
                            onPress={() => setFlowState('APPROVED')}
                        >
                            <Ionicons name="checkmark-done" size={20} color="#FFF" />
                            <Text style={styles.generateButtonText}>I love this! Generate Grocery List</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Approved Grocery List Flow */}
                {flowState === 'APPROVED' && (
                    <View style={styles.shoppingListSection}>
                        <View style={styles.shoppingHeader}>
                            <Ionicons name="cart-outline" size={22} color={Colors.lime} />
                            <Text style={styles.shoppingTitle}>Grocery List</Text>
                        </View>
                        <Text style={styles.shoppingSubtitle}>Your list is generated based on the approved meal plan. Tap items to select them. Unselected items (grayed out) will be ignored.</Text>

                        {selectedTrack.categories.map((cat, idx) => (
                            <View key={idx} style={styles.categoryBlock}>
                                <Text style={[styles.categoryName, { color: selectedTrack.color }]}>{cat.name}</Text>
                                <View style={styles.itemsBlock}>
                                    {cat.items.map((item, itemIdx) => {
                                        const isUnselected = unselectedItems.has(item);
                                        return (
                                            <TouchableOpacity
                                                key={itemIdx}
                                                style={styles.itemRow}
                                                onPress={() => toggleItem(item)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons
                                                    name={isUnselected ? "square-outline" : "checkbox"}
                                                    size={22}
                                                    color={isUnselected ? Colors.muted : selectedTrack.color}
                                                />
                                                <Text style={[
                                                    styles.itemText,
                                                    isUnselected && { textDecorationLine: 'line-through', color: Colors.muted }
                                                ]}>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: selectedTrack.color }]}
                            onPress={exportToPDF}
                        >
                            <Ionicons name="download-outline" size={20} color="#FFF" />
                            <Text style={styles.generateButtonText}>Export PDF Grocery List</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: Colors.surf2, marginTop: 12 }]}
                            onPress={() => setFlowState('SUGGESTION')}
                        >
                            <Ionicons name="refresh" size={20} color={Colors.text} />
                            <Text style={[styles.generateButtonText, { color: Colors.text }]}>Back to Meal Suggestions</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surf2,
        backgroundColor: Colors.surface,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surf2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // ── Greeting
    greetingSection: {
        flexDirection: 'row',
        backgroundColor: Colors.surf2,
        margin: 16,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    greetingTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    greetingText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 22,
    },
    boldText: {
        fontWeight: 'bold',
        color: Colors.lime,
    },

    // ── Section title
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.muted,
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },

    // ── Location chips
    locationContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
    },
    locationBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Colors.surf2,
        borderWidth: 1,
        borderColor: Colors.surf2,
    },
    locationBadgeActive: {
        backgroundColor: Colors.surface,
        borderColor: Colors.lime,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.muted,
    },
    locationTextActive: {
        color: Colors.lime,
    },

    // ── Track cards
    trackScroll: {
        marginTop: 4,
    },
    trackContainer: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 8,
    },
    trackCard: {
        width: 160,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        marginRight: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    trackTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 6,
    },
    trackDesc: {
        fontSize: 12,
        color: Colors.muted,
        lineHeight: 16,
    },

    // ── Budget analysis
    budgetAnalysisSection: {
        marginHorizontal: 16,
        marginTop: 20,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    budgetOk: {
        backgroundColor: Colors.surface,
        borderColor: Colors.lime,
    },
    budgetWarning: {
        backgroundColor: Colors.surface,
        borderColor: Colors.alert,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    budgetTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    budgetMessage: {
        fontSize: 13,
        color: Colors.muted,
        lineHeight: 20,
    },

    // ── Shopping list
    shoppingListSection: {
        backgroundColor: Colors.surface,
        margin: 16,
        borderRadius: 36,
        padding: 20,
        marginTop: 24,
    },
    shoppingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    shoppingTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginLeft: 10,
    },
    shoppingSubtitle: {
        fontSize: 13,
        color: Colors.muted,
        marginBottom: 24,
    },
    mealBlock: {
        backgroundColor: Colors.surf2,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
    },
    mealText: {
        color: Colors.text,
        fontSize: 15,
        lineHeight: 22,
        marginTop: 4,
    },
    categoryBlock: {
        marginBottom: 20,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    itemsBlock: {
        backgroundColor: Colors.surf2,
        borderRadius: 20,
        padding: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.bg,
    },
    itemText: {
        color: Colors.text,
        fontSize: 14,
        marginLeft: 12,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 36,
        marginTop: 10,
    },
    generateButtonText: {
        color: '#FFF',
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 15,
    },
});
