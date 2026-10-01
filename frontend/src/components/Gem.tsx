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

/**
 * Premium 3D gem rendered as a stack of translucent layers:
 *  - outer pulsing glow (visible when selected)
 *  - depth drop shadow via elevation / shadow props
 *  - radial-ish gradient body (highlight → base → shadow)
 *  - bright faceted top ellipse
 *  - crescent bottom highlight (refractive bottom)
 *  - thin rim light along the top edge
 *  - specular glint + micro-glint
 *  - subtle engraved icon
 *  - entrance sparkle burst
 */
export function Gem({ color, selected = false, size = 42 }: GemProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const palette = colors.gems[color];

  const lift = useSharedValue(0);
  const float = useSharedValue(0);
  const glow = useSharedValue(0);
  const entrance = useSharedValue(0);
  const sparkle = useSharedValue(0);
  const spin = useSharedValue(0);

  // Entrance / landing animation on mount
  useEffect(() => {
    entrance.value = withSpring(1, { damping: 11, stiffness: 190, mass: 0.6 });
    sparkle.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selection: lift + idle float + pulsing glow + slow spin on sparkle
  useEffect(() => {
    lift.value = withSpring(selected ? -12 : 0, { damping: 14, stiffness: 190 });
    if (selected) {
      float.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 950, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 950, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 720, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.45, { duration: 720, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
      spin.value = withRepeat(
        withTiming(1, { duration: 6000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(float);
      cancelAnimation(glow);
      cancelAnimation(spin);
      float.value = withTiming(0, { duration: 160 });
      glow.value = withTiming(0, { duration: 200 });
      spin.value = 0;
    }
  }, [lift, float, glow, spin, selected]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value + float.value },
      { scale: 0.6 + 0.4 * entrance.value },
    ],
    opacity: entrance.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.8 }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
    transform: [{ scale: 0.5 + sparkle.value * 1.3 }],
  }));

  const selectedSparkleStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.55,
    transform: [{ rotate: `${spin.value * 360}deg` }, { scale: 0.9 + glow.value * 0.2 }],
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
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size,
            backgroundColor: palette.base,
            shadowColor: palette.highlight,
          },
          glowStyle,
        ]}
      />

      {/* Rotating cross-glint when selected */}
      <Animated.View
        pointerEvents="none"
        style={[styles.selectedSparkleLayer, { width: size * 1.4, height: size * 1.4 }, selectedSparkleStyle]}
      >
        <View style={[styles.selSparkBar, styles.selSparkBarV, { backgroundColor: palette.highlight }]} />
        <View style={[styles.selSparkBar, styles.selSparkBarH, { backgroundColor: palette.highlight }]} />
      </Animated.View>

      {/* 3D gem body */}
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
        {/* Base gradient */}
        <LinearGradient
          colors={[palette.highlight, palette.base, palette.shadow]}
          start={{ x: 0.3, y: 0.05 }}
          end={{ x: 0.72, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
        />

        {/* Top faceted highlight (big soft ellipse) */}
        <View
          style={[
            styles.topFacet,
            {
              width: bodySize * 0.74,
              height: bodySize * 0.36,
              borderRadius: bodySize,
              backgroundColor: palette.highlight,
            },
          ]}
        />

        {/* Bottom shade for depth */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.38)"]}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
          pointerEvents="none"
        />

        {/* Bottom crescent highlight (refractive bottom) */}
        <View
          style={[
            styles.bottomCrescent,
            {
              width: bodySize * 0.68,
              height: bodySize * 0.28,
              borderRadius: bodySize,
              borderBottomColor: palette.highlight,
            },
          ]}
        />

        {/* Rim light along top edge */}
        <View
          style={[
            styles.rimLight,
            {
              width: bodySize * 0.82,
              height: bodySize * 0.82,
              borderRadius: bodySize,
              borderTopColor: palette.highlight,
            },
          ]}
        />

        {/* Specular glint (primary) */}
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

        {/* Secondary micro-glint */}
        <View
          style={[
            styles.glintSmall,
            {
              width: bodySize * 0.09,
              height: bodySize * 0.09,
              borderRadius: bodySize,
              backgroundColor: colors.surfaceInverse,
            },
          ]}
        />

        {/* Engraved icon (very subtle) */}
        <Ionicons
          name={GEM_ICON[color]}
          size={size * 0.3}
          color={palette.icon}
          style={styles.icon}
        />
      </View>

      {/* Sparkle burst on landing */}
      <Animated.View
        pointerEvents="none"
        style={[styles.sparkleLayer, { width: size * 1.4, height: size * 1.4 }, sparkleStyle]}
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
    shadowOpacity: 0.95,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  selectedSparkleLayer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  selSparkBar: { position: "absolute", opacity: 0.55, borderRadius: 2 },
  selSparkBarV: { width: 1.4, height: "100%" },
  selSparkBarH: { width: "100%", height: 1.4 },
  body: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowOpacity: 0.6,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  topFacet: {
    position: "absolute",
    top: "6%",
    opacity: 0.82,
  },
  bottomCrescent: {
    position: "absolute",
    bottom: "8%",
    borderBottomWidth: 1.6,
    opacity: 0.55,
    backgroundColor: "transparent",
  },
  rimLight: {
    position: "absolute",
    top: "2%",
    borderWidth: 1,
    borderColor: "transparent",
    borderTopWidth: 1.2,
    opacity: 0.5,
  },
  glint: {
    position: "absolute",
    top: "16%",
    left: "22%",
    opacity: 0.92,
    transform: [{ rotate: "-28deg" }],
  },
  glintSmall: {
    position: "absolute",
    bottom: "22%",
    right: "22%",
    opacity: 0.6,
  },
  icon: {
    opacity: 0.35,
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
    opacity: 0.78,
  },
  sparkleBar: {
    position: "absolute",
    opacity: 0.95,
    borderRadius: 2,
  },
  sparkleBarV: { width: 2, height: "68%" },
  sparkleBarH: { width: "68%", height: 2 },
}));
