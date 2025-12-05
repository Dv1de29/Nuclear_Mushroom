import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';

import ConnectionData from '@/assets/data/connections.json';
import { ConnectionProfile } from '@/constants/types';
import Colors from '@/constants/Colors';

const connections: ConnectionProfile[] = ConnectionData as ConnectionProfile[];

export default function AdminScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [userName, setUserName] = useState("Admin");
    const [items, setItems] = useState<ConnectionProfile[]>(connections);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
        };
        loadUser();
    }, []);

    const handleExpandToggle = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const handleDelete = (id: string) => {
        Alert.alert("Delete Profile", "Are you sure you want to remove this connection?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    setItems(prev => prev.filter(item => item.id !== id));
                    setExpandedId(null);
                }
            }
        ]);
    };

    const handleEdit = (id: string) => {
        router.push(`/edit/${id}`)
    };

    const handleAdd = () => {
        router.push('/add')
    };

    const handleLogout = () => {
        AsyncStorage.clear();
        router.replace('/(auth)/login');
    };

    const renderItem = ({ item }: { item: ConnectionProfile }) => {
        const isExpanded = expandedId === item.id;

        return (
            <View style={[
                styles.cardContainer,
                { backgroundColor: theme.card, borderColor: theme.border }
            ]}>
                <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => handleExpandToggle(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: isExpanded ? theme.tint : theme.border }]}>
                        <Ionicons
                            name="server-outline"
                            size={20}
                            color={isExpanded ? "#fff" : theme.textSecondary}
                        />
                    </View>

                    <View style={styles.cardTextContainer}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                            {item.ipAddress}:{item.port} • {item.protocol}
                        </Text>
                    </View>

                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={[styles.actionContainer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.background }]}
                            onPress={() => handleEdit(item.id)}
                        >
                            <Ionicons name="settings-outline" size={18} color={theme.tint} />
                            <Text style={[styles.actionText, { color: theme.tint }]}>Configure</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.background, marginLeft: 10 }]}
                            onPress={() => handleDelete(item.id)}
                        >
                            <Ionicons name="trash-outline" size={18} color={theme.error} />
                            <Text style={[styles.actionText, { color: theme.error }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.container}>

                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>{userName}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.logoutBtn, { backgroundColor: theme.card }]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={theme.error} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                            Active Connections ({items.length})
                        </Text>
                    }
                />

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                    onPress={handleAdd}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={26} color="white" />
                    <Text style={styles.fabText}>New Connection</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    logoutBtn: {
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 4,
    },
    cardContainer: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    actionContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 30,
        elevation: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    }
});