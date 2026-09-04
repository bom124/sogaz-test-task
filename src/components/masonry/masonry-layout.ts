export interface MasonryOptions<T> {
  width: number;
  columnCount: number;
  gap: number;
  getItemHeight: (item: T, columnWidth: number) => number;
}

export interface MasonryPlacement<T> {
  item: T;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MasonryLayout<T> {
  placements: MasonryPlacement<T>[];
  columnHeights: number[];
  columnWidth: number;
  height: number;
}

/** Greedy shortest-column placement. Equal heights favor the leftmost column. */
export function calculateMasonryLayout<T>(
  data: readonly T[],
  { width, columnCount, gap, getItemHeight }: MasonryOptions<T>,
): MasonryLayout<T> {
  if (!Number.isInteger(columnCount) || columnCount < 1) {
    throw new RangeError("columnCount must be a positive integer");
  }
  if (!Number.isFinite(gap) || gap < 0) {
    throw new RangeError("gap must be a finite non-negative number");
  }
  if (!Number.isFinite(width) || width <= gap * (columnCount - 1)) {
    throw new RangeError("width must leave positive space for every column");
  }

  const columnWidth = (width - gap * (columnCount - 1)) / columnCount;
  const columnHeights = Array.from({ length: columnCount }, () => 0);
  const placements: MasonryPlacement<T>[] = [];
  let height = 0;

  for (const item of data) {
    let shortestColumn = 0;
    let shortestHeight = columnHeights[0]!;

    for (let column = 1; column < columnCount; column += 1) {
      const candidateHeight = columnHeights[column]!;
      if (candidateHeight < shortestHeight) {
        shortestColumn = column;
        shortestHeight = candidateHeight;
      }
    }

    const itemHeight = getItemHeight(item, columnWidth);
    if (!Number.isFinite(itemHeight) || itemHeight <= 0) {
      throw new RangeError("getItemHeight must return a finite positive number");
    }

    const y = shortestHeight === 0 ? 0 : shortestHeight + gap;
    const bottom = y + itemHeight;
    columnHeights[shortestColumn] = bottom;
    height = Math.max(height, bottom);
    placements.push({
      item,
      column: shortestColumn,
      x: shortestColumn * (columnWidth + gap),
      y,
      width: columnWidth,
      height: itemHeight,
    });
  }

  return { placements, columnHeights, columnWidth, height };
}
