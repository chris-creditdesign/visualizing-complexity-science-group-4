// ---------------------------------------------
// PageRank
// ---------------------------------------------
export function pagerank(n, edges, { alpha = 0.85, tol = 1e-9, maxIter = 100 } = {}) {
	const outDeg = Array(n).fill(0);
	const adjOut = Array.from({ length: n }, () => []);
	for (const { source: u, target: v } of edges) {
		adjOut[u].push(v);
		outDeg[u]++;
	}

	let pr = Array(n).fill(1 / n);

	for (let it = 0; it < maxIter; it++) {
		const next = Array(n).fill((1 - alpha) / n);

		for (let u = 0; u < n; u++) {
			if (outDeg[u] === 0) {
				const share = (alpha * pr[u]) / n; // dangling — spread uniformly
				for (let v = 0; v < n; v++) next[v] += share;
			} else {
				const share = (alpha * pr[u]) / outDeg[u];
				for (const v of adjOut[u]) next[v] += share;
			}
		}

		let delta = 0;
		for (let i = 0; i < n; i++) delta += Math.abs(next[i] - pr[i]);
		pr = next;
		if (delta < tol) break;
	}

	return pr;
}
