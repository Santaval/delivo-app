import { useAuth } from '@/context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export function useAppleAuth() {
  const { appleAuth } = useAuth();

  const onAppleSignIn = async () => {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign In is only available on iOS');
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign In is not available on this device');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        await appleAuth(credential.identityToken);
      } else {
        throw new Error('No identity token received from Apple');
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      throw error;
    }
  };

  return { onAppleSignIn };
} 