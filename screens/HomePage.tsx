import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
    Dimensions
} from 'react-native';

import ConnectionData from '@/assets/data/connections.json';
import { ConnectionProfile } from '@/constants/types';
import Colors from '@/constants/Colors';

const connections: ConnectionProfile[] = ConnectionData as ConnectionProfile[];
const { width } = Dimensions.get('window');

export default function HomePage() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [userName, setUserName] = useState("Guest");
    const [items, setItems] = useState<ConnectionProfile[]>(connections);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const selectedItem = useMemo(() => {
        return items.find(item => item.id === selectedItemId);
    }, [items, selectedItemId]);

    useEffect(() => {
        const loadUser = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
        };
        loadUser();
    }, []);

    const handleBigButtonPress = () => {
        if (!selectedItemId) return;

        setItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === selectedItemId) {
                    return { ...item, status: !item.status };
                }
                return { ...item, status: false };
            })
        })
    };

    const handleLoginLink = () => {
        AsyncStorage.clear();
        router.replace('/(auth)/login');
    };

    const handleItemPress = (item: ConnectionProfile) => {
        setSelectedItemId(item.id);
    };

    const renderItem = ({ item }: { item: ConnectionProfile }) => {
        const isSelected = item.id === selectedItemId;

        return (
            <TouchableOpacity
                style={[
                    styles.cardItem,
                    {
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.tint : 'transparent',
                        borderWidth: isSelected ? 2 : 0
                    }
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardLeft}>
                    <View style={[styles.iconBox, { backgroundColor: isSelected ? theme.tint : theme.background }]}>
                        <Ionicons
                            name={item.protocol.toLowerCase().includes('wireguard') ? "shield-checkmark-outline" : "globe-outline"}
                            size={20}
                            color={isSelected ? '#fff' : theme.textSecondary}
                        />
                    </View>
                    <View>
                        <Text style={[styles.itemTitle, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>{item.location}</Text>
                    </View>
                </View>

                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.1)' }
                ]}>
                    <View style={[styles.statusDot, { backgroundColor: item.status ? '#10B981' : '#EF4444' }]} />
                    <Text style={[
                        styles.statusText,
                        { color: item.status ? '#10B981' : '#EF4444' }
                    ]}>
                        {item.status ? "CONNECTED" : "OFFLINE"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.container}>

                <View style={styles.header}>
                    <View style={styles.userSection}>
                        <View style={[styles.avatar, { backgroundColor: theme.card }]}>
                            <Text style={[styles.avatarText, { color: theme.tint }]}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text style={[styles.greetingLabel, { color: theme.textSecondary }]}>Welcome back,</Text>
                            <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.logoutBtn, { backgroundColor: theme.card }]}
                        onPress={handleLoginLink}
                    >
                        <Ionicons
                            name={userName !== "Guest" ? "log-out-outline" : "log-in-outline"}
                            size={20}
                            color={theme.text}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>

                    <View style={styles.listSection}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Available Connections</Text>
                        <FlatList
                            data={items}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>

                    {selectedItem ? (
                        <View style={styles.controlSection}>
                            <View style={[styles.connectionInfo, { backgroundColor: theme.card }]}>
                                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Selected Server</Text>
                                <Text style={[styles.infoValue, { color: theme.tint }]}>{selectedItem.name}</Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.powerButton,
                                    {
                                        backgroundColor: selectedItem.status ? theme.error : theme.tint,
                                        shadowColor: selectedItem.status ? theme.error : theme.tint
                                    }
                                ]}
                                onPress={handleBigButtonPress}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="power" size={60} color="white" />
                            </TouchableOpacity>

                            <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
                                {selectedItem.status ? "Tap to Disconnect" : "Tap to Connect"}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="earth" size={60} color={theme.border} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Select a server from the list above to connect.
                            </Text>
                        </View>
                    )}

                </View>

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
        paddingVertical: 20,
        marginBottom: 10,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontWeight: '800',
        fontSize: 18,
    },
    greetingLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutBtn: {
        padding: 10,
        borderRadius: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },

    listSection: {
        flex: 1,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 4,
    },
    cardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },

    controlSection: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    connectionInfo: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 25,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '800',
        marginTop: 2,
    },
    powerButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '500',
    },

    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        opacity: 0.6,
        marginBottom: 50,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 15,
        lineHeight: 22,
    }
});