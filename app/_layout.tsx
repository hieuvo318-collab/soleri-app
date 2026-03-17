import { useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Web only: intercept browser back/forward button to prevent landing on about:blank
    if (Platform.OS !== "web") return;

    const handlePopState = (event: PopStateEvent) => {
      // If the browser tries to go back and there's no valid previous page
      // (i.e., the previous URL would be about:blank or empty),
      // forcibly navigate to home instead.
      const referrer = document.referrer;
      const isFromExternal =
        !referrer || referrer === "" || referrer.startsWith("about:");

      if (isFromExternal) {
        // Prevent the popstate from taking effect and stay on home
        event.preventDefault();
        // Push home into history so back doesn't escape the app
        window.history.pushState(null, "", "/");
        router.replace("/");
      }
    };

    // Ensure the current state is recorded so popstate fires correctly
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F1115' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="meal-prep" />
      <Stack.Screen name="partners" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}
