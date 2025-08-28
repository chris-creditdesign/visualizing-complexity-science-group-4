<script lang="ts">
	import { getGroupContext } from "$lib/create_context.svelte";

	interface Props {
		cy: number;
		cx: number;
		id: number;
		name: string;
		group: string;
		img: string;
	}
	let { cy, cx, id, name, group, img }: Props = $props();

	let key = "default";

	const groupContext = getGroupContext(key);

	let this_node_is_active = $derived(groupContext.activeNode === id);
</script>

<style>
	button {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-size: cover;
		border-width: 4px;
		
		
	}

	.active {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
		}

		70% {
			box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
		}

		100% {
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
		}
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
				background: ${group === "mag" ? "#FDE4FF" : "#FFEBE4"};
				border-color: ${group === "mag" ? "#DDA7DB" : "#FFC29D"};
			`}
	class={this_node_is_active ? "active" : ""}
	onclick={() => groupContext.handleNodeClick(id)}
>
	<img src={img} alt={name} />
</button>
