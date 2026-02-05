import { useAuth } from "@/context/AuthContext";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID_ANDROID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_CLIENT_ID_IOS =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export const useGoogleAuth = () => {
  const { googleAuth } = useAuth();



  // console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    // redirectUri,
    // usePKCE: true,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("Google Authentication:", authentication);
      if (!authentication?.idToken) {
        throw new Error("No ID token");
      }

      handleGoogleSignIn(authentication.idToken);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      await googleAuth(idToken);
    } catch (error) {
      console.error("Google Sign In Error:", error);
    }
  };

  const onGoogleSignIn = async () => {
    await promptAsync();
  };

  return {
    onGoogleSignIn,
  };
};
