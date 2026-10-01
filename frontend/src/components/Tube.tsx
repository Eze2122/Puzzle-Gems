import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Gem } from "@/src/components/Gem";
import { GemColor } from "@/src/game/levels";
import { TUBE_CAPACITY } from "@/src/game/logic";
import { makeStyles, useTheme } from "@/src/theme";

type TubeProps = {
  gems: GemColor[];
  selected: boolean;
  invalid: boolean;
  onPress: () => void;
  index: number;
};

export function Tube({ gems, selected, invalid, onPress, index }: TubeProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const slots = Array.from({ length: TUBE_CAPACITY }, (_, position) => gems[TUBE_CAPACITY - 1 - position]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tubo ${index + 1}, ${gems.length} gemas`}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <View style={[styles.tube, selected && styles.selected, invalid && styles.invalid]}>
        <View style={styles.rim}><View style={styles.rimLight} /></View>
        <View style={styles.stack}>
          {slots.map((gem, slotIndex) => (
            <View key={`${index}-${slotIndex}`} style={styles.slot}>
              {gem ? <Gem color={gem} selected={selected && slotIndex === 0} size={42} /> : <View style={styles.emptySlot} />}
            </View>
          ))}
        </View>
        <View style={styles.base} />
      </View>
      <Text style={[styles.tubeNumber, selected && styles.selectedNumber]}>{String(index + 1).padStart(2, "0")}</Text>
      {gems.length === 0 && <Ionicons name="add" size={15} color={colors.muted} style={styles.emptyIcon} />}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  pressable: { width: "31%", minWidth: 82, alignItems: "center", minHeight: 150, paddingVertical: 5 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  tube: {
    width: "82%", height: 136, borderRadius: 22, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.brandTertiary, overflow: "hidden", alignItems: "center", justifyContent: "flex-end",
    shadowColor: colors.brand, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  selected: { borderColor: colors.brandPrimary, borderWidth: 2, shadowOpacity: 0.58, shadowRadius: 18 },
  invalid: { borderColor: colors.error, borderWidth: 2 },
  rim: { position: "absolute", top: -4, width: "78%", height: 12, borderRadius: 999, borderWidth: 2, borderColor: colors.borderStrong, backgroundColor: colors.surfaceTertiary },
  rimLight: { width: "52%", height: 2, borderRadius: 2, backgroundColor: colors.brandPrimary, opacity: 0.5 },
  stack: { width: "100%", height: 126, paddingTop: 6, alignItems: "center", justifyContent: "flex-start" },
  slot: { height: 30, alignItems: "center", justifyContent: "center" },
  emptySlot: { width: 34, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.border, opacity: 0.38 },
  base: { position: "absolute", bottom: 0, width: "66%", height: 7, borderRadius: 999, backgroundColor: colors.borderStrong, opacity: 0.38 },
  tubeNumber: { color: colors.muted, fontSize: 11, letterSpacing: 1.2, marginTop: 6, fontWeight: "700" },
  selectedNumber: { color: colors.brandPrimary },
  emptyIcon: { position: "absolute", top: 57 },
}));