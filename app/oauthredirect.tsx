import { Redirect } from "expo-router";
import React from "react";

export default function OAuthRedirect() {
  return <Redirect href="/(tabs)/home" />;
}
