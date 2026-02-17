// android/app/src/main/java/com/yourapp/ble/BleBroadcasterModule.kt
package com.kdvc.mobile.ble

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.*
import android.os.ParcelUuid
import com.facebook.react.bridge.*

class BleBroadcasterModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    private val advertiser: BluetoothLeAdvertiser? =
        BluetoothAdapter.getDefaultAdapter()?.bluetoothLeAdvertiser
    private var callback: AdvertiseCallback? = null
    private var scanner: BluetoothLeScanner? =
	BluetoothAdapter.getDefaultAdapter()?.bluetoothLeScanner
    private var scanCallback: ScanCallback? = null

    override fun getName() = "BleBroadcaster"

    @ReactMethod
	fun start(companyId: Int, payload: ReadableArray, promise: Promise) {
        if (advertiser == null) {
            promise.reject("NO_ADVERTISER", "BLE advertising not supported")
            return
        }
        val bytes = ByteArray(payload.size()) { i -> payload.getInt(i).toByte() }

        if (bytes.size > 31) {
            promise.reject("PAYLOAD_TOO_LARGE", "Payload ${bytes.size} bytes > 31")
            return
        }

        val data = AdvertiseData.Builder()
            .addManufacturerData(companyId, bytes)
            .setIncludeTxPowerLevel(true)
            .build()

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(true)
            .build()

        callback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
                promise.resolve(null)
            }
            override fun onStartFailure(errorCode: Int) {
                promise.reject("START_FAILED", "Error $errorCode")
            }
        }
        advertiser.startAdvertising(settings, data, callback)
    }

    @ReactMethod
    fun stop(promise: Promise) {
        callback?.let { advertiser?.stopAdvertising(it) }
        callback = null
        promise.resolve(null)
    }
} 
