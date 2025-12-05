import React from 'react';
// 1. We switch to standard React Native components
import { StyleSheet, View, Text, Button, Alert } from 'react-native';

// 2. Import the bridge we just created (.. goes up one folder to 'app/')
import NuclearModule from '../NuclearNative';

export default function TabOneScreen() {

  const testNativeConnection = () => {
    // 3. This function calls your colleagues' Kotlin code
    if (NuclearModule) {
      NuclearModule.logMessage("Hello from React Native UI!");
      Alert.alert("Success", "I just sent a signal to Android Studio! Check Logcat.");
    } else {
      Alert.alert("Error", "NuclearModule is null. Did you run 'npx expo run:android'?");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuclear Connection</Text>

      {/* 4. A separator line */}
      <View style={styles.separator} />

      <Text style={styles.instruction}>
        Pressing this button will trigger the{'\n'}
        <Text style={styles.code}>logMessage()</Text> function in Kotlin.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Test Native Bridge"
          onPress={testNativeConnection}
          color="#2f95dc"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Explicit white background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#eee',
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
  },
  code: {
    fontFamily: 'monospace', // Makes it look like code
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    width: '80%', // Make button wide but not full width
  }
});