import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GameLevel } from "@/src/game/levels";
import { makeStyles, useTheme } from "@/src/theme";

type LevelCardProps = { level: GameLevel; completed: boolean; locked: boolean; best?: number; onPress: () => void };

export function LevelCard({ level, completed, locked, best, onPress }: LevelCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable disabled={locked} onPress={onPress} style={({ pressed }) => [styles.card, completed && styles.complete, pressed && styles.pressed, locked && styles.locked]}>
      <View style={styles.cardTop}>
        <View style={[styles.number, completed && styles.numberComplete]}><Text style={styles.numberText}>{level.id}</Text></View>
        {locked ? <Ionicons name="lock-closed" size={17} color={colors.muted} /> : <Ionicons name={completed ? "checkmark-circle" : "play-circle"} size={22} color={completed ? colors.success : colors.brandPrimary} />}
      </View>
      <Text style={styles.title} numberOfLines={1}>{level.title}</Text>
      <Text style={styles.difficulty}>{level.difficulty}</Text>
      <View style={styles.footer}>
        <Text style={styles.par}>PAR {level.par}</Text>
        {best ? <Text style={styles.best}>{best} movimientos</Text> : <Text style={styles.best}>{level.tubes.length - 2} colores</Text>}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  card: { width: "48%", minHeight: 140, marginBottom: 12, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
  complete: { borderColor: colors.success, backgroundColor: "rgba(16, 185, 129, 0.10)" },
  locked: { opacity: 0.5 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  number: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  numberComplete: { backgroundColor: colors.success },
  numberText: { color: colors.onSurfaceSecondary, fontSize: 14, fontWeight: "800" },
  title: { color: colors.onSurface, fontSize: 15, fontWeight: "800", marginBottom: 4 },
  difficulty: { color: colors.muted, fontSize: 12 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15 },
  par: { color: colors.brandPrimary, fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  best: { color: colors.muted, fontSize: 10 },
}));