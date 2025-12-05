import { NativeModules } from 'react-native';

// "NuclearModule" must match the name returned by getName() in your Kotlin file
const { NuclearModule } = NativeModules;

interface NuclearInterface {
  logMessage(message: string): void;
}

// Export it so your UI can use it
export default NuclearModule as NuclearInterface;