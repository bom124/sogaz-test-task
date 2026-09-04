import { describe, expect, it, vi } from "vitest";

import { calculateMasonryLayout, type MasonryOptions } from "./masonry-layout";

const options: MasonryOptions<number> = {
  width: 350,
  columnCount: 3,
  gap: 10,
  getItemHeight: (height) => height,
};

describe("calculateMasonryLayout", () => {
  it("fits three 110px columns into a 390px screen with 20px side padding", () => {
    const layout = calculateMasonryLayout([100, 200, 150], options);
    expect(layout.columnWidth).toBe(110);
    expect(layout.placements.map(({ x }) => x)).toEqual([0, 120, 240]);
    expect(layout.height).toBe(200);
  });

  it("uses the shortest column instead of round-robin placement", () => {
    const layout = calculateMasonryLayout([300, 100, 200, 50, 30], options);
    expect(layout.placements.map(({ column }) => column)).toEqual([0, 1, 2, 1, 1]);
    expect(layout.placements.map(({ y }) => y)).toEqual([0, 0, 0, 110, 170]);
    expect(layout.columnHeights).toEqual([300, 200, 200]);
  });

  it("breaks ties from left to right and includes no trailing gap", () => {
    const layout = calculateMasonryLayout([100, 100, 100, 100], options);
    expect(layout.placements.map(({ column }) => column)).toEqual([0, 1, 2, 0]);
    expect(layout.height).toBe(210);
  });

  it("keeps all previous positions and item identities unchanged when appending", () => {
    const data = Object.freeze([300, 100, 200, 50]);
    const before = calculateMasonryLayout(data, options);
    const after = calculateMasonryLayout([...data, 80], options);
    expect(after.placements.slice(0, data.length)).toEqual(before.placements);
    expect(after.placements.at(-1)).toMatchObject({ column: 1, y: 170 });
    expect(data).toEqual([300, 100, 200, 50]);
  });

  it("supports empty data and fewer items than columns", () => {
    expect(calculateMasonryLayout([], options)).toMatchObject({
      placements: [],
      columnHeights: [0, 0, 0],
      height: 0,
    });
    expect(calculateMasonryLayout([90], options).columnHeights).toEqual([90, 0, 0]);
  });

  it("supports one column and zero gap", () => {
    const layout = calculateMasonryLayout([80, 120, 60], { ...options, columnCount: 1, gap: 0 });
    expect(layout.columnWidth).toBe(350);
    expect(layout.placements.map(({ y }) => y)).toEqual([0, 80, 200]);
    expect(layout.height).toBe(260);
  });

  it("recalculates width-dependent heights when the viewport changes", () => {
    const item = Object.freeze({ ratio: 2 });
    const getItemHeight = vi.fn((value: typeof item, width: number) => width / value.ratio);
    const narrow = calculateMasonryLayout([item], { ...options, getItemHeight });
    const wide = calculateMasonryLayout([item], { ...options, width: 380, getItemHeight });
    expect(narrow.placements[0]?.height).toBe(55);
    expect(wide.placements[0]?.height).toBe(60);
    expect(wide.placements[0]?.item).toBe(item);
    expect(getItemHeight).toHaveBeenCalledTimes(2);
  });

  it("reflows after removal and height changes without stale geometry", () => {
    const original = calculateMasonryLayout([300, 100, 200, 50], options);
    const removed = calculateMasonryLayout([100, 200, 50], options);
    const resized = calculateMasonryLayout([50, 100, 200, 50], options);
    expect(original.placements[3]?.column).toBe(1);
    expect(removed.columnHeights).toEqual([100, 200, 50]);
    expect(resized.placements[3]).toMatchObject({ column: 0, y: 60 });
  });

  it("maintains shortest-column, gap and bounds invariants for 1000 different heights", () => {
    const data = Array.from({ length: 1000 }, (_, index) => 30 + ((index * 79) % 241));
    const layout = calculateMasonryLayout(data, { ...options, width: 347 });
    const bottoms = [0, 0, 0];
    for (const placement of layout.placements) {
      const minimum = Math.min(...bottoms);
      expect(placement.column).toBe(bottoms.indexOf(minimum));
      expect(placement.y).toBe(minimum === 0 ? 0 : minimum + options.gap);
      expect(placement.x).toBeGreaterThanOrEqual(0);
      expect(placement.x + placement.width).toBeLessThanOrEqual(347 + 1e-9);
      bottoms[placement.column] = placement.y + placement.height;
    }
    expect(layout.height).toBe(Math.max(...bottoms));
    expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(
      Math.max(...data) + options.gap,
    );
  });

  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid column count %s", (columnCount) => {
    expect(() => calculateMasonryLayout([], { ...options, columnCount })).toThrow(RangeError);
  });
  it.each([-1, NaN, Infinity])("rejects invalid gap %s", (gap) => {
    expect(() => calculateMasonryLayout([], { ...options, gap })).toThrow(RangeError);
  });
  it.each([0, -1, 20, NaN, Infinity])("rejects invalid or insufficient width %s", (width) => {
    expect(() => calculateMasonryLayout([], { ...options, width })).toThrow(RangeError);
  });
  it.each([0, -1, NaN, Infinity])("rejects invalid item height %s", (height) => {
    expect(() => calculateMasonryLayout([height], options)).toThrow(RangeError);
  });
});
