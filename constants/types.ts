export interface ConnectionProfile {
  id: string;
  name: string;           // Friendly name (e.g., "US Secure")
  location: string;       // Required by "Interfața pentru utilizator"
  ipAddress: string;      // Required by Section 2 (IP serverului proxy)
  port: number;           // Required by Section 2 (Portul)
  protocol: string;       // Required by Section 2 (Protocol/plug-in)
  transportLayer: 'TCP' | 'UDP'; // Required by Section 2 (TCP/UDP)
  authType: 'password' | 'uuid' | 'certificate'; // Required by Section 2 (Autentificare)
  authValue: string;      // The actual password or UUID
  obfuscation: boolean;   // Required by Section 2 (Obfuscare)
  status: 'connected' | 'disconnected' | 'error'; // Required by Section 1 (Status conectivitate)
}