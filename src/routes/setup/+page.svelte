<script lang="ts">
	import { goto } from "$app/navigation";
	import { getGroupContext } from "$lib/create_context.svelte";

	const groupContext = getGroupContext("default");

	import { setupStore, type GameMode } from "$lib/setup_store.svelte";

	let mode: GameMode = $state(setupStore.mode);
	let numPlayers: number = $state(setupStore.numPlayers);
	let numMinority: number = $state(setupStore.numMinority);
	let names: string[] = $state(setupStore.names);

	function setPlayers(n: number) {
		setupStore.setPlayersCount(n);
		numPlayers = setupStore.numPlayers;
		names = setupStore.names;
		numMinority = setupStore.numMinority;
	}

	function allowedMinorityOptions(): number[] {
		return setupStore.allowedMinorityOptions();
	}

	function generateBoard() {
		setupStore.mode = mode;
		setupStore.numPlayers = numPlayers;
		setupStore.numMinority = numMinority;
		setupStore.names = names;

		// ---------------------------------------------
		// PageRank
		// ---------------------------------------------
		function pagerank(
			n,
			edges,
			{ alpha = 0.85, tol = 1e-9, maxIter = 100 } = {}
		) {
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

		// ---- seeded RNG (deterministic) ----
		function mulberry32(seed) {
			let t = seed >>> 0;
			return function () {
				t += 0x6d2b79f5;
				let r = Math.imul(t ^ (t >>> 15), 1 | t);
				r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
				return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
			};
		}

		// Continuous truncated power-law on [1, xmax], PDF ~ x^(-gamma)
		function samplePowerLaw(gamma, rng, xmax = 100) {
			const u = rng();
			if (Math.abs(gamma - 1.0) < 1e-12) return Math.pow(xmax, u);
			const oneMinusGamma = 1 - gamma;
			const base = u * (Math.pow(xmax, oneMinusGamma) - 1) + 1;
			return Math.pow(base, 1 / oneMinusGamma);
		}

		function rouletteIndex(weights, rng) {
			const s = weights.reduce((a, b) => a + b, 0);
			if (s <= 0) return Math.floor(rng() * weights.length);
			let x = rng() * s;
			for (let i = 0; i < weights.length; i++) {
				x -= weights[i];
				if (x <= 0) return i;
			}
			return weights.length - 1;
		}

		// ---------------------------------------------
		// DPAH edge generator + PageRank scoring
		// ---------------------------------------------
		/**
		 * Mutates nodes[i].score with PageRank. Returns {edges, ranking}.
		 * nodes: { id:number; group:'mag'|'min'; score:number; name:string }[]
		 */
		function generateNetworkDPAH(
			nodes,
			numEdges,
			{
				seed = 123,
				h_MM = 0.8,
				h_mm = 0.5,
				gamma_M = 3.0,
				gamma_m = 3.0,
				alpha = 0.85, // PageRank damping
				tol = 1e-9,
				maxIter = 100,
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
					id: `${u}-${v}-${t}`,
					source: nodes[u].id,
					target: nodes[v].id,
				});
				inDeg[v] += 1;
			}

			// PageRank and write back to nodes
			const pr = pagerank(n, edges, { alpha, tol, maxIter });
			for (let i = 0; i < n; i++) nodes[i].score = pr[i];

			// convenient ranking
			const ranking = nodes
				.map((d, i) => ({
					player_id: d.id,
					name: d.name,
					group: d.group,
					score: pr[i],
				}))
				.sort((a, b) => b.score - a.score)
				.map((r, idx) => ({ ...r, rank: idx + 1 }));

			return { edges, ranking };
		}

		let generateNodes = (
			numPlayers: number,
			numMinority: number,
			names: string[]
		) => {
			const nodes: { id: number; group: string; score: 0; name: string }[] = [];
			for (let i = 0; i < numPlayers; i++) {
				nodes.push({
					id: i,
					group: i < numMinority ? "min" : "mag",
					score: 0,
					name: names[i] || `Player ${i + 1}`,
				});
			}
			return nodes;
		};

		const nodes = generateNodes(
			setupStore.numPlayers,
			setupStore.numMinority,
			setupStore.names
		);

		const { edges, ranking } = generateNetworkDPAH(nodes, 12, {
			seed: 42,
			h_MM: 0.8,
			h_mm: 0.5,
			gamma_M: 3.0,
			gamma_m: 3.0,
			alpha: 0.85,
		});

		console.log("Generated ranking:", ranking);

		groupContext.nodes = nodes;
		groupContext.edges = edges;

		goto("/game");
	}
</script>

<style>
	.container {
		max-width: 1100px;
		margin: 32px auto 56px;
		padding: 0 20px 20px;
	}
	.header {
		background: #ffd048;
		border-radius: 24px;
		padding: 20px 28px;
		display: grid;
		grid-template-columns: 96px 1fr;
		gap: 20px;
		align-items: center;
	}
	.logo {
		width: 96px;
		height: 96px;
		border-radius: 48px;
		background: #f2f2f2;
	}
	h1 {
		margin: 0;
		font-size: 40px;
	}
	.sub {
		margin-top: 8px;
		line-height: 1.35;
	}

	.section {
		margin-top: 28px;
	}
	.row {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	.chip {
		padding: 10px 14px;
		border-radius: 14px;
		background: #eee;
		cursor: pointer;
		border: 2px solid transparent;
		font-weight: 700;
	}
	.chip.active {
		background: #ffa6f4;
		border-color: #000;
	}
	.chip.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px 28px;
		margin-top: 12px;
		max-width: 900px;
	}
	.input {
		width: 100%;
		padding: 12px 14px;
		border-radius: 10px;
		border: 2px solid #cfcfcf;
		background: #efefef;
		font-size: 16px;
	}
	.cta {
		width: 100%;
		margin-top: 28px;
		background: #ffd048;
		border: none;
		padding: 18px 20px;
		border-radius: 18px;
		font-size: 24px;
		font-weight: 900;
		box-shadow: 0 6px 0 #2b1b31;
		cursor: pointer;
	}
</style>

<div class="container">
	<div class="header">
		<div class="logo" aria-hidden="true"></div>
		<div>
			<h1>Game Setup</h1>
			<div class="sub">
				Espín-Noboa, L., Wagner, C., Strohmaier, M. et al. Inequality and
				inequity in network-based ranking and recommendation algorithms. Sci Rep
				12, 2012 (2022). https://doi.org/10.1038/s41598-022-05434-1
			</div>
		</div>
	</div>

	<div class="section">
		<h2>Mode</h2>
		<div class="row" style="margin-top:8px">
			<button
				class={`chip ${mode === "competitive" ? "active" : ""}`}
				onclick={() => (mode = "competitive")}>Competitive Mode</button
			>
			<button
				class={`chip ${mode === "team" ? "active" : ""}`}
				onclick={() => (mode = "team")}>Team-Based Mode</button
			>
		</div>
	</div>

	<div class="section">
		<h2>Select number of players</h2>
		<div class="row" style="margin-top:8px">
			{#each [6, 7, 8, 9, 10] as n}
				<button
					class={`chip ${numPlayers === n ? "active" : ""}`}
					onclick={() => setPlayers(n)}>{n}</button
				>
			{/each}
		</div>
	</div>

	<div class="section">
		<h2>Select number of minority players</h2>
		<div class="row" style="margin-top:8px">
			{#each [1, 2, 3, 4] as m}
				{#if allowedMinorityOptions().includes(m)}
					<button
						class={`chip ${numMinority === m ? "active" : ""}`}
						onclick={() => (numMinority = m)}>{m}</button
					>
				{:else}
					<button class="chip disabled" disabled>{m}</button>
				{/if}
			{/each}
		</div>
	</div>

	<div class="section">
		<h2>Name your mushroom</h2>
		<div class="grid">
			{#each Array.from({ length: numPlayers }) as _, i}
				<input class="input" placeholder={`${i + 1}`} bind:value={names[i]} />
			{/each}
		</div>
	</div>

	<button class="cta" onclick={generateBoard}>Generate board</button>
</div>
