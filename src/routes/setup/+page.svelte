<script lang="ts">
	import { goto } from "$app/navigation";
	import { getGroupContext } from "$lib/create_context.svelte";
	import { generateNetworkDPAH } from "$lib/utilities/generate_network_dpah";
	import { pagerank } from "$lib/utilities/page_rank";
	import { computeHomophily } from "$lib/utilities/compute_homophily";

	import char1 from "$lib/assets/characters/maj/P1.png";
	import char2 from "$lib/assets/characters/maj/P3.png";
	import char3 from "$lib/assets/characters/maj/P5.png";
	import char4 from "$lib/assets/characters/maj/P6.png";

	import char5 from "$lib/assets/characters/min/P2.png";
	import char6 from "$lib/assets/characters/min/P4.png";

	const maj_chars = [char1, char2, char3, char4];
	const min_chars = [char5, char6];

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

		const edges = generateNetworkDPAH(nodes, 12, {
			seed: 42,
			h_MM: 0.8,
			h_mm: 0.5,
			gamma_M: 3.0,
			gamma_m: 3.0,
		});

		// PageRank and write back to nodes
		const pr = pagerank(nodes.length, edges);

		for (let i = 0; i < nodes.length; i++) {
			nodes[i].score = pr[i];
		}

		const homophily = computeHomophily(nodes, edges);
		
		groupContext.nodes = nodes;
		groupContext.edges = edges;
		groupContext.mag_homophily = homophily.h_MM;
		groupContext.min_homophily = homophily.h_mm;

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
			{#each [2, 3, 4] as m}
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
