import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

interface ItemType {
    id: string,
    title: string,
    status: boolean,
}

// Mock Data
const MOCK_ITEMS: ItemType[] = Array.from({ length: 15 }, (_, i) => ({
    id: i.toString(),
    title: `System Log Entry #${i + 1}`,
    status: false
}));

export default function AdminScreen() {
    const router = useRouter();
    const [userName, setUserName] = useState("Admin");
    const [items, setItems] = useState<ItemType[]>(MOCK_ITEMS);

    useEffect(() => {
        const loadUser = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
        };
        loadUser();
    }, []);

    // LOGIC CHANGE: Toggle status directly when clicking the row
    const handleItemPress = (id: string) => {
        setItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === id) {
                    return { ...item, status: !item.status };
                }
                return item;
            });
        });
    };

    const handleLogout = () => {
        AsyncStorage.clear();
        router.replace('/(auth)/login');
    };

    const renderItem = ({ item }: { item: ItemType }) => (
        <TouchableOpacity
            style={styles.itemRow}
            onPress={() => handleItemPress(item.id)}
        >
            <Text style={styles.itemText}>{item.title}</Text>
            
            {/* Status Badge */}
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
                        <Text style={styles.userName}>{userName} Panel</Text>
                    </View>

                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={styles.loginLink}>Log out</Text>
                    </TouchableOpacity>
                </View>

                {/* === MAIN CONTENT === */}
                <View style={styles.content}>
                    
                    {/* List Container - Now fills the screen */}
                    <View style={styles.listContainer}>
                        <Text style={styles.listHeader}>All System Logs</Text>
                        <FlatList
                            data={items}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>

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
        backgroundColor: '#333', // Darker avatar for Admin
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontWeight: 'bold',
        color: '#fff',
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
        // Removed alignItems: 'center' so list stretches to full width
    },

    // --- LIST STYLES ---
    listContainer: {
        flex: 1, // <--- CHANGED: Uses full remaining height
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 10,
        marginBottom: 20,
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
        paddingVertical: 15, // Slightly taller rows for admin
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        minWidth: 40,
        alignItems: 'center'
    },
    statusText: {
        fontSize: 11,
        color: 'white',
        fontWeight: 'bold',
    },
});