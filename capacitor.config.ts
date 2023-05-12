/* eslint-disable @typescript-eslint/naming-convention */
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.congressname.congressname',
  appName: 'CONGRESS NAME',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 10000,
      launchAutoHide: false,
      splashFullScreen: false,
      androidScaleType: 'FIT_CENTER',
      backgroundColor: '#220532'
    },
    Badge: {
      persist: true,
      autoClear: true,
    },
    LocalNotifications: {
      sound: 'juntos.mp3',
      iconColor: '#220532',
      smallIcon: 'ic_stat_icon_android',
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'strapi',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
        biometricSubTitle: 'Log in using your biometric',
      },
    },
  },
  server: {
    hostname: 'google.com',
    androidScheme: 'https',
  },
};

export default config;
