import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

// 1. Import or Define the Type
import ConnectionData from '@/assets/data/connections.json';
import { ConnectionProfile } from '@/constants/types';

const connections: ConnectionProfile[] = ConnectionData as ConnectionProfile[]

export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  // 3. State for the Form Data
  const [formData, setFormData] = useState<ConnectionProfile | null>(null);

  // 4. Load Data on Mount
  useEffect(() => {
    // Simulate finding the item in the DB
    const foundItem = connections.find(item => item.id === id);
    
    if (foundItem) {
      setFormData(foundItem);
    } else {
      setFormData({
        id: id as string,
        name: "", location: "", ipAddress: "", port: 8080,
        protocol: "OpenVPN", transportLayer: "TCP", authType: "password",
        authValue: "", obfuscation: false, status: false
      });
    }
  }, [id]);

  const handleSave = () => {
    // Here you would normally save to AsyncStorage or API
    console.log("Saving Data:", formData);
    Alert.alert("Success", "Connection Profile updated!");
    router.back();
  };

  if (!formData) return <View style={styles.loading}><Text>Loading...</Text></View>;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        
        <Text style={styles.headerTitle}>Edit Configuration</Text>
        <Text style={styles.subHeader}>ID: {id}</Text>

        {/* --- SECTION: GENERAL --- */}
        <View style={styles.section}>
          <Text style={styles.label}>Profile Name</Text>
          <TextInput 
            style={styles.input} 
            value={formData.name}
            placeholder="e.g. Office VPN"
            onChangeText={(text) => setFormData({...formData, name: text})}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput 
            style={styles.input} 
            value={formData.location}
            placeholder="e.g. Bucharest, RO"
            onChangeText={(text) => setFormData({...formData, location: text})}
          />
        </View>

        {/* --- SECTION: NETWORK --- */}
        <View style={styles.section}>
          <Text style={styles.label}>IP Address</Text>
          <TextInput 
            style={styles.input} 
            value={formData.ipAddress}
            placeholder="192.168.1.1"
            keyboardType="numeric"
            onChangeText={(text) => setFormData({...formData, ipAddress: text})}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Port</Text>
              <TextInput 
                style={styles.input} 
                value={formData.port.toString()}
                keyboardType="number-pad"
                onChangeText={(text) => setFormData({...formData, port: parseInt(text) || 0})}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Protocol</Text>
              <TextInput 
                style={styles.input} 
                value={formData.protocol}
                onChangeText={(text) => setFormData({...formData, protocol: text})}
              />
            </View>
          </View>
        </View>

        {/* --- SECTION: TRANSPORT LAYER (Buttons) --- */}
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
                onPress={() => setFormData({...formData, transportLayer: type as 'TCP' | 'UDP'})}
              >
                <Text style={[
                  styles.toggleText, 
                  formData.transportLayer === type && styles.toggleTextActive
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- SECTION: SECURITY & AUTH --- */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Obfuscation</Text>
            <Switch 
              value={formData.obfuscation}
              onValueChange={(val) => setFormData({...formData, obfuscation: val})}
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
                onPress={() => setFormData({...formData, authType: type as any})}
              >
                <Text style={[
                  styles.toggleText, 
                  formData.authType === type && styles.toggleTextActive
                ]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Auth Value ({formData.authType})</Text>
          <TextInput 
            style={styles.input} 
            value={formData.authValue}
            placeholder={formData.authType === 'password' ? "Enter Password" : "Enter Key/UUID"}
            secureTextEntry={formData.authType === 'password'}
            onChangeText={(text) => setFormData({...formData, authValue: text})}
          />
        </View>

        {/* --- ACTION BUTTONS --- */}
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  // Toggle Button Styles
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
  // Switch
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
  // Footer Buttons
  saveBtn: { 
    backgroundColor: '#2f95dc', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3
  },
  saveBtnText: { 
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