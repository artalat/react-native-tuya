package expo.modules.ReactNativeTuya

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.util.Log
import expo.modules.core.interfaces.ReactActivityLifecycleListener
import com.tuya.smart.rnsdk.core.TuyaCoreModule;

class ReactNativeTuyaReactActivityLifecycleListener(activityContext: Context) : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    TuyaCoreModule.Companion.initTuyaSDKWithoutOptions(this);
  }
}
