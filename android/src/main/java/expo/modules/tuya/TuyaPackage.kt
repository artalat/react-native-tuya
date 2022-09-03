package expo.modules.ReactNativeTuya

import android.content.Context
import expo.modules.core.BasePackage
import expo.modules.core.ExportedModule
import expo.modules.core.interfaces.ReactActivityLifecycleListener
import expo.modules.core.interfaces.SingletonModule

class ReactNativeTuyaPackage : BasePackage() {
  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
    return listOf(ReactNativeTuyaReactActivityLifecycleListener(activityContext))
  }
}
