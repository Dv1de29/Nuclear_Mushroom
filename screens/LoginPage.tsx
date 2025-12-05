import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import NuclearModule from '../app/NuclearNative';

import AsyncStorage from '@react-native-async-storage/async-storage';
import usersData from '../assets/data/log.json';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 1. Basic Validation
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const fetchUser = async () => {
        try{
            const user = usersData.users.find(u => u.email === email);
            
            if ( !user ){
                throw new Error("Wrong email")
            }

            if ( user.password !== password) {
                throw new Error("Wrong password");
            }

            // 3. SAVE TO ASYNC STORAGE (localStorage doesn't exist)
            await AsyncStorage.setItem('userRole', user.role);
            await AsyncStorage.setItem('userName', user.name);

            console.log("Login Success!");
            router.replace('/(tabs)');
        }
        catch(e: any){
            const errorMsg = e.message || "Unknown error";
            if(NuclearModule) {
                NuclearModule.logMessage(`Login Error: ${errorMsg}`);
            }
            Alert.alert("Login Failed", errorMsg);
            
            // Log to Android Studio
        }
    }

    fetchUser()

    // 2. Mock Authentication Logic
    console.log("Logging in with:", email, password);

    // 3. Navigate to the Tabs
    // We use 'replace' instead of 'push' so the user can't swipe back to the login screen
    // router.replace('/(tabs)'); 
  };

  return (
    // KeyboardAvoidingView moves the UI up when keyboard opens
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address" // Shows @ symbol on keyboard
            autoCapitalize="none"        // Important! Don't capitalize emails
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true} // Hides text (dots)
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles - Similar to CSS but in JS objects
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#6200ee', // Android Purple
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 2, // Shadow on Android
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#6200ee',
    fontSize: 16,
  }
});