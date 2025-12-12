// android/app/src/main/java/com/yourapp/ble/BleBroadcasterPackage.kt
package com.mobile.ble

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class BleBroadcasterPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext) =
        listOf(
	    BleBroadcasterModule(reactContext),
	    BleScannerModule(reactContext)
	)

    override fun createViewManagers(rc: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
