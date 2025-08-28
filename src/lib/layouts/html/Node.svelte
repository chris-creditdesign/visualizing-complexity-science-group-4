<script lang="ts">
	import { getGroupContext } from "$lib/create_context.svelte";

	interface Props {
		cy: number;
		cx: number;
		id: number;
		name: string;
		group: string;
	}
	let { cy, cx, id, name, group }: Props = $props();

	let key = "default";

	const groupContext = getGroupContext(key);

	let this_node_is_active = $derived(groupContext.activeNode === id);
</script>

<style>
	button {
		border: none;
		cursor: pointer;
		font-size: 14px;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}
</style>

<button
	style={`
				top: ${cy}px;
				left: ${cx}px;
				position: absolute;
				width: ${groupContext.radius * 2}px;
				height: ${groupContext.radius * 2}px;
				transform: translate(-${groupContext.radius}px, -${groupContext.radius}px);
				background: ${group === "mag" ? "blue" : "orange"};
				opacity: ${this_node_is_active ? 1 : 0.5};

			`}
	onclick={() => groupContext.handleNodeClick(id)}
>
	{name}
</button>
