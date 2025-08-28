<script lang="ts">
	import { setGroupContext } from "$lib/create_context.svelte";
	import Canvas from "$lib/layouts/canvas/index.svelte";
	import HTML from "$lib/layouts/html/index.svelte";
	import Node from "$lib/layouts/html/Node.svelte";
	import Arrow from "$lib/layouts/canvas/Arrow.svelte";

	let key = "default";

	const groupContext = setGroupContext(key);

	// distance to push the arrow past the target center (radius + padding)
	const arrowPadding = 4;

	function endpointOutside(
		source: { cx: number; cy: number },
		target: { cx: number; cy: number },
		radius: number,
		padding = 0
	) {
		const dx = target.cx - source.cx;
		const dy = target.cy - source.cy;
		const dist = Math.hypot(dx, dy) || 1;
		const ux = dx / dist;
		const uy = dy / dist;
		// point on the target circle perimeter plus padding outside it
		return {
			x: target.cx - ux * (radius + padding),
			y: target.cy - uy * (radius + padding),
		};
	}

	// new: compute the start point on the source perimeter towards the target
	function startpointOutside(
		source: { cx: number; cy: number },
		target: { cx: number; cy: number },
		radius: number,
		padding = 0
	) {
		const dx = target.cx - source.cx;
		const dy = target.cy - source.cy;
		const dist = Math.hypot(dx, dy) || 1;
		const ux = dx / dist;
		const uy = dy / dist;
		// point on the source circle perimeter moved outward towards the target
		return {
			x: source.cx + ux * (radius + padding),
			y: source.cy + uy * (radius + padding),
		};
	}
</script>

<style>
	.container {
		position: relative;
		width: 800px;
		height: 600px;
		border: 1px solid #ccc;
		margin: 20px auto;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>

<div class="container">
	<Canvas {key} width={800} height={600} dpr={2} paddingLeft={0} paddingTop={0}>
		{#each groupContext.edges as edge}
			<Arrow
				{key}
				
				startX={startpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					arrowPadding
				).x}
				startY={startpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					arrowPadding
				).y}
				endX={endpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					arrowPadding
				).x}
				endY={endpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					arrowPadding
				).y}
			/>
		{/each}
	</Canvas>

	<HTML
		paddingLeft={0}
		paddingTop={0}
		paddingBottom={0}
		paddingRight={0}
		pointerEvents={true}
	>
		{#each groupContext.nodes_with_positions as node (node.id)}
			<Node cy={node.cy} cx={node.cx} id={node.id} group={node.group} />
		{/each}
	</HTML>
</div>

<p>Active node: {groupContext.activeNode}</p>

{#each groupContext.nodes_with_positions as node}
	<p>Node {node.id}: {node.score}</p>
{/each}
