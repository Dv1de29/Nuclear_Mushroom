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
  View,
  useColorScheme,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NuclearModule from '../app/NuclearNative';
import usersData from '../assets/data/log.json';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
        const user = usersData.users.find(u => u.email === email);

        if (!user) {
            throw new Error("Wrong email")
        }

        if (user.password !== password) {
            throw new Error("Wrong password");
        }

        await AsyncStorage.setItem('userRole', user.role);
        await AsyncStorage.setItem('userName', user.name);

        console.log("Login Success!");
        router.replace('/(tabs)');
    } catch(e: any) {
        const errorMsg = e.message || "Unknown error";
        if(NuclearModule) {
            NuclearModule.logMessage(`Login Error: ${errorMsg}`);
        }
        Alert.alert("Login Failed", errorMsg);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    setValue: (text: string) => void,
    placeholder: string,
    isPassword = false,
    keyboardType: any = 'default'
  ) => {
    const isFocused = focusedInput === label;
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: isFocused ? theme.tint : theme.border,
              borderWidth: isFocused ? 1.5 : 1,
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={setValue}
          secureTextEntry={isPassword}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocusedInput(label)}
          onBlur={() => setFocusedInput(null)}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            <View style={styles.headerContainer}>
                <View style={[styles.logoContainer, { backgroundColor: theme.tint }]}>
                    <Ionicons name="shield-checkmark" size={40} color="white" />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Sign in to access your secure dashboard
                </Text>
            </View>

            <View style={styles.formContainer}>
                {renderInput('Email Address', email, setEmail, 'john@example.com', false, 'email-address')}
                {renderInput('Password', password, setPassword, '••••••••', true)}

                <TouchableOpacity style={styles.forgotBtn}>
                    <Text style={[styles.forgotText, { color: theme.tint }]}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.loginBtnText}>Sign In</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account?</Text>
                <TouchableOpacity>
                    <Text style={[styles.signupText, { color: theme.tint }]}> Create Account</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
        </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 15,
  },
  signupText: {
    fontSize: 15,
    fontWeight: '700',
  }
});