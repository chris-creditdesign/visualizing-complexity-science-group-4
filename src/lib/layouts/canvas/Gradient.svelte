<script lang="ts">
	import { onMount } from "svelte";
	import { getCanvasContext } from "./create-canvas-context.svelte";

	type Props = {
		key: string;
		x: number;
		y: number;
		width: number;
		height: number;
		colors: string[];
	};
	let { key, x, y, width, height, colors }: Props = $props();

	const { circleDrawFunctions } = getCanvasContext(key);

	onMount(() => {
		circleDrawFunctions.push(drawFn);

		return () => {
			circleDrawFunctions.splice(circleDrawFunctions.indexOf(drawFn), 1);
		};
	});

	const drawFn = (ctx: CanvasRenderingContext2D) => {
		ctx.save();
		const gradient = ctx.createLinearGradient(20, 0, 220, 0);
		// Add three color stops
		colors.forEach((color, index) => {
			gradient.addColorStop(index / (colors.length - 1), color);
		});
		// Set the fill style and draw a rectangle
		ctx.fillStyle = gradient;
		ctx.fillRect(x, y, width, height);
		ctx.restore();
	};
</script>
