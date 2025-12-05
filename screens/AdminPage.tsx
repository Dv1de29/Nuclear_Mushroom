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
    View
} from 'react-native';

import ConnectionData from '@/assets/data/connections.json';

import { ConnectionProfile } from '@/constants/types';

interface ItemType {
    id: string,
    title: string,
    status: boolean,
}

const MOCK_ITEMS: ItemType[] = Array.from({ length: 15 }, (_, i) => ({
    id: i.toString(),
    title: `System Log Entry #${i + 1}`,
    status: false
}));

const connections: ConnectionProfile[] = ConnectionData as ConnectionProfile[];

export default function AdminScreen() {
    const router = useRouter();
    const [userName, setUserName] = useState("Admin");
    const [items, setItems] = useState<ConnectionProfile[]>(connections);

    // 1. STATE: Track which item is currently expanded (showing the menu)
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
        };
        loadUser();
    }, []);

    // 2. TOGGLE MENU: Opens the clicked row, closes others
    const handleExpandToggle = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    // ACTION: Toggle Status (The logic you had before)
    const handleToggleStatus = (id: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) return { ...item, status: !item.status };
            return item;
        }));
    };

    // ACTION: Delete Logic
    const handleDelete = (id: string) => {
        Alert.alert("Delete Item", `Are you sure you want to delete item ${id}?`, [
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

    // ACTION: Edit Logic
    const handleEdit = (id: string) => {
        // Alert.alert("Edit Mode", `Opening edit screen for ID: ${id}`);
        router.push(`/edit/${id}`)
    };

    const handleAdd = () => {
        router.push('/add')
    }

    const handleLogout = () => {
        AsyncStorage.clear();
        router.replace('/(auth)/login');
    };

    const renderItem = ({ item }: { item: ConnectionProfile }) => {
        const isExpanded = expandedId === item.id;

        return (
            <View style={styles.itemContainer}>
                {/* === THE MAIN ROW === */}
                <TouchableOpacity
                    style={[
                        styles.itemRow,
                        isExpanded && styles.itemRowActive // Change color if open
                    ]}
                    onPress={() => handleExpandToggle(item.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.itemText}>{item.name}</Text>
                    
                    {/* Status Badge - Clicking this toggles status directly */}
                    {/* <TouchableOpacity onPress={() => handleToggleStatus(item.id)}>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.status ? '#4caf50' : '#e74c3c' }
                        ]}>
                            <Text style={styles.statusText}>{item.status ? "OK" : "OFF"}</Text>
                        </View>
                    </TouchableOpacity> */}
                </TouchableOpacity>

                {/* === THE DROPDOWN MENU (Conditionally Rendered) === */}
                {isExpanded && (
                    <View style={styles.dropdownMenu}>
                        
                        {/* Edit Button */}
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item.id)}>
                            <Ionicons name="create-outline" size={20} color="#2f95dc" />
                            <Text style={[styles.actionText, { color: '#2f95dc' }]}>Edit</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Delete Button */}
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
                            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                            <Text style={[styles.actionText, { color: '#e74c3c' }]}>Delete</Text>
                        </TouchableOpacity>

                    </View>
                )}
            </View>
        );
    };

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
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>Add New Log</Text>
                    </TouchableOpacity>
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
        backgroundColor: '#333',
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
    },

    // --- LIST & ITEM STYLES ---
    listContainer: {
        flex: 1,
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
    itemContainer: {
        marginBottom: 0, 
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    itemRowActive: {
        backgroundColor: '#e6f0fa', // Light blue when open
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
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
    
    // --- DROPDOWN MENU STYLES ---
    dropdownMenu: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        padding: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 5,
        backgroundColor: 'white',
        flex: 1, // Share space equally
        justifyContent: 'center',
        marginHorizontal: 5,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    actionText: {
        fontWeight: '600',
        marginLeft: 5,
    },
    divider: {
        width: 1,
        height: '80%',
        backgroundColor: '#ddd',
        marginHorizontal: 5,
    },
    addButton: {
        backgroundColor: '#2f95dc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 30, // Rounded corners (pill shape)
        width: '60%',     // Occupy 80% of width
        alignSelf: 'center', // <--- THIS CENTERS IT HORIZONTALLY
        marginBottom: 20, // Space from bottom
        
        // Shadow (makes it pop)
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8, // Space between icon and text
    }
});