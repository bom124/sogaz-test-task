import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CollectionScreen } from "./src/screens/collection-screen";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <CollectionScreen />
    </SafeAreaProvider>
  );
}
