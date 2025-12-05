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
} from 'react-native';

import ConnectionData from '@/assets/data/connections.json';

import { ConnectionProfile } from '@/constants/types';

interface ItemType {
    id: string,
    title: string,
    status: boolean,
}

const connections: ConnectionProfile[] = ConnectionData as ConnectionProfile[];;

const MOCK_ITEMS: ItemType[] = Array.from({ length: 15 }, (_, i) => ({
    id: i.toString(),
    title: `System Log Entry #${i + 1}`,
    status: false
}));

export default function HomePage() {
    const router = useRouter();
    const [userName, setUserName] = useState("Guest");
    const [items, setItems] = useState<ConnectionProfile[]>(connections)
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

    // Removed the useRef since we don't need it with the new logic

    const selectedItem = useMemo(() => {
        return items.find(item => item.id === selectedItemId)
    }, [items, selectedItemId]) // Added 'items' to dependency array so it updates when status changes

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
                // Logic: If selected, toggle it. If not selected, turn it off.
                if (item.id === selectedItemId) {
                    return { ...item, status: !item.status };
                }
                // Force everyone else to false
                return { ...item, status: false };
            })
        })
    };

    const handleLoginLink = () => {
        AsyncStorage.clear()
        router.replace('/(auth)/login');
    };

    const handleItemPress = (item: ConnectionProfile) => {
        setSelectedItemId(item.id);
    };

    const renderItem = ({ item }: { item: ConnectionProfile }) => (
        <TouchableOpacity
            style={[
                styles.itemRow,
                // Highlight the selected row slightly
                item.id === selectedItemId && { backgroundColor: '#f0f8ff' }
            ]}
            onPress={() => { handleItemPress(item) }}
        >
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={[
                styles.statusBadge,
                { backgroundColor: item.status ? '#4caf50' : '#e74c3c' }
            ]}>
                <Text style={styles.statusText}>{item.status ? "OK" : "OFF"}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* === NAVBAR === */}
                <View style={styles.navbar}>
                    <View style={styles.userContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.userName}>Hello, {userName}</Text>
                    </View>

                    <TouchableOpacity onPress={handleLoginLink}>
                        <Text style={styles.loginLink}>{userName !== "Guest" ? "Log out" : "Log In"}</Text>
                    </TouchableOpacity>
                </View>

                {/* === MAIN CONTENT === */}
                <View style={styles.content}>

                    {/* === LIST SECTION === */}
                    <View style={styles.listContainer}>
                        <Text style={styles.listHeader}>Recent Activity</Text>
                        <FlatList
                            data={items}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        />
                    </View>

                    {/* Big Blue Button */}
                    {selectedItem && <>
                        <TouchableOpacity
                            style={[
                                styles.bigBlueButton,
                                { backgroundColor: selectedItem.status ? '#2f95dc' : '#e74c3c' }
                            ]}
                            onPress={handleBigButtonPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={selectedItem.status ? "rocket" : "rocket-outline"} size={40} color="white" />
                        </TouchableOpacity>

                        <Text style={styles.helperText}>
                            {`Server is ${selectedItem.status ? "ON" : "OFF"}`}
                        </Text>
                    </>}

                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 20,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 35,
        height: 35,
        backgroundColor: '#eee',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontWeight: 'bold',
        color: '#666',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    loginLink: {
        color: '#6200ee',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 40,
    },

    // --- LIST STYLES ---
    listContainer: {
        width: '100%',
        maxHeight: 250,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 10,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#eee'
    },
    listHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold',
    },

    // --- BUTTON STYLES ---
    bigBlueButton: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        marginBottom: 20,
    },
    helperText: {
        fontSize: 18,
        color: '#555',
        fontWeight: '500',
    }
});