// android/app/src/main/java/com/mobile/ble/BleScannerModule.kt
package com.kdvc.mobile.ble

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.*
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BleScannerModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    private val scanner: BluetoothLeScanner? =
        BluetoothAdapter.getDefaultAdapter()?.bluetoothLeScanner
    private var scanCallback: ScanCallback? = null

    override fun getName() = "BleScanner"

    @ReactMethod
    fun startScan(promise: Promise) {
        if (scanner == null) {
            promise.reject("NO_SCANNER", "BLE scanning not supported")
            return
        }

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val device = result.device
                val data = Arguments.createMap().apply {
                    putString("address", device.address)
                    putString("name", device.name ?: "")
                    putInt("rssi", result.rssi)
                    
                    // Extrair manufacturer data (se existir)
                    val manufacturerData = result.scanRecord?.manufacturerSpecificData
                    if (manufacturerData != null && manufacturerData.size() > 0) {
                        val key = manufacturerData.keyAt(0)
                        val bytes = manufacturerData.get(key)
                        val array = Arguments.createArray()
                        bytes.forEach { array.pushInt(it.toInt() and 0xFF) }
                        putArray("manufacturerData", array)
                        putInt("manufacturerId", key)
                    }
                }
                
                sendEvent("onDeviceFound", data)
            }

            override fun onScanFailed(errorCode: Int) {
                sendEvent("onScanFailed", Arguments.createMap().apply {
                    putInt("errorCode", errorCode)
                })
            }
        }

        try {
            scanner.startScan(null, settings, scanCallback)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message)
        }
    }

    @ReactMethod
    fun stopScan(promise: Promise) {
        scanCallback?.let { scanner?.stopScan(it) }
        scanCallback = null
        promise.resolve(null)
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
