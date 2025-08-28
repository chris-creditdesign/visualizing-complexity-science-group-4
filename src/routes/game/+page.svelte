<script lang="ts">
	import { flip } from "svelte/animate";
	import { getGroupContext } from "$lib/create_context.svelte";
	import { startpointOutside } from "$lib/utilities/start_point_outside";
	import { endpointOutside } from "$lib/utilities/end_point_outside";
	import Canvas from "$lib/layouts/canvas/index.svelte";
	import HTML from "$lib/layouts/html/index.svelte";
	import Arrow from "$lib/layouts/canvas/Arrow.svelte";
	import Node from "$lib/layouts/html/Node.svelte";
	import Chart from "$lib/layouts/Chart.svelte";

	let key = "default";

	const groupContext = getGroupContext(key);

	let sorted_nodes = $derived(
		[...groupContext.nodes].sort((a, b) => b.score - a.score)
	);
</script>

<style>
	.container {
		position: relative;
		aspect-ratio: 1 / 1;
		max-width: 800px;
	}

	img {
		max-width: 50px;
		height: auto;
	}
</style>

<div
	class="l-sidebar e-sidebar-on-right u-padding-block u-padding-inline u-column"
	style="
		--sidebar-width--component: 30%;
		--sidebar-content-min-width--component: 35%;
		--sidebar-space: var(--s4);
		--padding-block: var(--s2);
	"
>
	<div
		class="container"
		bind:offsetWidth={groupContext.containerWidth}
	>
		<Canvas
			{key}
			width={groupContext.containerWidth}
			height={groupContext.containerWidth}
			dpr={2}
			paddingLeft={groupContext.padding.left}
			paddingTop={groupContext.padding.top}
		>
			{#each groupContext.edges as edge}
				<Arrow
					{key}
					startX={startpointOutside(
						groupContext.nodes_with_positions[edge.source],
						groupContext.nodes_with_positions[edge.target],
						groupContext.radius,
						groupContext.arrowPadding
					).x}
					startY={startpointOutside(
						groupContext.nodes_with_positions[edge.source],
						groupContext.nodes_with_positions[edge.target],
						groupContext.radius,
						groupContext.arrowPadding
					).y}
					endX={endpointOutside(
						groupContext.nodes_with_positions[edge.source],
						groupContext.nodes_with_positions[edge.target],
						groupContext.radius,
						groupContext.arrowPadding
					).x}
					endY={endpointOutside(
						groupContext.nodes_with_positions[edge.source],
						groupContext.nodes_with_positions[edge.target],
						groupContext.radius,
						groupContext.arrowPadding
					).y}
					lineWidth={2}
					arrowHeadSize={16}
				/>
			{/each}
		</Canvas>

		<HTML
			paddingLeft={groupContext.padding.left}
			paddingTop={groupContext.padding.top}
			paddingBottom={groupContext.padding.bottom}
			paddingRight={groupContext.padding.right}
			pointerEvents={true}
		>
			{#each groupContext.nodes_with_positions as node (node.id)}
				<Node
					cy={node.cy}
					cx={node.cx}
					id={node.id}
					name={node.name}
					group={node.group}
					img={node.img}
				/>
			{/each}
		</HTML>
	</div>

	<div class="container l-stack">
		<Chart />

		{#each sorted_nodes as node (node.id)}
			<p animate:flip={{ duration: 400 }}>
				<img src={node.img} alt={node.name} />
				<strong>{node.name}</strong>: {node.score.toFixed(2)}
			</p>
		{/each}
	</div>
</div>
