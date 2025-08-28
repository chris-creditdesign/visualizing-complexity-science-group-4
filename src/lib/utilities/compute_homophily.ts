/**
 * Compute homophily for majority ("mag") and minority ("min") from a directed graph.
 *
 * nodes: [{ id:number, group:'mag'|'min', score:number, name:string }, ...]
 * edges: [{ id:string, source:number, target:number }, ...]
 *
 * Returns:
 * {
 *   h_MM, h_mm,                    // raw within-group fractions
 *   baseline_MM, baseline_mm,      // size-based exposure baselines
 *   h_MM_adj, h_mm_adj,            // Coleman-style adjusted homophily
 *   counts: { M:{same, total}, m:{same, total} }
 * }
 */
export function computeHomophily(nodes, edges, { excludeSelfLoops = true } = {}) {
  // Map node id -> group key
  const idToGroup = new Map(nodes.map(n => [n.id, n.group === 'mag' ? 'M' : 'm']));

  // Group sizes
  const n = nodes.length;
  const nM = nodes.filter(n => n.group === 'mag').length;
  const n_m = n - nM;

  // Baseline exposure: probability a random target is same-group (excl. self)
  const denom = Math.max(n - 1, 1);
  const baseline_MM = nM > 0 ? (nM - 1) / denom : 0;   // for a majority source
  const baseline_mm = n_m > 0 ? (n_m - 1) / denom : 0; // for a minority source

  // Tally same-group / total out-edges by source group
  const counts = { M: { same: 0, total: 0 }, m: { same: 0, total: 0 } };

  for (const e of edges) {
    const gS = idToGroup.get(e.source);
    const gT = idToGroup.get(e.target);
    if (!gS || !gT) continue;
    if (excludeSelfLoops && e.source === e.target) continue;

    counts[gS].total += 1;
    if (gS === gT) counts[gS].same += 1;
  }

  // Raw homophily (fallback to 0 if no outgoing edges)
  const h_MM = counts.M.total > 0 ? counts.M.same / counts.M.total : 0;
  const h_mm = counts.m.total > 0 ? counts.m.same / counts.m.total : 0;

  // Coleman-style adjusted homophily: (observed - baseline) / (1 - baseline)
  const safeAdj = (obs, base) => (base < 1 ? (obs - base) / (1 - base) : 0);
  const h_MM_adj = safeAdj(h_MM, baseline_MM);
  const h_mm_adj = safeAdj(h_mm, baseline_mm);

  return {
    h_MM,
    h_mm,
    baseline_MM,
    baseline_mm,
    h_MM_adj,
    h_mm_adj,
    counts: { M: counts.M, m: counts.m },
  };
}