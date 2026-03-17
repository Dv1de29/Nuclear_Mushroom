# CQ_NuclearMushroom

## Context

This is an Expo React Native project meant to simulate a VPN mobile app. It was built for the SIE 2025 Hackathon.

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

## Installation

First, install the required dependencies:

```bash
npm install
```

## Running the App

You can start the application using the following scripts configured in the project:

- **Start the Expo development server:**
  ```bash
  npm start
  ```
  This will open a terminal UI and optionally a browser interface. You can scan the QR code with the Expo Go app on your Android or iOS device to run the app directly on your physical device.

- **Run on Android (requires Android Studio / Emulator):**
  ```bash
  npm run android
  ```

- **Run on iOS (requires macOS and Xcode):**
  ```bash
  npm run ios
  ```

- **Run in the Web Browser:**
  ```bash
  npm run web
  ```

## Technologies Used

- Expo
- React Native
- Expo Router
- TypeScript

## The NuclearDOC Native Android Architecture

To meet the strict networking and security requirements of the Hackathon, NuclearDOC bypasses the standard JavaScript sandbox of React Native. Instead, it utilizes a custom-built Native Android Engine written in Kotlin.

The architecture is divided into four distinct Kotlin services, each handling a specific layer of the application's control and data planes:

### 1. NuclearPackage.kt (The Bridge Registrar)
**Role:** The Translator.

**Description:** This file is the entry point for React Native into the Android OS. It implements the `ReactPackage` interface, essentially telling the JavaScript layer, "I have custom native modules available for you to use." It registers `NuclearModule` so that your frontend buttons can directly trigger low-level Kotlin functions.

### 2. NuclearModule.kt (The Orchestrator)
**Role:** The Control Plane & API.

**Description:** This is the brain of the native layer. It exposes callable methods (like `startVPN` and `stopVPN`) to React Native. When a user initiates a connection, this module takes over on a background thread. It orchestrates the entire workflow:
- It performs a TCP socket handshake to verify the target server is physically reachable.
- It commands the `SshTunneler` to execute the secure data payload.
- It evaluates the server's response for success or failure.
- If successful, it interacts with the Android OS to request system-level VPN permissions and launches the `ToyVpnService`.

**Highlight:** It handles asynchronous UI updates, sending real-time event logs and connection statuses back to the React Native frontend.

### 3. SshTunneler.kt (The Security & Data Layer)
**Role:** The Cryptographic Transport.

**Description:** This object manages the secure, authenticated connection to the Hackathon's remote Linux node (192.168.105.2). Utilizing the JSch library, it establishes an SSH session, bypasses manual host-key checks for automation, and authenticates using injected credentials.

**Highlight:** Instead of just opening a blind tunnel, it acts as an auditor. It opens an "Exec" channel to inject a bash command that writes a timestamped payload to `traffic_log.txt` on the server, and then immediately reads it back. This securely proves end-to-end Read/Write access before authorizing the VPN interface.

### 4. ToyVpnService.kt (The Network Interceptor)
**Role:** The OS Interface & Router.

**Description:** This class extends Android's native `VpnService` and runs as a persistent Foreground Service (which triggers the secure Key Icon 🗝️ in the status bar). It creates a virtual network interface (TUN) on the device.

**Highlight:** It implements Intelligent Split Tunneling. Rather than routing the user's entire internet connection through the tunnel, it uses `builder.addRoute("192.168.105.0", 24)`. This surgically intercepts only the traffic destined for the Hackathon's secure subnet, ensuring the user maintains normal, high-speed internet access for everything else.

## The React Native (Frontend) Architecture

Because we pushed all the heavy lifting (SSH, TCP handshakes, VPN routing) down into the Native Kotlin layer, the React Native side is incredibly clean. It acts as the Command Center or Control Panel.

### 1. The Core Responsibilities of the React Side
The React Native code has exactly three jobs:
- **State Management:** Keeping track of what the user types (IP/Port) and what the current connection status is (Disconnected, Connecting, Connected).
- **Bridging to Native:** Taking the user's input and passing it across the bridge using `NativeModules.NuclearModule.startVPN()`.
- **Listening to Events:** Waiting for the Kotlin side to emit status updates (like `VPN_STATUS`) so the UI can change colors or show notifications.

### 2. How the "Bridge" Actually Works (The Flow)
When the user taps "TEST NATIVE VPN", a fascinating sequence of events happens between Javascript and Android:
- **JS to Kotlin (The Call):** React Native serializes the strings "192.168.105.2" and "22" into a JSON-like format and sends them across the bridge to Android.
- **Kotlin executes (The Thread):** `NuclearModule` catches these strings. Because you cannot freeze the UI while doing network stuff, Kotlin spins up a background thread (`Executors.newSingleThreadExecutor()`) to run the SSH commands.
- **Kotlin to JS (The Promise):** If the SSH command fails, Kotlin sends a rejection back across the bridge (`promise.reject("SSH_ERROR")`), which triggers the `catch (error)` block in your Javascript.
- **Kotlin to JS (The Event Emitter):** When the VPN successfully connects, Kotlin uses `DeviceEventManagerModule.RCTDeviceEventEmitter` to broadcast a global event: `("VPN_STATUS", "CONNECTED")`. The React `useEffect` hook is listening for this exact string, catches it, and updates the React state, turning the UI text green.
