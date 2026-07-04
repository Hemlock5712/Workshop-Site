// Line-level LCS diff between two code states. The CodePanel uses it to decide
// which lines persist (flow naturally), type in (added), or collapse (removed).

export interface DiffRow {
  text: string;
  /** Index in the NEW state, or -1 for removed rows. */
  newIndex: number;
  kind: "kept" | "added" | "removed";
}

export function diffLines(before: string, after: string): DiffRow[] {
  const a = before.length === 0 ? [] : before.replace(/\s+$/, "").split("\n");
  const b = after.length === 0 ? [] : after.replace(/\s+$/, "").split("\n");

  // LCS table — states are tiny (tens of lines), so O(n·m) is fine.
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push({ text: b[j], newIndex: j, kind: "kept" });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      rows.push({ text: a[i], newIndex: -1, kind: "removed" });
      i++;
    } else {
      rows.push({ text: b[j], newIndex: j, kind: "added" });
      j++;
    }
  }
  while (i < a.length)
    rows.push({ text: a[i++], newIndex: -1, kind: "removed" });
  while (j < b.length) {
    rows.push({ text: b[j], newIndex: j, kind: "added" });
    j++;
  }
  return rows;
}
