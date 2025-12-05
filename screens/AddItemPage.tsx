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
    View,
    useColorScheme
} from 'react-native';

import ConnectionData from '@/assets/data/connections.json';
import { ConnectionProfile } from '@/constants/types';
import Colors from '@/constants/Colors';

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
  status: false
};

export default function AddScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState<ConnectionProfile>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ConnectionProfile, string>>>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const updateField = (key: keyof ConnectionProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    let valid = true;
    let newErrors: Partial<Record<keyof ConnectionProfile, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Profile name is required.";
      valid = false;
    }

    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = "IP Address is required.";
      valid = false;
    } else if (!ipRegex.test(formData.ipAddress)) {
      newErrors.ipAddress = "Invalid IPv4 format.";
      valid = false;
    }

    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      newErrors.port = "Port must be 1 - 65535.";
      valid = false;
    }

    if (!formData.protocol.trim()) {
      newErrors.protocol = "Protocol is required.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCreate = () => {
    if (!validate()) return;

    try {
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

      console.log("Created (Session Only):", newProfile);

      Alert.alert("Success", "Profile created (Session Only)!", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (e) {
      Alert.alert("Error", "Failed to create.");
    }
  };

  const renderLabel = (text: string) => (
    <Text style={[styles.label, { color: theme.textSecondary }]}>{text}</Text>
  );

  const renderInput = (
    field: keyof ConnectionProfile,
    placeholder: string,
    keyboardType: any = 'default',
    secure = false
  ) => {
    const isError = !!errors[field];
    const isFocused = focusedInput === field;

    return (
      <View style={{ marginBottom: 16 }}>
        {renderLabel(field === 'ipAddress' ? 'IP Address' : field.charAt(0).toUpperCase() + field.slice(1))}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: isError ? theme.error : (isFocused ? theme.tint : theme.border),
              borderWidth: isFocused || isError ? 1.5 : 1,
            }
          ]}
          value={field === 'port' ? formData.port.toString() : String(formData[field])}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          onFocus={() => setFocusedInput(field)}
          onBlur={() => setFocusedInput(null)}
          onChangeText={(text) => {
            if (field === 'port') {
                const val = text.replace(/[^0-9]/g, '');
                updateField('port', parseInt(val) || 0);
            } else {
                updateField(field, text);
            }
          }}
        />
        {isError && <Text style={[styles.errorText, { color: theme.error }]}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      >

        <View style={{ marginBottom: 30 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>New Connection</Text>
          <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
            Configure a new secure proxy endpoint
          </Text>
        </View>

        <View style={styles.section}>
          {renderInput('name', 'e.g. Office VPN')}
          {renderInput('location', 'e.g. Amsterdam, NL')}
        </View>

        <View style={styles.section}>
            {renderInput('ipAddress', '0.0.0.0', 'numeric')}

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                     {renderInput('port', '8080', 'number-pad')}
                </View>
                <View style={{ flex: 1 }}>
                     {renderInput('protocol', 'WireGuard')}
                </View>
            </View>
        </View>

        <View style={[styles.section, { marginBottom: 24 }]}>
          {renderLabel('Transport Layer')}
          <View style={[styles.segmentContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {['TCP', 'UDP'].map((type) => {
                const isActive = formData.transportLayer === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.segmentBtn,
                      isActive && { backgroundColor: theme.tint, shadowColor: theme.tint }
                    ]}
                    onPress={() => updateField('transportLayer', type)}
                  >
                    <Text style={[
                      styles.segmentText,
                      { color: isActive ? '#fff' : theme.textSecondary, fontWeight: isActive ? '700' : '500' }
                    ]}>{type}</Text>
                  </TouchableOpacity>
                );
            })}
          </View>
        </View>

        <View style={styles.section}>
            {renderLabel('Security Settings')}

            <View style={[styles.switchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View>
                    <Text style={[styles.switchTitle, { color: theme.text }]}>Obfuscation</Text>
                    <Text style={[styles.switchSubtitle, { color: theme.textSecondary }]}>Hide VPN traffic</Text>
                </View>
                <Switch
                    value={formData.obfuscation}
                    onValueChange={(val) => updateField('obfuscation', val)}
                    trackColor={{ false: theme.border, true: theme.tint }}
                    thumbColor={"#fff"}
                />
            </View>

            <View style={{ marginTop: 20 }}>
                {renderLabel('Authentication Type')}
                <View style={[styles.segmentContainer, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 16 }]}>
                    {['password', 'uuid', 'certificate'].map((type) => {
                        const isActive = formData.authType === type;
                        return (
                        <TouchableOpacity
                            key={type}
                            style={[
                            styles.segmentBtn,
                            isActive && { backgroundColor: theme.tint }
                            ]}
                            onPress={() => updateField('authType', type)}
                        >
                            <Text style={[
                            styles.segmentText,
                            { fontSize: 13, color: isActive ? '#fff' : theme.textSecondary, fontWeight: isActive ? '700' : '500' }
                            ]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                        </TouchableOpacity>
                        );
                    })}
                </View>

                <TextInput
                    style={[
                        styles.input,
                        {
                          backgroundColor: theme.card,
                          color: theme.text,
                          borderColor: theme.border,
                          height: 50
                        }
                    ]}
                    value={formData.authValue}
                    placeholder={formData.authType === 'password' ? "Enter Password..." : "Enter Key/UUID..."}
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={formData.authType === 'password'}
                    onChangeText={(text) => updateField('authValue', text)}
                />
            </View>
        </View>

        <View style={{ marginTop: 40 }}>
            <TouchableOpacity
                onPress={handleCreate}
                activeOpacity={0.8}
                style={[styles.primaryBtn, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
            >
                <Text style={styles.primaryBtnText}>Create Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.ghostBtn}
            >
                <Text style={[styles.ghostBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subHeader: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 14,
  },
  switchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17
  },
  ghostBtn: {
    padding: 10,
    alignItems: 'center'
  },
  ghostBtnText: {
    fontWeight: '600',
    fontSize: 16
  }
});