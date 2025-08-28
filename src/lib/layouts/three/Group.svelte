<script lang="ts">
	import type { Snippet } from "svelte";
	import * as THREE from "three";
	import { setup } from "./create-three-context.svelte";

	interface Props {
		children: Snippet;
		position?: [number, number, number];
		rotation?: [number, number, number];
	}

	let { children, position = [0, 0, 0], rotation = [0, 0, 0] }: Props = $props();

	const group = setup(new THREE.Group());

	$effect(() => {
		group.position.set(...position);
		group.rotation.set(...rotation);
	});
</script>

{@render children?.()}
