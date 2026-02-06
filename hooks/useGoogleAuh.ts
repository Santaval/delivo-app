import { useAuth } from "@/context/AuthContext";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID_ANDROID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_CLIENT_ID_IOS =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export const useGoogleAuth = () => {
  const { googleAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);



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
        console.error("No ID token received from Google");
        return;
      }

      // Create async function to handle the sign in
      const processGoogleSignIn = async () => {
        try {
          if (!authentication.idToken) return;
          await handleGoogleSignIn(authentication.idToken);
          router.push("/(tabs)/home");
          
        } catch (error) {
          console.error("Failed to process Google sign in:", error);
        }
      };

      processGoogleSignIn();
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setIsLoading(true);
      await googleAuth(idToken);
    } catch (error) {
      console.error("Google Sign In Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    await promptAsync();
  };

  return {
    onGoogleSignIn,
    isLoading
  };
};
