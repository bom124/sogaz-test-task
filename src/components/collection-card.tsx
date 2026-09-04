import { StyleSheet, Text, View } from "react-native";

import { CARD_CAPTION_HEIGHT, type CollectionCardData } from "../data/cards";
import { theme } from "../theme";

interface CollectionCardProps {
  card: CollectionCardData;
}

export function CollectionCard({ card }: CollectionCardProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Карточка ${card.number}. ${card.title}. ${card.category}`}
      testID={card.id}
      style={styles.card}
    >
      <View style={[styles.cover, { backgroundColor: card.background }]}>
        <View style={[styles.motif, styles[card.motif], { backgroundColor: card.foreground }]} />
        <View style={styles.numberBadge}>
          <Text maxFontSizeMultiplier={1.4} style={styles.number}>
            {String(card.number).padStart(2, "0")}
          </Text>
        </View>
      </View>
      <View style={styles.caption}>
        <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={styles.title}>
          {card.title}
        </Text>
        <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={styles.category}>
          {card.category}
        </Text>
      </View>
    </View>
  );
}

export function renderCollectionCard(card: CollectionCardData) {
  return <CollectionCard card={card} />;
}

const styles = StyleSheet.create({
  card: { flex: 1, overflow: "hidden", borderRadius: 12, backgroundColor: theme.colors.surface },
  cover: { flex: 1, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  motif: { width: "66%", opacity: 0.9 },
  arch: { height: "63%", borderTopLeftRadius: 60, borderTopRightRadius: 60 },
  circle: { width: "75%", aspectRatio: 1, borderRadius: 100 },
  steps: {
    height: "63%",
    borderTopLeftRadius: 38,
    borderBottomRightRadius: 38,
    transform: [{ rotate: "-20deg" }],
  },
  numberBadge: {
    position: "absolute",
    top: 9,
    left: 9,
    minWidth: 24,
    minHeight: 24,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#FFFFFFD9",
  },
  number: { fontSize: 10, fontWeight: "600", color: theme.colors.text },
  caption: { height: CARD_CAPTION_HEIGHT, justifyContent: "center", paddingHorizontal: 10, gap: 4 },
  title: { fontSize: 12, lineHeight: 16, fontWeight: "600", color: theme.colors.text },
  category: { fontSize: 9, lineHeight: 12, color: theme.colors.muted },
});
