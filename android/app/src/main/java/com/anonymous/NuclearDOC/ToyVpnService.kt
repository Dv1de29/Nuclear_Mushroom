package com.anonymous.NuclearDOC

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log

class ToyVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "STOP") {
            stopVpn()
            return START_NOT_STICKY
        }

        if (intent?.action == "START") {
            startVpn()
        }

        return START_STICKY
    }

    private fun startVpn() {
        if (vpnInterface != null) return

        try {
            val builder = Builder()
            
            // 1. Virtual Interface Configuration
            builder.setSession("NuclearDOC Proxy")
            builder.addAddress("10.0.0.2", 24)
            
            // 2. Split Tunneling: Only route the Hackathon Subnet through the VPN
            builder.addRoute("192.168.105.0", 24)

            // 3. Establish the interface
            vpnInterface = builder.establish()
            Log.d("NuclearVPN", "Foreground VPN Service Started Successfully")

        } catch (e: Exception) {
            Log.e("NuclearVPN", "Failed to start VPN Service", e)
            stopSelf()
        }
    }

    private fun stopVpn() {
        try {
            vpnInterface?.close()
            vpnInterface = null
            Log.d("NuclearVPN", "VPN Service Stopped")
        } catch (e: Exception) {
            Log.e("NuclearVPN", "Error closing VPN interface", e)
        }
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopVpn()
    }
}