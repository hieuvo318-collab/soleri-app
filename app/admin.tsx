import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../src/presentation/theme';
import { supabase } from '../src/data/remote/supabase';
import { IProfile } from '../src/core/entities';

export default function AdminScreen() {
    const router = useRouter();

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const [users, setUsers] = useState<IProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Hardcoded Admin Credentials for MVP
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = '123456';

    const handleLogin = () => {
        if (username.toLowerCase() === ADMIN_USER && password === ADMIN_PASS) {
            setIsAuthenticated(true);
            setAuthError('');
            fetchUsers();
        } else {
            setAuthError('Invalid username or password');
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const renderItem = ({ item }: { item: IProfile }) => (
        <View style={styles.userCard}>
            <View style={styles.userHeader}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name || 'Incognito User'}</Text>
                    <Text style={styles.userId}>ID: {item.id ? item.id.substring(0, 8) : 'N/A'}...</Text>
                </View>
            </View>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Calorie Goal</Text>
                    <Text style={styles.statValue}>{item.daily_calorie_goal} kcal</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Weekly Budget</Text>
                    <Text style={styles.statValue}>${item.weekly_dining_budget}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Weight Goal</Text>
                    <Text style={styles.statValue}>{item.target_weight || '--'} kg</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Users (Admin)</Text>
                {isAuthenticated ? (
                    <TouchableOpacity onPress={onRefresh} style={styles.backButton}>
                        <Ionicons name="refresh" size={20} color={Colors.lime} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backButton} />
                )}
            </View>

            {!isAuthenticated ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.loginContainer}
                >
                    <View style={styles.loginCard}>
                        <Ionicons
                            name="shield-checkmark"
                            size={48}
                            color={Colors.lime}
                            style={{ marginBottom: 20 }}
                        />
                        <Text style={styles.loginTitle}>Admin Authentication</Text>
                        <Text style={styles.loginSubtitle}>
                            Please enter your admin credentials.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter username"
                                placeholderTextColor={Colors.muted}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                placeholderTextColor={Colors.muted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {authError ? (
                            <Text style={styles.errorText}>{authError}</Text>
                        ) : null}

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <Text style={styles.loginButtonText}>LOGIN</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            ) : loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.lime} />
                    <Text style={{ marginTop: 10, color: Colors.muted }}>Loading users...</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.lime}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="people-outline" size={64} color={Colors.muted} />
                            <Text style={styles.emptyText}>No users found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },

    // ── User list
    listContainer: {
        padding: 16,
    },
    userCard: {
        backgroundColor: Colors.surface,
        borderRadius: 36,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.surf2,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.lime,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.onLime,   // dark text on lime bg
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    userId: {
        fontSize: 12,
        color: Colors.muted,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Colors.surf2,
        borderRadius: 20,
        padding: 14,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.muted,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.lime,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.muted,
    },

    // ── Login form
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loginCard: {
        backgroundColor: Colors.surface,
        padding: 30,
        borderRadius: 36,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.surf2,
    },
    loginTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    loginSubtitle: {
        fontSize: 14,
        color: Colors.muted,
        marginBottom: 30,
        textAlign: 'center',
    },
    inputGroup: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.muted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: Colors.bg,
        borderWidth: 1,
        borderColor: Colors.surf2,
        borderRadius: 20,
        padding: 14,
        color: Colors.text,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: Colors.lime,
        padding: 16,
        borderRadius: 36,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: Colors.onLime,   // dark text on lime bg
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    errorText: {
        color: Colors.alert,
        marginBottom: 15,
        fontSize: 14,
    },
});
