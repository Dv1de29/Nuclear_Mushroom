package com.anonymous.NuclearDOC

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.Executors

class NuclearModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private val VPN_REQUEST_CODE = 0
    private var pendingPromise: Promise? = null
    
    private var tempIp: String = ""
    private var tempPort: String = ""

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "NuclearModule"

    @ReactMethod
    fun startVPN(ip: String, port: String, promise: Promise) {
        val activity = getCurrentActivity()
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity is null")
            return
        }

        this.tempIp = ip
        this.tempPort = port

        Executors.newSingleThreadExecutor().execute {
            try {
                // 1. Handshake: Check if server is physically reachable
                val socket = Socket()
                socket.connect(InetSocketAddress(ip, port.toInt()), 3000)
                socket.close()

                Log.d("NuclearVPN", "Socket Alive. Sending Data Script...")

                // 2. Data Layer: Send an audit log to the server
                val timestamp = System.currentTimeMillis()
                val dataCommand = "echo 'Android Data Payload | Time: $timestamp' >> traffic_log.txt"
                SshTunneler.executeCommand("server", ip, port.toInt(), dataCommand)
                Log.d("NuclearVPN", "Data Sent.")

                // 3. Data Layer: Read it back to prove full Read/Write Access
                val verifyCommand = "tail -n 1 traffic_log.txt"
                val serverResponse = SshTunneler.executeCommand("server", ip, port.toInt(), verifyCommand)
                Log.d("NuclearVPN", "CONFIRMED DATA: $serverResponse")

                // 4. UI Layer: If successful, trigger the Android VPN OS Permission
                activity.runOnUiThread {
                    if (!serverResponse.contains("Error")) {
                        prepareVpn(activity, promise)
                    } else {
                        promise.reject("SSH_ERROR", serverResponse)
                    }
                }

            } catch (e: Exception) {
                Log.e("NuclearVPN", "Connection Failed", e)
                activity.runOnUiThread {
                    promise.reject("CONNECTION_FAILED", "Could not reach $ip:$port")
                }
            }
        }
    }

    private fun prepareVpn(activity: Activity, promise: Promise) {
        val intent = VpnService.prepare(activity)
        if (intent != null) {
            pendingPromise = promise
            activity.startActivityForResult(intent, VPN_REQUEST_CODE)
        } else {
            startService()
            promise.resolve("CONNECTED")
            sendEvent("VPN_STATUS", "CONNECTED")
        }
    }

    @ReactMethod
    fun stopVPN(promise: Promise) {
        val intent = Intent(reactContext, ToyVpnService::class.java)
        intent.action = "STOP"
        reactContext.startService(intent)
        promise.resolve("DISCONNECTED")
        sendEvent("VPN_STATUS", "DISCONNECTED")
    }

    private fun startService() {
        val intent = Intent(reactContext, ToyVpnService::class.java)
        intent.action = "START"
        intent.putExtra("PROXY_IP", tempIp)
        intent.putExtra("PROXY_PORT", tempPort)
        intent.putExtra("USER", "server") 
        reactContext.startService(intent)
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == VPN_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                startService()
                pendingPromise?.resolve("CONNECTED")
                sendEvent("VPN_STATUS", "CONNECTED")
            } else {
                pendingPromise?.reject("PERMISSION_DENIED", "User denied VPN")
                sendEvent("VPN_STATUS", "DISCONNECTED")
            }
            pendingPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {}

    private fun sendEvent(eventName: String, status: String) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, status)
        }
    }
    
    @ReactMethod
    fun logMessage(message: String) {
        Log.d("Nuclear_Logs", message)
    }

    @ReactMethod
    fun activateEngine(code: String) {
        Log.d("Nuclear_Logs", "Engine Activated: $code")
    }
}