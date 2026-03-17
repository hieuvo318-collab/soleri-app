import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../src/presentation/theme';
import { AppProgressBar } from '../src/presentation/components/AppProgressBar';
import { getProfile } from '../src/data/local/dao';
import { IProfile } from '../src/core/entities';
import { ReconcilerUseCase } from '../src/core/usecases/TheReconciler';
import { Onboarding } from '../src/presentation/components/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';

const alertCompat = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        window.alert(title + '\n\n' + message);
    } else {
        Alert.alert(title, message);
    }
};

type TabKey = 'today' | 'week' | 'discover' | 'profile';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [profile, setProfile] = useState<IProfile | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
    const [tab, setTab] = useState<TabKey>('today');

    const [budgetSpent, setBudgetSpent] = useState<number>(0);
    const [caloriesConsumed, setCaloriesConsumed] = useState<number>(0);

    useFocusEffect(
        React.useCallback(() => {
            AsyncStorage.getItem('soleri_budget_spent').then((val) => {
                if (val) setBudgetSpent(parseFloat(val));
            });
            AsyncStorage.getItem('soleri_calories_consumed').then((val) => {
                if (val) setCaloriesConsumed(parseInt(val, 10));
            });
        }, []),
    );

    const handleUpdateBudget = async (addedAmount: number) => {
        setBudgetSpent((prev) => {
            const next = prev + addedAmount;
            AsyncStorage.setItem('soleri_budget_spent', next.toString());
            return next;
        });
    };

    const handleUpdateCalories = async (addedCals: number) => {
        setCaloriesConsumed((prev) => {
            const next = prev + addedCals;
            AsyncStorage.setItem('soleri_calories_consumed', next.toString());
            return next;
        });
    };

    const handleResetToday = async () => {
        setBudgetSpent(0);
        setCaloriesConsumed(0);
        await AsyncStorage.removeItem('soleri_budget_spent');
        await AsyncStorage.removeItem('soleri_calories_consumed');
    };

    const weeklyBudgetTotal = profile?.weekly_dining_budget || 0;
    const dailyCaloriesTotal = profile?.daily_calorie_goal || 0;

    const remainingBudget = weeklyBudgetTotal - budgetSpent;
    const remainingCalories = dailyCaloriesTotal - caloriesConsumed;

    const reconciler = new ReconcilerUseCase();
    const recommendation = reconciler.execute(remainingBudget, remainingCalories);

    const budgetProgress =
        weeklyBudgetTotal > 0 ? Math.min(budgetSpent / weeklyBudgetTotal, 1) : 0;
    const calorieProgress =
        dailyCaloriesTotal > 0 ? Math.min(caloriesConsumed / dailyCaloriesTotal, 1) : 0;

    useEffect(() => {
        async function setupProfile() {
            try {
                const userId = await AsyncStorage.getItem('soleri_user_id');
                if (userId) {
                    const user = await getProfile(userId);
                    if (user) {
                        try {
                            const metadata = await AsyncStorage.getItem(
                                'soleri_user_metadata',
                            );
                            if (metadata) {
                                const parsed = JSON.parse(metadata);
                                user.gender = parsed.gender;
                                user.age = parsed.age;
                                user.height = parsed.height;
                            }
                        } catch (e) {
                            console.error('Error parsing metadata', e);
                        }
                        setProfile(user);
                    } else {
                        await AsyncStorage.removeItem('soleri_user_id');
                        await AsyncStorage.removeItem('soleri_user_metadata');
                        setProfile(null);
                    }
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error('AsyncStorage/Supabase Error:', error);
            } finally {
                setLoading(false);
            }
        }
        setupProfile();
    }, []);

    const initials =
        profile?.name
            ?.split(' ')
            .map((p) => p.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('') || 'SO';

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const pageTitle: Record<TabKey, string> = {
        today: 'Today',
        week: 'This Week',
        discover: 'Discover',
        profile: 'Profile',
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.lime} />
            </View>
        );
    }

    if (!profile || isEditingProfile) {
        return (
            <Onboarding
                initialProfile={profile || undefined}
                onComplete={(p) => {
                    setProfile(p);
                    setIsEditingProfile(false);
                }}
                onCancel={profile ? () => setIsEditingProfile(false) : undefined}
            />
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.shell}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>
                            {greeting}, {profile.name || 'friend'}
                        </Text>
                        <Text style={styles.pageTitle}>{pageTitle[tab]}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => setTab('profile')}
                    >
                        <Text style={styles.avatarText}>{initials}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                >
                    {/* ══════════════════════════════════════════ TODAY TAB */}
                    {tab === 'today' && (
                        <View style={styles.page}>
                            {/* Pills */}
                            <View style={styles.pillsRow}>
                                <View style={styles.pill}>
                                    <Text style={styles.pillText}>
                                        💰{' '}
                                        {remainingBudget.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 0,
                                        })}{' '}
                                        left this week
                                    </Text>
                                </View>
                                <View style={[styles.pill, styles.pillSecondary]}>
                                    <Text style={styles.pillText}>
                                        🔥 {remainingCalories} kcal left today
                                    </Text>
                                </View>
                            </View>

                            {/* Budget Card */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons
                                        name="wallet-outline"
                                        size={24}
                                        color={Colors.muted}
                                    />
                                    <Text style={styles.cardLabel}>
                                        Remaining Weekly Budget
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.cardValue,
                                        {
                                            color:
                                                remainingBudget < 0
                                                    ? Colors.alert
                                                    : Colors.lime,
                                        },
                                    ]}
                                >
                                    {remainingBudget.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0,
                                    })}
                                </Text>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.progressTextSmall}>
                                            Spent:{' '}
                                            {budgetSpent.toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 0,
                                            })}
                                        </Text>
                                        <Text style={styles.progressTextSmall}>
                                            {weeklyBudgetTotal.toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 0,
                                            })}
                                        </Text>
                                    </View>
                                    <AppProgressBar
                                        progress={budgetProgress}
                                        preset={remainingBudget < 0 ? 'alert' : 'lime'}
                                        height={8}
                                    />
                                </View>
                            </View>

                            {/* Calorie Card */}
                            <View style={[styles.card, { marginTop: 16 }]}>
                                <View style={styles.cardHeader}>
                                    <Ionicons
                                        name="flame-outline"
                                        size={24}
                                        color={Colors.muted}
                                    />
                                    <Text style={[styles.cardLabel, { flex: 1 }]}>
                                        Remaining Calories Today
                                    </Text>
                                    {recommendation.status !== 'OK' && (
                                        <TouchableOpacity
                                            style={styles.warningTag}
                                            onPress={handleResetToday}
                                        >
                                            <Text style={styles.warningTagText}>
                                                RESET TODAY
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text
                                    style={[
                                        styles.cardValue,
                                        {
                                            color:
                                                remainingCalories < 0
                                                    ? Colors.alert
                                                    : Colors.text,
                                        },
                                    ]}
                                >
                                    {remainingCalories}{' '}
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: '500',
                                            color: Colors.muted,
                                        }}
                                    >
                                        Kcal
                                    </Text>
                                </Text>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.progressTextSmall}>
                                            Consumed: {caloriesConsumed}
                                        </Text>
                                        <Text style={styles.progressTextSmall}>
                                            {dailyCaloriesTotal}
                                        </Text>
                                    </View>
                                    <AppProgressBar
                                        progress={calorieProgress}
                                        preset={remainingCalories < 0 ? 'alert' : 'violet'}
                                        height={8}
                                    />
                                </View>
                            </View>

                            {/* Reconciler Alert */}
                            {recommendation.status !== 'OK' && (
                                <View style={styles.alertBox}>
                                    <View style={styles.alertHeader}>
                                        <Ionicons
                                            name="restaurant"
                                            size={16}
                                            color={Colors.alert}
                                        />
                                        <Text style={styles.alertTitle}>
                                            THE RECONCILER RECOMMENDATION
                                        </Text>
                                    </View>
                                    <Text style={styles.alertMessage}>
                                        {recommendation.message}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ══════════════════════════════════════════ WEEK TAB */}
                    {tab === 'week' && (
                        <View style={styles.page}>
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>Weekly snapshot</Text>
                                <Text style={styles.weekText}>
                                    Planned budget:{' '}
                                    {weeklyBudgetTotal.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0,
                                    })}
                                </Text>
                                <Text style={styles.weekText}>
                                    Spent so far:{' '}
                                    {budgetSpent.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0,
                                    })}
                                </Text>
                                <Text style={styles.weekText}>
                                    Remaining calories today: {remainingCalories}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* ══════════════════════════════════════════ DISCOVER TAB */}
                    {tab === 'discover' && (
                        <View style={styles.page}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => router.replace('/meal-prep' as any)}
                            >
                                <Ionicons
                                    name="restaurant-outline"
                                    size={20}
                                    color={Colors.lime}
                                />
                                <Text style={styles.actionButtonText}>
                                    Meal Prep Tool
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 12 }]}
                                onPress={() => router.replace('/partners' as any)}
                            >
                                <Ionicons
                                    name="storefront-outline"
                                    size={20}
                                    color={Colors.alert}
                                />
                                <Text style={[styles.actionButtonText, { color: Colors.alert }]}>
                                    Partner Restaurants (QR Mode)
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 12 }]}
                                onPress={async () => {
                                    try {
                                        const result =
                                            await ImagePicker.launchImageLibraryAsync(
                                                {
                                                    mediaTypes: ['images'],
                                                    allowsEditing: true,
                                                    aspect: [4, 3],
                                                    quality: 1,
                                                },
                                            );

                                        if (!result.canceled) {
                                            alertCompat(
                                                'AI Vision',
                                                'Analyzing your plate... 🔍 (This may take 2 seconds)',
                                            );
                                            setTimeout(() => {
                                                const mockFoods = [
                                                    {
                                                        name: 'Grilled Chicken Salad 🥗',
                                                        cals: 350,
                                                    },
                                                    {
                                                        name: 'Steak with Mashed Potatoes 🥩',
                                                        cals: 620,
                                                    },
                                                    {
                                                        name: 'Avocado Toast & Egg 🍞',
                                                        cals: 410,
                                                    },
                                                    {
                                                        name: 'Sushi Combo 🍣',
                                                        cals: 580,
                                                    },
                                                    {
                                                        name: 'Spaghetti Bolognese 🍝',
                                                        cals: 710,
                                                    },
                                                ];
                                                const randomFood =
                                                    mockFoods[
                                                        Math.floor(
                                                            Math.random() *
                                                                mockFoods.length,
                                                        )
                                                    ];

                                                alertCompat(
                                                    'AI Analysis Complete ✅',
                                                    `Detected: ${randomFood.name}\nEstimated Calories: ${randomFood.cals} Kcal\n\nThese calories have been added to your daily consumed log!`,
                                                );

                                                handleUpdateCalories(
                                                    randomFood.cals,
                                                );
                                            }, 2500);
                                        }
                                    } catch (error) {
                                        console.log(
                                            'Error picking image: ',
                                            error,
                                        );
                                    }
                                }}
                            >
                                <Ionicons
                                    name="scan-outline"
                                    size={20}
                                    color={Colors.violet}
                                />
                                <Text style={[styles.actionButtonText, { color: Colors.violet }]}>
                                    Scan Meal (AI)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ══════════════════════════════════════════ PROFILE TAB */}
                    {tab === 'profile' && (
                        <View style={styles.page}>
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>Your plan</Text>
                                <Text style={styles.profileLine}>
                                    Budget:{' '}
                                    {weeklyBudgetTotal.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0,
                                    })}{' '}
                                    / week
                                </Text>
                                <Text style={styles.profileLine}>
                                    Daily calories:{' '}
                                    {dailyCaloriesTotal.toLocaleString()} kcal
                                </Text>
                                <Text style={styles.profileLine}>
                                    Current weight:{' '}
                                    {(profile.current_weight ?? 0).toFixed(1)} kg
                                </Text>
                                <Text style={styles.profileLine}>
                                    Target weight:{' '}
                                    {(profile.target_weight ?? 0).toFixed(1)} kg
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 18 }]}
                                onPress={() => setIsEditingProfile(true)}
                            >
                                <Ionicons
                                    name="settings-outline"
                                    size={20}
                                    color={Colors.lime}
                                />
                                <Text style={styles.actionButtonText}>
                                    Update Plan
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 12 }]}
                                onPress={async () => {
                                    await AsyncStorage.removeItem(
                                        'soleri_user_id',
                                    );
                                    await AsyncStorage.removeItem(
                                        'soleri_user_metadata',
                                    );
                                    setProfile(null);
                                }}
                            >
                                <Ionicons
                                    name="log-out-outline"
                                    size={20}
                                    color={Colors.alert}
                                />
                                <Text
                                    style={[
                                        styles.actionButtonText,
                                        { color: Colors.alert },
                                    ]}
                                >
                                    Switch User
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 12 }]}
                                onPress={() => router.replace('/admin' as any)}
                            >
                                <Ionicons
                                    name="shield-checkmark"
                                    size={20}
                                    color={Colors.violet}
                                />
                                <Text
                                    style={[
                                        styles.actionButtonText,
                                        { color: Colors.violet },
                                    ]}
                                >
                                    System Admin
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* ── Bottom Nav ── */}
                <View style={styles.navBar}>
                    {(
                        [
                            { key: 'today',   icon: 'home-outline',    label: 'Today'     },
                            { key: 'week',    icon: 'calendar-outline', label: 'This Week' },
                            { key: 'discover',icon: 'compass-outline',  label: 'Discover'  },
                            { key: 'profile', icon: 'person-outline',   label: 'Profile'   },
                        ] as { key: TabKey; icon: any; label: string }[]
                    ).map(({ key, icon, label }) => (
                        <TouchableOpacity
                            key={key}
                            style={styles.navItem}
                            onPress={() => setTab(key)}
                        >
                            <Ionicons
                                name={icon}
                                size={20}
                                color={tab === key ? Colors.lime : Colors.muted}
                            />
                            <Text
                                style={[
                                    styles.navLabel,
                                    tab === key && styles.navLabelActive,
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    shell: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bg,
    },

    // ── Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    greeting: {
        fontSize: 13,
        color: Colors.muted,
        fontWeight: '500',
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: Colors.text,
        marginTop: 2,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lime,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.onLime,
    },

    // ── Scroll
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 80,
        paddingTop: 8,
    },
    page: {
        paddingTop: 4,
    },

    // ── Cards (unified dark surface, 36px radius)
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 36,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.muted,
        marginLeft: 10,
    },
    cardValue: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 24,
        color: Colors.text,
    },
    progressContainer: {
        marginTop: 10,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressTextSmall: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.muted,
    },

    // ── Section
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.lime,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 12,
    },

    // ── Action Buttons (dark surface, 36px radius)
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        padding: 18,
        borderRadius: 36,
        marginTop: 16,
        gap: 10,
    },
    actionButtonText: {
        color: Colors.lime,
        fontSize: 15,
        fontWeight: '700',
    },

    // ── Warning / Alert
    warningTag: {
        backgroundColor: Colors.alert,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    warningTagText: {
        color: Colors.text,
        fontSize: 10,
        fontWeight: 'bold',
    },
    alertBox: {
        marginTop: 16,
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.alert,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    alertTitle: {
        fontWeight: '800',
        fontSize: 11,
        color: Colors.alert,
        letterSpacing: 1,
        marginLeft: 8,
    },
    alertMessage: {
        fontSize: 13,
        color: Colors.text,
        lineHeight: 20,
        fontWeight: '500',
    },

    // ── Pills
    pillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    pill: {
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: Colors.surface,
    },
    pillSecondary: {
        backgroundColor: Colors.surf2,
    },
    pillText: {
        color: Colors.text,
        fontSize: 11,
        fontWeight: '600',
    },

    // ── Week / Profile text
    weekText: {
        color: Colors.text,
        fontSize: 13,
        marginTop: 6,
    },
    profileLine: {
        color: Colors.text,
        fontSize: 13,
        marginTop: 8,
    },

    // ── Bottom nav
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.surf2,
        paddingVertical: 8,
        paddingBottom: 10,
        backgroundColor: Colors.surface,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    navLabel: {
        fontSize: 11,
        marginTop: 2,
        color: Colors.muted,
        fontWeight: '600',
    },
    navLabelActive: {
        color: Colors.lime,
    },
});
