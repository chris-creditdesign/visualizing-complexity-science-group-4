<script lang="ts">
	import type { Snippet } from "svelte";
	import * as THREE from "three";
	import { onMount } from "svelte";
	import { setThreeContext } from "./create-three-context.svelte";

	interface Props {
		width: number;
		height: number;
		dpr: number;
		children: Snippet;
	}

	let { width, height, dpr, children }: Props = $props();

	let container: HTMLDivElement;

	let context = setThreeContext();

	function animate() {
		if (context.scene && context.renderer && context.camera) {
			context.renderer.render(context.scene, context.camera);
		}
	}
		 
	onMount(() => {
		context.scene = new THREE.Scene();
		context.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		context.renderer.setSize(width, height);
		context.renderer.setAnimationLoop(animate);

		if (container) {
			container.appendChild(context.renderer.domElement);
		}
	});

	$effect(() => {
		if (context.renderer) {
			context.renderer.setPixelRatio(dpr);
			context.renderer.setSize(width, height);
		}
	});
</script>

<style>
	div {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
	}
</style>

<div bind:this={container} aria-hidden="true"></div>

{#if context.scene}
	{@render children?.()}
{/if}
