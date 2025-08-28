<script lang="ts">
    import { setGroupContext } from "$lib/create_context.svelte";
    import Canvas from "$lib/layouts/canvas/index.svelte";
    import HTML from "$lib/layouts/html/index.svelte";
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

    let active: null | number = $state(null);

    let handleButtonClick = (nodeId: number) => {
        if (!active) {
            active = nodeId;
            return;
        } else {
            let source = active;
            let target = nodeId;
            let id = `${source}-${target}`;

            let id_array = groupContext.edges.map((e) => e.id);

            if (id_array.includes(id)) {
                groupContext.edges = groupContext.edges.filter((e) => e.id !== id);
            } else {
                groupContext.edges = [...groupContext.edges, { id, source, target }];
            }

            active = null;
        }
    };
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
    button {
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: white;
    }
</style>

<div class="container">
    <Canvas {key} width={800} height={600} dpr={2} paddingLeft={0} paddingTop={0}>
        {#each groupContext.edges as edge}
            <Arrow
                {key}
                startX={groupContext.nodes_with_positions[edge.source].cx}
                startY={groupContext.nodes_with_positions[edge.source].cy}
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
            <button
                style={`
                top: ${node.cy}px;
                left: ${node.cx}px;
                position: absolute;
                width: ${groupContext.radius * 2}px;
                height: ${groupContext.radius * 2}px;
                transform: translate(-${groupContext.radius}px, -${groupContext.radius}px);
                border-radius: 50%;
                background: ${node.group === "mag" ? "blue" : "orange"};
                opacity: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            `}
                onclick={() => handleButtonClick(node.id)}
            >
                {node.id}
            </button>
        {/each}
    </HTML>
</div>

<p>Active: {active}</p>


