package expo.modules.custom

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.util.Log
import expo.modules.core.interfaces.ReactActivityLifecycleListener
import com.tuya.smart.rnsdk.core.TuyaCoreModule;

class CustomReactActivityLifecycleListener(activityContext: Context) : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    TuyaCoreModule.Companion.initTuyaSDKWithoutOptions(this);
  }

  // Naming is node module name (`expo-custom`) plus value name (`value`) using underscores as a delimiter
  // i.e. `expo_custom_value`
  // `@expo/vector-icons` + `iconName` -> `expo__vector_icons_icon_name`
  private fun getValue(context: Context): String = context.getString(R.string.expo_custom_value).toLowerCase()
}
