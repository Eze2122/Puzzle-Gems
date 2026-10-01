import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { useEffect } from "react";

import { GemColor } from "@/src/game/levels";
import { makeStyles, useTheme } from "@/src/theme";

type GemProps = { color: GemColor; selected?: boolean; size?: number };

const GEM_ICON: Record<GemColor, keyof typeof Ionicons.glyphMap> = {
  ruby: "diamond",
  emerald: "diamond-outline",
  sapphire: "sparkles",
  amethyst: "star",
  topaz: "flash",
  aqua: "water",
  coral: "flame",
};

export function Gem({ color, selected = false, size = 42 }: GemProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const lift = useSharedValue(0);
  const palette = colors.gems[color];

  useEffect(() => {
    lift.value = withSpring(selected ? -9 : 0, { damping: 14, stiffness: 180 });
  }, [lift, selected]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));
  return (
    <Animated.View style={[styles.gemWrap, { width: size, height: size }, animatedStyle]}>
      <LinearGradient colors={[palette.highlight, palette.base, palette.shadow]} style={[styles.gem, { borderRadius: size * 0.28 }]}>
        <View style={styles.innerGlow} />
        <Ionicons name={GEM_ICON[color]} size={size * 0.47} color={palette.icon} />
        <View style={[styles.glint, { width: size * 0.18, height: size * 0.1, borderRadius: size }]} />
      </LinearGradient>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  gemWrap: { alignItems: "center", justifyContent: "center" },
  gem: {
    width: "88%",
    height: "88%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: colors.brand,
    shadowOpacity: 0.5,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    overflow: "hidden",
  },
  innerGlow: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.overlayGem, opacity: 0.7 },
  glint: { position: "absolute", top: "18%", left: "22%", backgroundColor: colors.surfaceInverse, opacity: 0.82, transform: [{ rotate: "-32deg" }] },
}));