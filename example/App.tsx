import { Button, SafeAreaView, StyleSheet, View } from "react-native";

import { showToast, ToastProvider } from "../src";

/**
 * Minimal example app. Copy the two ideas here into your real app:
 *   1. Mount <ToastProvider /> once, near the root.
 *   2. Call showToast(...) from any button press, API callback, etc.
 */
export default function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.buttons}>
        <Button
          title="Default"
          onPress={() => showToast("This is a default toast")}
        />
        <Button
          title="Info"
          onPress={() => showToast("Heads up, something happened", "info")}
        />
        <Button
          title="Warning"
          onPress={() => showToast("Check this before continuing", "warning")}
        />
        <Button
          title="Success"
          onPress={() => showToast("Saved successfully", "success")}
        />
        <Button
          title="Error"
          onPress={() =>
            showToast(
              "No customer account exists for this phone number",
              "error",
            )
          }
        />
      </View>

      {/* Mount once, anywhere near the root — it renders nothing until showToast() is called. */}
      <ToastProvider />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  buttons: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
});
