package com.anonymous.NuclearDOC

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NuclearModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NuclearModule"
    }

    // THIS is where @ReactMethod belongs
    @ReactMethod
    fun logMessage(message: String) {
        Log.d("Nuclear_Logs", message)
    }

    // If you were using "activateEngine" before, keep it here too:
    @ReactMethod
    fun activateEngine(code: String) {
        Log.d("Nuclear_Logs", "Engine Activated: $code")
    }
}