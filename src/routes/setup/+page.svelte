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

		/**
		 * Generate edges via DPAH.
		 * @param {Array<{id:number, group:string, score:number, name:string}>} nodes
		 * @param {number} numEdges how many directed edges to add
		 * @param {Object} opts
		 * @param {number} [opts.seed=123]
		 * @param {number} [opts.h_MM=0.8] homophily majority→majority
		 * @param {number} [opts.h_mm=0.5] homophily minority→minority
		 * @param {number} [opts.gamma_M=3.0] activity exponent for majority
		 * @param {number} [opts.gamma_m=3.0] activity exponent for minority
		 * @returns {{ edges: {id:string, source:number, target:number}[], inDegree: number[] }}
		 */
		function generateEdgesDPAH(
			nodes,
			numEdges,
			{ seed = 123, h_MM = 0.8, h_mm = 0.5, gamma_M = 3.0, gamma_m = 3.0 } = {}
		) {
			const n = nodes.length;
			const rng = mulberry32(seed);

			// Map your labels -> homophily keys
			// "mag" = majority (M), "min" = minority (m)
			const groupKey = (g) => (g === "mag" ? "M" : "m");
			const groups = nodes.map((d) => groupKey(d.group));

			const H = {
				"M|M": h_MM,
				"m|m": h_mm,
				"M|m": 1 - h_MM,
				"m|M": 1 - h_mm,
			};

			// --- activity-driven source selection (power-law per group) ---
			const activities = groups.map((g) =>
				samplePowerLaw(g === "M" ? gamma_M : gamma_m, rng)
			);
			const actSum = activities.reduce((a, b) => a + b, 0);
			const srcProbs = activities.map((a) => a / (actSum || 1));

			// --- iterative edge growth ---
			const inDeg = Array(n).fill(0);
			const edges = [];

			for (let t = 0; t < numEdges; t++) {
				// pick source by activity
				const u = rouletteIndex(srcProbs, rng);

				// target weights: w(v) ∝ h(u,v) * k_in(v), v != u
				const weights = Array(n).fill(0);
				for (let v = 0; v < n; v++) {
					if (v === u) continue;
					const hij = H[`${groups[u]}|${groups[v]}`];
					weights[v] = hij * inDeg[v];
				}

				let s = weights.reduce((a, b) => a + b, 0);

				// cold start: if all k_in==0, fall back to homophily-only
				if (s === 0) {
					for (let v = 0; v < n; v++) {
						weights[v] = v === u ? 0 : H[`${groups[u]}|${groups[v]}`];
					}
				}

				const v = rouletteIndex(weights, rng);

				const id = `${u}-${v}-${t}`;
				edges.push({ id, source: nodes[u].id, target: nodes[v].id });
				inDeg[v] += 1;
			}

			return { edges, inDegree: inDeg };
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

		const { edges, inDegree } = generateEdgesDPAH(nodes, 12, {
			seed: 42,
			h_MM: 0.5,
			h_mm: 0.5,
			gamma_M: 3.0,
			gamma_m: 3.0,
		});

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
