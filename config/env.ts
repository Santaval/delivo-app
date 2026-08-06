interface Config {
  apiUrl: string;
  apiKey: string;
  env: string;
  iosAdMobKey: string;
  companyId: string;
  androidAdMobKey: string;
  mapboxAccessToken: string;
  revenueCatIosKey: string;
  revenueCatAndroidKey: string;
  termsUrl: string;
  privacyUrl: string;
  supportEmail: string;
  appStoreUrl: string;
  playStoreUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isOnReview: boolean;
}

const config: Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL as string,
  apiKey: process.env.EXPO_PUBLIC_API_KEY as string,
  iosAdMobKey: process.env.EXPO_PUBLIC_IOS_ADMOB_KEY as string,
  androidAdMobKey: process.env.EXPO_PUBLIC_ANDROID_ADMOB_KEY as string,
  companyId: process.env.EXPO_PUBLIC_COMPANY_ID as string,
  mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string,
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  revenueCatAndroidKey: process.env
    .EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL || "https://appdelivo.com/terms",
  privacyUrl:
    process.env.EXPO_PUBLIC_PRIVACY_URL || "https://appdelivo.com/privacy",
  supportEmail:
    process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "contact@savaldev.com",
  appStoreUrl:
    process.env.EXPO_PUBLIC_APP_STORE_URL ||
    "itms-apps://itunes.apple.com/app/idYOUR_APP_ID",
  playStoreUrl:
    process.env.EXPO_PUBLIC_PLAY_STORE_URL ||
    "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_ID",
  env: "development",
  isDevelopment: true,
  isProduction: false,
  isOnReview: process.env.EXPO_PUBLIC_IS_ON_REVIEW === "true" || false,
};

export default config;
