import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { calculateMasonryLayout, type MasonryOptions } from "./masonry-layout";

export interface MasonryGridProps<T> extends MasonryOptions<T> {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

interface MasonryCellProps<T> {
  item: T;
  x: number;
  y: number;
  width: number;
  height: number;
  renderItem: (item: T) => ReactNode;
}

// Scalar geometry and stable item references let React Compiler reuse existing cells.
function MasonryCell<T>({ item, x, y, width, height, renderItem }: MasonryCellProps<T>) {
  return <View style={[styles.cell, { left: x, top: y, width, height }]}>{renderItem(item)}</View>;
}

export function MasonryGrid<T>({
  data,
  width,
  columnCount,
  gap,
  getItemHeight,
  keyExtractor,
  renderItem,
}: MasonryGridProps<T>) {
  const layout = calculateMasonryLayout(data, { width, columnCount, gap, getItemHeight });

  return (
    <View testID="masonry-grid" style={{ width, height: layout.height }}>
      {layout.placements.map((placement) => (
        <MasonryCell
          key={keyExtractor(placement.item)}
          item={placement.item}
          x={placement.x}
          y={placement.y}
          width={placement.width}
          height={placement.height}
          renderItem={renderItem}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ cell: { position: "absolute" } });
