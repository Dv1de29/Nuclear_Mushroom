import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import ConnectionData from '@/assets/data/connections.json';
import { ConnectionProfile } from '@/constants/types';

// 1. Initial Empty State
const INITIAL_STATE: ConnectionProfile = {
  id: "",
  name: "",
  location: "",
  ipAddress: "",
  port: 8080,
  protocol: "OpenVPN",
  transportLayer: 'UDP',
  authType: 'password',
  authValue: "",
  obfuscation: false,
  status: false // Default to disconnected
};

export default function AddScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<ConnectionProfile>(INITIAL_STATE);
  
  // 2. NEW: State to hold error messages
  const [errors, setErrors] = useState<Partial<Record<keyof ConnectionProfile, string>>>({});

  // 3. Helper to update field & clear specific error
  const updateField = (key: keyof ConnectionProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    let valid = true;
    let newErrors: Partial<Record<keyof ConnectionProfile, string>> = {};

    // Name Check
    if (!formData.name.trim()) {
      newErrors.name = "Profile name is required.";
      valid = false;
    }

    // IP Check
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = "IP Address is required.";
      valid = false;
    } else if (!ipRegex.test(formData.ipAddress)) {
      newErrors.ipAddress = "Invalid IPv4 format (e.g. 192.168.1.1).";
      valid = false;
    }

    // Port Check
    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      newErrors.port = "Port must be 1 - 65535.";
      valid = false;
    }

    // Protocol Check
    if (!formData.protocol.trim()) {
      newErrors.protocol = "Protocol is required.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCreate = () => { // <--- Removed 'async'
    if (!validate()) {
      // Alert.alert("Error", "Please fix...");
      return;
    }

    try {
      // 1. USE IMPORTED DATA DIRECTLY (Don't parse it)
      // Since we are not using storage, we check against the static file + whatever we have in memory
      // NOTE: This check is weak because it only checks the initial JSON file, not items added in this session.
      const currentList: ConnectionProfile[] = ConnectionData as ConnectionProfile[]; 

      const isDuplicate = currentList.some(item => 
        item.ipAddress === formData.ipAddress && 
        item.port === formData.port
      );    

      if (isDuplicate) {
        setErrors(prev => ({ ...prev, ipAddress: "This IP:Port combination already exists." }));
        return;
      }

      const newProfile = {
        ...formData,
        id: Math.random().toString(36).slice(2, 9)
      };

      // 2. LOG IT (Since we aren't saving to disk)
      console.log("Created (Session Only):", newProfile);
      
      // 3. IMPORTANT: You need a way to pass this back to AdminScreen!
      // Since you aren't saving to disk, AdminScreen won't know about this new item
      // unless you use navigation parameters or a Global State.
      
      Alert.alert("Success", "Profile created (Session Only)!", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (e) {
      Alert.alert("Error", "Failed to create.");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        
        <Text style={styles.headerTitle}>New Connection</Text>
        <Text style={styles.subHeader}>Configure a new proxy endpoint</Text>

        {/* --- GENERAL SECTION --- */}
        <View style={styles.section}>
          <Text style={styles.label}>Profile Name</Text>
          <TextInput 
            style={[styles.input, errors.name && styles.inputError]} 
            value={formData.name}
            placeholder="e.g. Asia Pacific Secure"
            onChangeText={(text) => updateField('name', text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Location</Text>
          <TextInput 
            style={styles.input} 
            value={formData.location}
            placeholder="e.g. Tokyo, JP"
            onChangeText={(text) => updateField('location', text)}
          />
        </View>

        {/* --- NETWORK SECTION --- */}
        <View style={styles.section}>
          <Text style={styles.label}>IP Address</Text>
          <TextInput 
            style={[styles.input, errors.ipAddress && styles.inputError]} 
            value={formData.ipAddress}
            placeholder="0.0.0.0"
            keyboardType="numeric"
            onChangeText={(text) => updateField('ipAddress', text)}
          />
          {errors.ipAddress && <Text style={styles.errorText}>{errors.ipAddress}</Text>}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Port</Text>
              <TextInput 
                style={[styles.input, errors.port && styles.inputError]} 
                value={formData.port.toString()}
                keyboardType="number-pad"
                maxLength={5}
                onChangeText={(text) => {
                    const val = text.replace(/[^0-9]/g, '');
                    updateField('port', parseInt(val) || 0);
                }}
              />
              {errors.port && <Text style={styles.errorText}>{errors.port}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Protocol</Text>
              <TextInput 
                style={[styles.input, errors.protocol && styles.inputError]} 
                value={formData.protocol}
                placeholder="WireGuard"
                onChangeText={(text) => updateField('protocol', text)}
              />
              {errors.protocol && <Text style={styles.errorText}>{errors.protocol}</Text>}
            </View>
          </View>
        </View>

        {/* --- TRANSPORT LAYER --- */}
        <View style={styles.section}>
          <Text style={styles.label}>Transport Layer</Text>
          <View style={styles.toggleRow}>
            {['TCP', 'UDP'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleBtn, 
                  formData.transportLayer === type && styles.toggleBtnActive
                ]}
                onPress={() => updateField('transportLayer', type)}
              >
                <Text style={[
                  styles.toggleText, 
                  formData.transportLayer === type && styles.toggleTextActive
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- SECURITY SECTION --- */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Obfuscation</Text>
            <Switch 
              value={formData.obfuscation}
              onValueChange={(val) => updateField('obfuscation', val)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={formData.obfuscation ? "#2f95dc" : "#f4f3f4"}
            />
          </View>

          <Text style={styles.label}>Authentication Type</Text>
          <View style={styles.toggleRow}>
            {['password', 'uuid', 'certificate'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleBtn, 
                  formData.authType === type && styles.toggleBtnActive
                ]}
                onPress={() => updateField('authType', type)}
              >
                <Text style={[
                  styles.toggleText, 
                  formData.authType === type && styles.toggleTextActive
                ]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Auth Value</Text>
          <TextInput 
            style={styles.input} 
            value={formData.authValue}
            placeholder={formData.authType === 'password' ? "Enter Password" : "Enter Key/UUID"}
            secureTextEntry={formData.authType === 'password'}
            onChangeText={(text) => updateField('authValue', text)}
          />
        </View>

        {/* --- BUTTONS --- */}
        <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
          <Text style={styles.createBtnText}>Create Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    padding: 20,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333',
    marginTop: 10
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 5, // Reduced to make space for error text
  },
  // 4. NEW ERROR STYLES
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
    backgroundColor: '#fff0f0'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 2
  },
  // ... (Toggle, Switch, and Button styles remain the same)
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
    marginBottom: 15
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  toggleText: {
    color: '#666',
    fontWeight: '500'
  },
  toggleTextActive: {
    color: '#2f95dc',
    fontWeight: 'bold'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  createBtn: { 
    backgroundColor: '#4caf50', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3
  },
  createBtnText: { 
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 16 
  },
  cancelBtn: { 
    padding: 15, 
    alignItems: 'center' 
  },
  cancelBtnText: { 
    color: '#e74c3c', 
    fontWeight: '600' 
  }
});