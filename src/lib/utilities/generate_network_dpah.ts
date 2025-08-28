import { mulberry32 } from "./mulberry_32";
import { samplePowerLaw } from "./sample_power_law";
import { rouletteIndex } from "./roulette_index";


// ---------------------------------------------
// DPAH edge generator + PageRank scoring
// ---------------------------------------------
/**
 * Mutates nodes[i].score with PageRank. Returns {edges, ranking}.
 * nodes: { id:number; group:'mag'|'min'; score:number; name:string }[]
 */
export function generateNetworkDPAH(
	nodes,
	numEdges,
	{
		seed = 123,
		h_MM = 0.8,
		h_mm = 0.5,
		gamma_M = 3.0,
		gamma_m = 3.0,
	} = {}
) {
	const n = nodes.length;
	const rng = mulberry32(seed);

	// map labels -> 'M'/'m'
	const groupKey = (g) => (g === "mag" ? "M" : "m");
	const groups = nodes.map((d) => groupKey(d.group));

	const H = {
		"M|M": h_MM,
		"m|m": h_mm,
		"M|m": 1 - h_MM,
		"m|M": 1 - h_mm,
	};

	// activity-driven source probs (power-law per group)
	const activities = groups.map((g) =>
		samplePowerLaw(g === "M" ? gamma_M : gamma_m, rng)
	);
	const actSum = activities.reduce((a, b) => a + b, 0) || 1;
	const srcProbs = activities.map((a) => a / actSum);

	// grow edges
	const inDeg = Array(n).fill(0);
	const edges = [];

	for (let t = 0; t < numEdges; t++) {
		const u = rouletteIndex(srcProbs, rng);

		// target weights: ∝ homophily(u,v) * k_in(v)
		const w = Array(n).fill(0);
		for (let v = 0; v < n; v++) {
			if (v === u) continue;
			const hij = H[`${groups[u]}|${groups[v]}`];
			w[v] = hij * inDeg[v];
		}
		let s = w.reduce((a, b) => a + b, 0);

		// cold start: homophily-only
		if (s === 0) {
			for (let v = 0; v < n; v++)
				w[v] = v === u ? 0 : H[`${groups[u]}|${groups[v]}`];
		}

		const v = rouletteIndex(w, rng);

		edges.push({
			id: `${nodes[u].id}-${nodes[v].id}`,
			source: nodes[u].id,
			target: nodes[v].id,
		});
		inDeg[v] += 1;
	}



	return edges;
}
