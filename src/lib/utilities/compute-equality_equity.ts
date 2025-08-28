/**
 * Compute inequality (Gini) and inequity (ME) per the DPAH paper.
 * nodes: [{ id, group: 'mag'|'min', score: number, name }]
 *
 * Options:
 *  - beta: fairness tolerance band β (default 0.05)
 *  - kMax: highest top-k% to include (default 100)
 *  - kStep: step size in % (default 1) -> evaluates k = 1%, 2%, ..., kMax%
 *
 * Returns:
 *  {
 *    inequality_gini,          // Gini of score distribution (0..1)
 *    inequity_ME,              // Mean signed error over top-k% (negative=under-represented)
 *    beta,                     // threshold used
 *    fairness_label,           // 'under-represented' | 'over-represented' | 'replicated'
 *    baseline_minority_share,  // population fraction of minority
 *    series: [ { k, fracMinTopK, error } ] // per-top-k% details
 *  }
 */
export function computeEqualityEquity(
  nodes,
  { beta = 0.05, kMax = 100, kStep = 1 } = {}
) {
  if (!nodes?.length) {
    return {
      inequality_gini: 0,
      inequity_ME: 0,
      beta,
      fairness_label: 'replicated',
      baseline_minority_share: 0,
      series: []
    };
  }

  // ---------- Inequality (Gini over all scores) ----------
  const scores = nodes.map(d => +d.score || 0);
  const n = scores.length;
  // Standard Gini (population): G = (2*sum_i i*x_i)/(n*sum x) - (n+1)/n, for x sorted asc
  const asc = [...scores].sort((a, b) => a - b);
  const sum = asc.reduce((a, b) => a + b, 0) || 1;
  let cum = 0;
  for (let i = 0; i < n; i++) {
    cum += (i + 1) * asc[i];
  }
  const inequality_gini = Math.max(
    0,
    Math.min(1, (2 * cum) / (n * sum) - (n + 1) / n)
  );

  // ---------- Inequity (ME across top-k% ranks) ----------
  const minorityPop = nodes.filter(d => d.group === 'min').length;
  const baseline = minorityPop / n; // demographic parity baseline
  // Sort by score desc (top ranked first)
  const desc = [...nodes].sort((a, b) => (b.score || 0) - (a.score || 0));

  const series = [];
  for (let k = 1; k <= kMax; k += kStep) {
    const take = Math.max(1, Math.round((k / 100) * n));
    const top = desc.slice(0, take);
    const fracMinTopK = top.filter(d => d.group === 'min').length / take;
    const error = fracMinTopK - baseline; // signed error (paper's definition)
    series.push({ k, fracMinTopK, error });
  }
  const inequity_ME =
    series.reduce((a, d) => a + d.error, 0) / series.length;

  // ---------- Label per paper's β band ----------
  let fairness_label = 'replicated';
  if (inequity_ME > beta) fairness_label = 'over-represented';
  else if (inequity_ME < -beta) fairness_label = 'under-represented';

  return {
    inequality_gini,
    inequity_ME,
    beta,
    fairness_label,
    baseline_minority_share: baseline,
    series
  };
}