<script lang="ts">
    import { getGroupContext } from "$lib/create_context.svelte";
	import { startpointOutside } from "$lib/utilities/start_point_outside";
	import { endpointOutside } from "$lib/utilities/end_point_outside";
    import Canvas from "$lib/layouts/canvas/index.svelte";
    import HTML from "$lib/layouts/html/index.svelte";
    import Arrow from "$lib/layouts/canvas/Arrow.svelte";
	import Node from "$lib/layouts/html/Node.svelte";
    let key = "default";

    const groupContext = getGroupContext(key);
</script>

<style>
    .page {
        padding: 16px;
        max-width: 1200px;
        margin: 0 auto;
    }
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }
    .header h1 {
        margin: 0;
    }
    .header .actions {
        display: flex;
        gap: 8px;
    }
    .btn {
        appearance: none;
        border: 2px solid #000;
        background: #ffd048;
        padding: 10px 14px;
        border-radius: 12px;
        font-weight: 800;
        cursor: pointer;
    }
    .layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 16px;
        align-items: start;
    }
    .play-area {
        background: #C7E9B2;
        border-radius: 16px;
        padding: 12px;
    }
    .container {
        position: relative;
        width: 800px;
        height: 600px;
        border: 1px solid #ccc;
        margin: 20px auto;
        font-family: Arial, Helvetica, sans-serif;
    }
    .sidebar { display: grid; gap: 16px; }
    .panel { background: #f6f6f6; border: 1px solid #ddd; border-radius: 12px; min-height: 200px; }
</style>

<div class="page">
    <div class="header">
        <h1>Shroom Boom</h1>
        <div class="actions">
            <button class="btn">Instructions</button>
            <button class="btn">About</button>
        </div>
    </div>

    <div class="layout">
        <div class="play-area">
            <div class="container">
	<Canvas {key} width={800} height={600} dpr={2} paddingLeft={0} paddingTop={0}>
		{#each groupContext.edges as edge}
			<Arrow
				{key}
				curvature={0.15}
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
		paddingLeft={0}
		paddingTop={0}
		paddingBottom={0}
		paddingRight={0}
		pointerEvents={true}
	>
		{#each groupContext.nodes_with_positions as node, index (node.id)}
			<Node cy={node.cy} cx={node.cx} id={node.id} name={node.name} group={node.group} index={index} />
		{/each}
	</HTML>
            </div>
        </div>

        <div class="sidebar">
            <div class="panel"></div>
            <div class="panel"></div>
        </div>
    </div>
</div>

<p>Majority homophily: {groupContext.mag_homophily}</p>
<p>Minority homophily: {groupContext.min_homophily}</p>

{#each groupContext.nodes as node}
	<p>{node.name}: {node.score}</p>
{/each}


