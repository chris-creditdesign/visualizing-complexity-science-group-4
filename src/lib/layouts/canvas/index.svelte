<script lang="ts">
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { setCanvasContext } from "./create-canvas-context.svelte";

	interface Props {
		key: string;
		width: number;
		height: number;
		dpr: number;
		paddingLeft: number;
		paddingTop: number;
		children: Snippet;
	
	}
	let { key, width, height, dpr, paddingLeft, paddingTop, children }: Props = $props();

	const { lineDrawFunctions, circleDrawFunctions, textDrawFunctions, linkDrawFunctions } = setCanvasContext(key);

	let canvas: HTMLCanvasElement | null = $state(null);
	let ctx: CanvasRenderingContext2D;

	onMount(() => {
		if (canvas) {
			let thisContext = canvas.getContext("2d");
			if (thisContext) {
				ctx = thisContext;
			} else {
				console.log("Could not get 2d context from canvas");
				throw new Error("Could not get 2d context from canvas");
			}
		}
	});

	$effect(() => {
		ctx.clearRect(0, 0, width * dpr, height * dpr);
		ctx.save();
		ctx.scale(dpr, dpr);

		ctx.translate(paddingLeft, paddingTop);

		linkDrawFunctions.forEach((drawFn) => {
			drawFn(ctx);
		});

		circleDrawFunctions.forEach((drawFn) => {
			drawFn(ctx);
		});

		lineDrawFunctions.forEach((drawFn) => {
			drawFn(ctx);
		});
		
		textDrawFunctions.forEach((drawFn) => {
			drawFn(ctx);
		});

		ctx.restore();
	});
</script>

<style>
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: auto;
		pointer-events: none;
	}
</style>

<canvas
	bind:this={canvas}
	width={width * dpr}
	height={height * dpr}
	aria-hidden="true"
>
</canvas>

{@render children?.()}
