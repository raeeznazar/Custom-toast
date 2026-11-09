import { useEffect, useRef, useSyncExternalStore } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import {
  getSnapshot,
  hideToast,
  subscribe,
  type ToastTone,
} from "./toastStore";

const FADE_IN_MS = 150;
const FADE_OUT_MS = 200;

/** Matches the Default / Info / Warning / Success / Error palette. Override via `colors` prop. */
const DEFAULT_TONE_COLORS: Record<ToastTone, string> = {
  default: "#4C6FFF",
  info: "#2563EB",
  warning: "#F2B705",
  success: "#22C55E",
  error: "#EF4444",
};

const TONE_SYMBOLS: Record<ToastTone, string> = {
  default: "●",
  info: "ℹ",
  warning: "⚠",
  success: "✓",
  error: "✕",
};

export interface ToastProviderProps {
  /** Distance in px from the bottom of the screen. Raise this if you have a tab bar. Default: 80. */
  bottomOffset?: number;
  /** Override one or more tone colors, e.g. {{ error: '#D00000' }}. Unset tones keep the default. */
  colors?: Partial<Record<ToastTone, string>>;
}

/**
 * Mount exactly once near your app's root (above navigators, inside any providers you have),
 * then call `showToast()` from anywhere. See the package README for a full example.
 */
export function ToastProvider({
  bottomOffset = 80,
  colors,
}: ToastProviderProps): React.JSX.Element | null {
  const toast = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return undefined;

    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_IN_MS,
      useNativeDriver: true,
    }).start();

    const autoHideTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start();
      hideTimer.current = setTimeout(hideToast, FADE_OUT_MS);
    }, toast.durationMs);

    return () => {
      clearTimeout(autoHideTimer);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [toast, opacity]);

  if (!toast) return null;

  const backgroundColor =
    colors?.[toast.tone] ?? DEFAULT_TONE_COLORS[toast.tone];

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { bottom: bottomOffset }]}
    >
      <Animated.View
        style={[styles.pill, { backgroundColor, opacity }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.symbol}>{TONE_SYMBOLS[toast.tone]}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "90%",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  symbol: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginRight: 8,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
});
