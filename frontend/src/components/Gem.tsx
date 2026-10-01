import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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
  const palette = colors.gems[color];

  const lift = useSharedValue(0);
  const float = useSharedValue(0);
  const glow = useSharedValue(0);
  const entrance = useSharedValue(0);
  const sparkle = useSharedValue(0);

  // Entrance / landing animation on mount (also triggers on initial level load)
  useEffect(() => {
    entrance.value = withSpring(1, { damping: 11, stiffness: 190, mass: 0.6 });
    sparkle.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 340, easing: Easing.in(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selection: lift + idle float + pulsing glow
  useEffect(() => {
    lift.value = withSpring(selected ? -11 : 0, { damping: 14, stiffness: 190 });
    if (selected) {
      float.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(float);
      cancelAnimation(glow);
      float.value = withTiming(0, { duration: 160 });
      glow.value = withTiming(0, { duration: 200 });
    }
  }, [lift, float, glow, selected]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value + float.value },
      { scale: 0.55 + 0.45 * entrance.value },
    ],
    opacity: entrance.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.75 }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
    transform: [{ scale: 0.5 + sparkle.value * 1.3 }],
  }));

  const bodySize = size * 0.88;
  const radius = bodySize * 0.5;

  return (
    <Animated.View style={[styles.gemWrap, { width: size, height: size }, wrapStyle]}>
      {/* Pulsing outer glow (visible when selected) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.outerGlow,
          {
            width: size * 1.35,
            height: size * 1.35,
            borderRadius: size,
            backgroundColor: palette.base,
            shadowColor: palette.highlight,
          },
          glowStyle,
        ]}
      />

      {/* 3D gem body: round + top facet + glint + bottom shade */}
      <View
        style={[
          styles.body,
          {
            width: bodySize,
            height: bodySize,
            borderRadius: radius,
            borderColor: palette.highlight,
            shadowColor: palette.base,
          },
        ]}
      >
        {/* Base radial-like gradient */}
        <LinearGradient
          colors={[palette.highlight, palette.base, palette.shadow]}
          start={{ x: 0.3, y: 0.05 }}
          end={{ x: 0.75, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
        />

        {/* Top facet highlight (big soft ellipse) */}
        <View
          style={[
            styles.topFacet,
            {
              width: bodySize * 0.72,
              height: bodySize * 0.34,
              borderRadius: bodySize,
              backgroundColor: palette.highlight,
            },
          ]}
        />

        {/* Bottom shade for depth */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.28)"]}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
          pointerEvents="none"
        />

        {/* Specular glint */}
        <View
          style={[
            styles.glint,
            {
              width: bodySize * 0.22,
              height: bodySize * 0.11,
              borderRadius: bodySize,
              backgroundColor: colors.surfaceInverse,
            },
          ]}
        />

        {/* Tiny secondary glint */}
        <View
          style={[
            styles.glintSmall,
            {
              width: bodySize * 0.1,
              height: bodySize * 0.1,
              borderRadius: bodySize,
              backgroundColor: colors.surfaceInverse,
            },
          ]}
        />

        {/* Center icon */}
        <Ionicons name={GEM_ICON[color]} size={size * 0.42} color={palette.icon} style={styles.icon} />
      </View>

      {/* Sparkle burst on landing */}
      <Animated.View
        pointerEvents="none"
        style={[styles.sparkleLayer, { width: size * 1.35, height: size * 1.35 }, sparkleStyle]}
      >
        <View style={[styles.sparkleRing, { borderColor: palette.highlight, borderRadius: size }]} />
        <View style={[styles.sparkleBar, styles.sparkleBarV, { backgroundColor: colors.surfaceInverse }]} />
        <View style={[styles.sparkleBar, styles.sparkleBarH, { backgroundColor: colors.surfaceInverse }]} />
      </Animated.View>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  gemWrap: { alignItems: "center", justifyContent: "center" },
  outerGlow: {
    position: "absolute",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  body: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  topFacet: {
    position: "absolute",
    top: "7%",
    opacity: 0.78,
  },
  glint: {
    position: "absolute",
    top: "16%",
    left: "22%",
    opacity: 0.9,
    transform: [{ rotate: "-28deg" }],
  },
  glintSmall: {
    position: "absolute",
    bottom: "22%",
    right: "22%",
    opacity: 0.55,
  },
  icon: {
    opacity: 0.55,
    textShadowColor: colors.surfaceInverse,
    textShadowRadius: 2,
    textShadowOffset: { width: 0, height: 1 },
  },
  sparkleLayer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleRing: {
    position: "absolute",
    width: "70%",
    height: "70%",
    borderWidth: 1.3,
    opacity: 0.75,
  },
  sparkleBar: {
    position: "absolute",
    opacity: 0.95,
    borderRadius: 2,
  },
  sparkleBarV: { width: 2, height: "68%" },
  sparkleBarH: { width: "68%", height: 2 },
}));
