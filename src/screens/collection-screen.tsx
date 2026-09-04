import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { renderCollectionCard } from "../components/collection-card";
import { MasonryGrid } from "../components/masonry";
import {
  createCard,
  createInitialCards,
  getCardHeight,
  getCardKey,
  INITIAL_CARD_COUNT,
} from "../data/cards";
import { theme } from "../theme";

export function CollectionScreen() {
  const [cards, setCards] = useState(createInitialCards);
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, theme.maxScreenWidth);
  const gridWidth = screenWidth - theme.spacing.screen * 2;
  const status =
    cards.length > INITIAL_CARD_COUNT
      ? `Добавлена карточка №${cards.length}`
      : "Соберите своё вдохновение";

  function addCard() {
    // Randomness belongs to the event, not the render or a replayable state updater.
    const aspectRatio = 0.6 + Math.random() * 0.65;
    setCards((current) => [...current, createCard(current.length + 1, aspectRatio)]);
  }

  return (
    <View style={styles.background}>
      <SafeAreaView style={[styles.screen, { width: screenWidth }]}>
        <View style={styles.header}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>МОЯ ПОДБОРКА</Text>
            <View style={styles.mark}>
              <View style={styles.markTall} />
              <View style={styles.markShort} />
              <View style={styles.markTall} />
            </View>
          </View>
          <Text accessibilityRole="header" style={styles.heading}>
            Коллекция идей
          </Text>
          <Text style={styles.description}>Цвет, форма и немного вдохновения.</Text>
          <View style={styles.collectionInfo}>
            <Text style={styles.sectionTitle}>Все карточки</Text>
            <View style={styles.countBadge}>
              <Text testID="card-count" style={styles.count}>
                {cards.length}
              </Text>
            </View>
          </View>
        </View>
        <ScrollView
          testID="collection-scroll"
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MasonryGrid
            data={cards}
            width={gridWidth}
            columnCount={3}
            gap={theme.spacing.grid}
            getItemHeight={getCardHeight}
            keyExtractor={getCardKey}
            renderItem={renderCollectionCard}
          />
          <Text style={styles.endNote}>Для новой идеи всегда есть место.</Text>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Добавить карточку"
            accessibilityHint="Добавляет карточку в коллекцию"
            onPress={addCard}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <Text style={styles.plus} accessible={false}>
              +
            </Text>
            <Text style={styles.buttonLabel}>Добавить карточку</Text>
          </Pressable>
          <Text accessibilityLiveRegion="polite" role="status" style={styles.status}>
            {status}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, alignItems: "center", backgroundColor: theme.colors.background },
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing.screen, paddingTop: 22, paddingBottom: 14 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: "700", color: theme.colors.accent },
  mark: { flexDirection: "row", gap: 3, alignItems: "center" },
  markTall: { width: 5, height: 19, borderRadius: 2, backgroundColor: theme.colors.accent },
  markShort: { width: 5, height: 12, borderRadius: 2, backgroundColor: theme.colors.accent },
  heading: {
    marginTop: 17,
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: -1.2,
    fontWeight: "700",
    color: theme.colors.text,
  },
  description: { marginTop: 8, fontSize: 13, lineHeight: 20, color: theme.colors.muted },
  collectionInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 26 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: theme.colors.text },
  countBadge: {
    borderRadius: 8,
    backgroundColor: theme.colors.badge,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  count: { fontSize: 11, fontWeight: "600", color: theme.colors.accent },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: theme.spacing.screen, paddingBottom: 14 },
  endNote: {
    marginTop: 25,
    marginBottom: 8,
    textAlign: "center",
    fontSize: 11,
    color: theme.colors.muted,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: 14,
    paddingBottom: 9,
  },
  addButton: {
    minHeight: 52,
    padding: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  addButtonPressed: { backgroundColor: theme.colors.accentPressed },
  plus: { color: "#FFFFFF", fontSize: 24, lineHeight: 26, fontWeight: "300" },
  buttonLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  status: {
    marginTop: 9,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
    color: theme.colors.muted,
  },
});
