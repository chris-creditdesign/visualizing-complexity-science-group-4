<script lang="ts">
    import { getGroupContext } from "$lib/create_context.svelte";
    import Canvas from "$lib/layouts/canvas/index.svelte";
    import HTML from "$lib/layouts/html/index.svelte";
    import Arrow from "$lib/layouts/canvas/Arrow.svelte";
	import Node from "$lib/layouts/html/Node.svelte";

    let key = "default";

    const groupContext = getGroupContext(key);
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
				
				startX={groupContext.startpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					groupContext.arrowPadding
				).x}
				startY={groupContext.startpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					groupContext.arrowPadding
				).y}
				endX={groupContext.endpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					groupContext.arrowPadding
				).x}
				endY={groupContext.endpointOutside(
					groupContext.nodes_with_positions[edge.source],
					groupContext.nodes_with_positions[edge.target],
					groupContext.radius,
					groupContext.arrowPadding
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
			<Node cy={node.cy} cx={node.cx} id={node.id} name={node.name} group={node.group} />
		{/each}
	</HTML>
</div>

<p>Active node: {groupContext.activeNode}</p>

{#each groupContext.nodes as node}
	<p>{node.name}: {node.score}</p>
{/each}


