export interface CollectionCardData {
  id: string;
  number: number;
  title: string;
  category: string;
  aspectRatio: number;
  background: string;
  foreground: string;
  motif: "arch" | "circle" | "steps";
}

interface CardPreset {
  title: string;
  category: string;
  background: string;
  foreground: string;
  motif: CollectionCardData["motif"];
}

const presets: readonly CardPreset[] = [
  {
    title: "Тишина",
    category: "Пространство",
    background: "#DCE1D1",
    foreground: "#9BA88C",
    motif: "arch",
  },
  {
    title: "Тёплый свет",
    category: "Настроение",
    background: "#F3D9AD",
    foreground: "#DCAB68",
    motif: "circle",
  },
  {
    title: "Ритм",
    category: "Геометрия",
    background: "#D9DDE8",
    foreground: "#969FBA",
    motif: "steps",
  },
  {
    title: "Терракота",
    category: "Фактура",
    background: "#ECD2C3",
    foreground: "#C68E73",
    motif: "arch",
  },
  {
    title: "Глубина",
    category: "Палитра",
    background: "#D2E0DF",
    foreground: "#83AAA8",
    motif: "circle",
  },
  {
    title: "Песок",
    category: "Природа",
    background: "#EBE3D3",
    foreground: "#B9AA8B",
    motif: "steps",
  },
  {
    title: "Равновесие",
    category: "Форма",
    background: "#E6DDE9",
    foreground: "#B19ABC",
    motif: "circle",
  },
  {
    title: "Линии",
    category: "Архитектура",
    background: "#DCE3D6",
    foreground: "#99AF8B",
    motif: "steps",
  },
  {
    title: "На рассвете",
    category: "Вдохновение",
    background: "#EEDBD4",
    foreground: "#CDA294",
    motif: "arch",
  },
];

const initialRatios = [0.72, 1.05, 0.88, 1.2, 0.64, 0.92, 0.78, 1.1, 0.68];
export const CARD_CAPTION_HEIGHT = 64;
export const INITIAL_CARD_COUNT = 15;

export function createCard(number: number, aspectRatio?: number): CollectionCardData {
  // Demo IDs are monotonic: this collection supports append only.
  const preset = presets[(number - 1) % presets.length]!;
  return {
    ...preset,
    id: `card-${number}`,
    number,
    aspectRatio: aspectRatio ?? initialRatios[(number - 1) % initialRatios.length]!,
  };
}

export function createInitialCards(): CollectionCardData[] {
  return Array.from({ length: INITIAL_CARD_COUNT }, (_, index) => createCard(index + 1));
}

export function getCardHeight(card: CollectionCardData, columnWidth: number): number {
  return columnWidth / card.aspectRatio + CARD_CAPTION_HEIGHT;
}

export function getCardKey(card: CollectionCardData): string {
  return card.id;
}
