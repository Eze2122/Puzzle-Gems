import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, LayoutAnimation, Modal, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, UIManager, useWindowDimensions, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LevelCard } from "@/src/components/LevelCard";
import { Tube } from "@/src/components/Tube";
import { getLevel, LEVELS } from "@/src/game/levels";
import { canMoveGem, cloneTubes, isPuzzleComplete, moveGem, Tubes } from "@/src/game/logic";
import { emptyProgress, loadProgress, Progress, recordCompletion } from "@/src/storage/progress";
import { makeStyles, useTheme } from "@/src/theme";

if (Platform.OS === "android") UIManager.setLayoutAnimationEnabledExperimental?.(true);

type Screen = "levels" | "game";

export default function Index() {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("levels");
  const [activeLevelId, setActiveLevelId] = useState(1);
  const [tubes, setTubes] = useState<Tubes>([]);
  const [history, setHistory] = useState<Tubes[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [invalidTube, setInvalidTube] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    loadProgress().then((stored) => { setProgress(stored); setLoading(false); });
  }, []);

  const activeLevel = useMemo(() => getLevel(activeLevelId), [activeLevelId]);
  const maxUnlocked = Math.min(LEVELS.length, Math.max(1, (progress.completed.length ? Math.max(...progress.completed) : 0) + 1));

  const startLevel = useCallback((levelId: number) => {
    const level = getLevel(levelId);
    setActiveLevelId(level.id);
    setTubes(cloneTubes(level.tubes));
    setHistory([]);
    setSelectedTube(null);
    setInvalidTube(null);
    setMoves(0);
    setComplete(false);
    setScreen("game");
  }, []);

  const goToLevels = useCallback(() => {
    setSelectedTube(null);
    setComplete(false);
    setScreen("levels");
  }, []);

  const handleTubePress = async (target: number) => {
    if (complete || invalidTube !== null) return;
    if (selectedTube === null) {
      if (!tubes[target]?.length) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedTube(target);
      return;
    }
    if (selectedTube === target) {
      setSelectedTube(null);
      return;
    }
    if (!canMoveGem(tubes, selectedTube, target)) {
      setInvalidTube(target);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => { setInvalidTube(null); setSelectedTube(null); }, 280);
      return;
    }
    const nextTubes = moveGem(tubes, selectedTube, target);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHistory((current) => [...current, cloneTubes(tubes)]);
    setTubes(nextTubes);
    setMoves((current) => current + 1);
    setSelectedTube(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPuzzleComplete(nextTubes)) {
      const nextMoves = moves + 1;
      setComplete(true);
      const updated = await recordCompletion(activeLevelId, nextMoves);
      setProgress(updated);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const undo = () => {
    if (!history.length || complete) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTubes(history[history.length - 1]);
    setHistory((current) => current.slice(0, -1));
    setMoves((current) => Math.max(0, current - 1));
    setSelectedTube(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const restart = () => {
    Alert.alert("Reiniciar nivel", "Perderás el progreso de este intento.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Reiniciar", style: "destructive", onPress: () => startLevel(activeLevelId) },
    ]);
  };

  if (loading) {
    return <View style={[styles.root, styles.center]}><ActivityIndicator size="large" color={colors.brandPrimary} /><Text style={styles.loadingText}>Preparando tus gemas…</Text></View>;
  }

  if (screen === "levels") {
    return (
      <LinearGradient colors={[colors.surface, colors.surfaceSecondary, colors.surface]} style={styles.root}>
        <ScrollView contentContainerStyle={[styles.levelsContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.heroRow}>
            <View style={styles.logoMark}><Ionicons name="diamond" size={24} color={colors.brandPrimary} /></View>
            <View><Text style={styles.kicker}>SALA DE GEMAS</Text><Text style={styles.heroTitle}>Jewel Sort</Text></View>
            <View style={styles.progressPill}><Ionicons name="sparkles" size={14} color={colors.brandPrimary} /><Text style={styles.progressText}>{progress.completed.length}/10</Text></View>
          </View>
          <View style={styles.heroCopy}><Text style={styles.heroSubtitle}>Ordena el brillo.</Text><Text style={styles.heroHint}>Cada cristal encuentra su lugar.</Text></View>
          <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Tus niveles</Text><Text style={styles.sectionHint}>Una colección, diez desafíos</Text></View><View style={styles.line} /></View>
          <View style={styles.levelGrid}>
            {LEVELS.map((level) => <LevelCard key={level.id} level={level} completed={progress.completed.includes(level.id)} locked={level.id > maxUnlocked} best={progress.bestMoves[String(level.id)]} onPress={() => startLevel(level.id)} />)}
          </View>
          <View style={styles.tip}><Ionicons name="bulb-outline" size={18} color={colors.warning} /><Text style={styles.tipText}>Consejo: deja siempre un tubo libre para respirar.</Text></View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.surface, colors.surfaceSecondary, colors.surface]} style={styles.root}>
      <ScrollView contentContainerStyle={[styles.gameContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 22 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.gameHeader}>
          <TouchableOpacity testID="back-to-levels" accessibilityRole="button" accessibilityLabel="Volver a niveles" onPress={goToLevels} style={styles.iconButton}><Ionicons name="chevron-back" size={22} color={colors.onSurface} /></TouchableOpacity>
          <View style={styles.gameTitleWrap}><Text style={styles.kicker}>NIVEL {String(activeLevel.id).padStart(2, "0")}</Text><Text style={styles.gameTitle}>{activeLevel.title}</Text></View>
          <TouchableOpacity testID="restart-top" accessibilityRole="button" accessibilityLabel="Reiniciar nivel" onPress={restart} style={styles.iconButton}><Ionicons name="refresh" size={20} color={colors.onSurface} /></TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Ionicons name="swap-horizontal" size={17} color={colors.brandPrimary} /><Text style={styles.statValue}>{moves}</Text><Text style={styles.statLabel}>MOVIMIENTOS</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Ionicons name="flag-outline" size={17} color={colors.warning} /><Text style={styles.statValue}>{activeLevel.par}</Text><Text style={styles.statLabel}>OBJETIVO</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Ionicons name="layers-outline" size={17} color={colors.info} /><Text style={styles.statValue}>{tubes.length - 2}</Text><Text style={styles.statLabel}>COLORES</Text></View>
        </View>
        <View style={[styles.boardCard, { minHeight: width * 0.9 }]}>
          <View style={styles.boardHeader}><Text style={styles.boardTitle}>TABLERO</Text><Text style={styles.boardHint}>{selectedTube === null ? "Toca una gema para comenzar" : "Elige dónde colocarla"}</Text></View>
          <View style={styles.tubeGrid}>
            {tubes.map((tube, index) => <Tube key={index} gems={tube} index={index} selected={selectedTube === index} invalid={invalidTube === index} onPress={() => void handleTubePress(index)} />)}
          </View>
        </View>
        <View style={styles.actionDock}>
          <TouchableOpacity testID="undo-button" accessibilityRole="button" accessibilityLabel="Deshacer movimiento" onPress={undo} disabled={!history.length || complete} style={[styles.actionButton, (!history.length || complete) && styles.disabled]}><Ionicons name="arrow-undo" size={19} color={history.length && !complete ? colors.onSurface : colors.muted} /><Text style={styles.actionText}>Deshacer</Text></TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Reiniciar nivel" onPress={restart} style={styles.actionButton}><Ionicons name="reload-outline" size={19} color={colors.onSurface} /><Text style={styles.actionText}>Reiniciar</Text></TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={complete} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalBackdrop}><View style={styles.completeSheet}>
          <View style={styles.victoryIcon}><LinearGradient colors={[colors.brandPrimary, colors.brand]} style={styles.victoryGradient}><Ionicons name="diamond" size={34} color={colors.onBrandPrimary} /></LinearGradient></View>
          <Text style={styles.completeKicker}>DESTELLO CONSEGUIDO</Text><Text style={styles.completeTitle}>Nivel completado</Text><Text style={styles.completeCopy}>Todas las gemas encontraron su hogar.</Text>
          <View style={styles.resultRow}><View><Text style={styles.resultValue}>{moves}</Text><Text style={styles.resultLabel}>MOVIMIENTOS</Text></View><View style={styles.resultRule} /><View><Text style={styles.resultValue}>{activeLevel.par >= moves ? "★ ★ ★" : "★ ★ ☆"}</Text><Text style={styles.resultLabel}>BRILLO</Text></View></View>
          <TouchableOpacity style={styles.nextButton} onPress={() => activeLevelId < LEVELS.length ? startLevel(activeLevelId + 1) : goToLevels}><Text style={styles.nextButtonText}>{activeLevelId < LEVELS.length ? "Siguiente nivel" : "Volver a niveles"}</Text><Ionicons name="arrow-forward" size={18} color={colors.onBrandPrimary} /></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={goToLevels}><Text style={styles.secondaryButtonText}>Ver todos los niveles</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </LinearGradient>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface }, center: { alignItems: "center", justifyContent: "center" }, loadingText: { color: colors.muted, marginTop: 14, fontSize: 14 },
  levelsContent: { paddingHorizontal: 18 }, gameContent: { paddingHorizontal: 16 },
  heroRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 }, logoMark: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandTertiary, borderWidth: 1, borderColor: colors.borderStrong, marginRight: 12 },
  kicker: { color: colors.brandPrimary, fontSize: 10, letterSpacing: 1.8, fontWeight: "800" }, heroTitle: { color: colors.onSurface, fontSize: 23, fontWeight: "900", letterSpacing: -0.6, marginTop: 3 },
  progressPill: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 999, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border }, progressText: { color: colors.onSurfaceSecondary, fontSize: 13, fontWeight: "800" },
  heroCopy: { marginBottom: 35 }, heroSubtitle: { color: colors.onSurface, fontSize: 32, lineHeight: 36, fontWeight: "900", letterSpacing: -1.2 }, heroHint: { color: colors.muted, fontSize: 15, marginTop: 8 },
  sectionHeading: { flexDirection: "row", alignItems: "center", marginBottom: 16 }, sectionTitle: { color: colors.onSurface, fontSize: 20, fontWeight: "800" }, sectionHint: { color: colors.muted, fontSize: 12, marginTop: 4 }, line: { flex: 1, height: 1, backgroundColor: colors.divider, marginLeft: 18, marginTop: 10 }, levelGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }, tip: { flexDirection: "row", alignItems: "center", gap: 9, padding: 15, borderRadius: 16, backgroundColor: colors.surfaceTertiary, marginTop: 8 }, tipText: { color: colors.muted, fontSize: 12, flex: 1 },
  gameHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 }, iconButton: { width: 46, height: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" }, gameTitleWrap: { flex: 1, alignItems: "center" }, gameTitle: { color: colors.onSurface, fontSize: 19, fontWeight: "900", marginTop: 3 },
  statsRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 20, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }, stat: { flex: 1, alignItems: "center", gap: 3 }, statValue: { color: colors.onSurface, fontSize: 18, fontWeight: "900", marginTop: 2 }, statLabel: { color: colors.muted, fontSize: 8, letterSpacing: 0.8, fontWeight: "800" }, statDivider: { width: 1, height: 30, backgroundColor: colors.divider },
  boardCard: { borderRadius: 25, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.brandTertiary, padding: 14, shadowColor: colors.brand, shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4 }, boardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 17 }, boardTitle: { color: colors.onSurfaceSecondary, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 }, boardHint: { color: colors.muted, fontSize: 11 }, tubeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", rowGap: 8 },
  actionDock: { height: 68, marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }, actionButton: { minWidth: 125, height: 52, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }, actionText: { color: colors.onSurface, fontSize: 13, fontWeight: "700" }, actionDivider: { height: 28, width: 1, backgroundColor: colors.divider }, disabled: { opacity: 0.38 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.76)", alignItems: "center", justifyContent: "center", padding: 22 }, completeSheet: { width: "100%", maxWidth: 390, borderRadius: 30, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.borderStrong, padding: 26, alignItems: "center", shadowColor: colors.brand, shadowOpacity: 0.32, shadowRadius: 30, shadowOffset: { width: 0, height: 12 }, elevation: 10 }, victoryIcon: { width: 78, height: 78, borderRadius: 26, padding: 6, backgroundColor: colors.brandTertiary, marginBottom: 20 }, victoryGradient: { flex: 1, borderRadius: 21, alignItems: "center", justifyContent: "center" }, completeKicker: { color: colors.brandPrimary, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }, completeTitle: { color: colors.onSurface, fontSize: 28, fontWeight: "900", marginTop: 8 }, completeCopy: { color: colors.muted, fontSize: 14, marginTop: 8, textAlign: "center" }, resultRow: { width: "100%", marginVertical: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider, flexDirection: "row", justifyContent: "space-around", alignItems: "center" }, resultValue: { color: colors.onSurface, fontSize: 19, fontWeight: "900", textAlign: "center" }, resultLabel: { color: colors.muted, fontSize: 9, letterSpacing: 0.8, fontWeight: "800", textAlign: "center", marginTop: 5 }, resultRule: { width: 1, height: 28, backgroundColor: colors.divider }, nextButton: { width: "100%", height: 52, borderRadius: 17, backgroundColor: colors.brandPrimary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }, nextButtonText: { color: colors.onBrandPrimary, fontSize: 15, fontWeight: "900" }, secondaryButton: { minHeight: 44, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }, secondaryButtonText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
}));