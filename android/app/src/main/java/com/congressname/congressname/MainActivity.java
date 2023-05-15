package com.congressname.congressname;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
          
import androidx.core.content.ContextCompat;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
          
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (Build.VERSION.SDK_INT >= 33) {
        if (ContextCompat.checkSelfPermission(
          this, android.Manifest.permission.POST_NOTIFICATIONS) ==
          PackageManager.PERMISSION_GRANTED) {

        } else if (shouldShowRequestPermissionRationale(android.Manifest.permission.POST_NOTIFICATIONS)) {

        } else {
          requestPermissions(
            new String[] { android.Manifest.permission.POST_NOTIFICATIONS },
            123);
        }
      }
    }

    // Initializes the Bridge
  }
}
