import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. Import Storage
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // 2. Add State to track role and loading status
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Fetch the role when the app loads
  useEffect(() => {
    const checkRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole'); // Make sure key matches your login
        setIsAdmin(role === 'admin');
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkRole();
  }, []);

  // 4. (Optional) Show nothing or a spinner while checking permissions
  // This prevents the admin tab from "flashing" briefly before disappearing
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          // ... (kept your headerRight logic if needed, removed for brevity)
        }}
      />

      {/* 5. The Conditional Admin Tab */}
      <Tabs.Screen
        name="manage"
        options={{
          title: 'Admin Panel',
          tabBarIcon: ({ color }) => <TabBarIcon name="lock" color={color} />,
          
          // === THE MAGIC LINE ===
          // If isAdmin is true, href is undefined (default behavior).
          // If isAdmin is false, href is null (removes button from tab bar).
          href: isAdmin ? undefined : null, 
        }}
      />
    </Tabs>
  );
}