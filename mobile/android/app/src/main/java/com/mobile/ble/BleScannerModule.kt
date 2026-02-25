// android/app/src/main/java/com/mobile/ble/BleScannerModule.kt
package com.kdvc.mobile.ble

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.*
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BleScannerModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    private var scanCallback: ScanCallback? = null

    override fun getName() = "BleScanner"

    @ReactMethod
    fun startScan(promise: Promise) {
        android.util.Log.d("BleScannerModule", "startScan called")
        val adapter = BluetoothAdapter.getDefaultAdapter()
        val scanner = adapter?.bluetoothLeScanner
        if (scanner == null) {
            android.util.Log.e("BleScannerModule", "Scanner is NULL (BT off or not supported)")
            promise.reject("NO_SCANNER", "BLE scanning not supported or Bluetooth is off")
            return
        }

        // Stop any previous scan
        scanCallback?.let { 
            try {
                scanner.stopScan(it)
            } catch (e: Exception) {
                // ignore
            }
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
                        try {
                            val key = manufacturerData.keyAt(0)
                            val bytes = manufacturerData.get(key)
                            if (bytes != null) {
                                val array = Arguments.createArray()
                                bytes.forEach { array.pushInt(it.toInt() and 0xFF) }
                                putArray("manufacturerData", array)
                                putInt("manufacturerId", key)
                            }
                        } catch (e: Exception) {
                            // ignore parsing error
                        }
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
            android.util.Log.d("BleScannerModule", "scanner.startScan successful")
            promise.resolve(null)
        } catch (e: Exception) {
            android.util.Log.e("BleScannerModule", "scanner.startScan exception: ${e.message}")
            promise.reject("START_FAILED", e.message)
        }
    }

    @ReactMethod
    fun stopScan(promise: Promise) {
        val adapter = BluetoothAdapter.getDefaultAdapter()
        val scanner = adapter?.bluetoothLeScanner
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
