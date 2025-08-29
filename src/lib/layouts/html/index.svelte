<script lang="ts">
	import type { Snippet } from "svelte";
	interface Props {
		pointerEvents?: boolean;
		children: Snippet;
		paddingLeft: number;
		paddingTop: number;
		paddingRight: number;
		paddingBottom: number;
	}
	let { 
		pointerEvents = false,
		children,
		paddingLeft,
		paddingTop,
		paddingRight,
		paddingBottom,
	}: Props = $props();
</script>

<style>
	div {
		position: absolute;
	}
</style>

<div
	style:left={paddingLeft + "px"}
	style:top={paddingTop + "px"}
	style:right={paddingRight+ "px"}
	style:bottom={paddingBottom + "px"}
	style:pointer-events={pointerEvents ? "auto" : "none"}
	aria-hidden={pointerEvents ? "false" : "true"}
>
	{@render children?.()}
</div>
